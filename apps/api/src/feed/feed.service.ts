import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PostEntity } from '../entities/post.entity';
import { UserEntity } from '../entities/user.entity';
import { LikeEntity } from '../entities/like.entity';
import { BookmarkEntity } from '../entities/bookmark.entity';
import { RepostEntity } from '../entities/repost.entity';

export interface FeedResponse {
  posts: (PostEntity & { isLiked: boolean; isBookmarked: boolean; isReposted: boolean })[];
  nextCursor: string | undefined;
  hasMore: boolean;
}

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepo: Repository<PostEntity>,
    @InjectRepository(LikeEntity)
    private readonly likeRepo: Repository<LikeEntity>,
    @InjectRepository(BookmarkEntity)
    private readonly bookmarkRepo: Repository<BookmarkEntity>,
    @InjectRepository(RepostEntity)
    private readonly repostRepo: Repository<RepostEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async getFeed(
    currentUserId: string | null,
    cursor?: string,
    limit = 20,
  ): Promise<FeedResponse> {
    const qb = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .orderBy('post.createdAt', 'DESC')
      .take(limit + 1);

    if (cursor) {
      const decoded = Buffer.from(cursor, 'base64url').toString('utf-8');
      qb.where('post.createdAt < :cursor', { cursor: decoded });
    }

    const posts = await qb.getMany();
    const hasMore = posts.length > limit;
    if (hasMore) posts.pop();

    const postIds = posts.map((p) => p.id);
    const [likedPostIds, bookmarkedPostIds, repostedPostIds] = await Promise.all([
      this.getLikedPostIds(currentUserId, postIds),
      this.getBookmarkedPostIds(currentUserId, postIds),
      this.getRepostedPostIds(currentUserId, postIds),
    ]);

    const nextCursor =
      hasMore && posts.length > 0
        ? Buffer.from(posts[posts.length - 1].createdAt.toISOString()).toString('base64url')
        : undefined;

    return {
      posts: posts.map((p) => ({
        ...p,
        isLiked: likedPostIds.has(p.id),
        isBookmarked: bookmarkedPostIds.has(p.id),
        isReposted: repostedPostIds.has(p.id),
      })),
      nextCursor,
      hasMore,
    };
  }

  async getUserFeed(
    username: string,
    currentUserId: string | null,
    cursor?: string,
    limit = 20,
  ): Promise<FeedResponse> {
    const qb = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('author.username = :username', { username })
      .orderBy('post.createdAt', 'DESC')
      .take(limit + 1);

    if (cursor) {
      const decoded = Buffer.from(cursor, 'base64url').toString('utf-8');
      qb.andWhere('post.createdAt < :cursor', { cursor: decoded });
    }

    const posts = await qb.getMany();
    const hasMore = posts.length > limit;
    if (hasMore) posts.pop();

    const postIds = posts.map((p) => p.id);
    const [likedPostIds, bookmarkedPostIds, repostedPostIds] = await Promise.all([
      this.getLikedPostIds(currentUserId, postIds),
      this.getBookmarkedPostIds(currentUserId, postIds),
      this.getRepostedPostIds(currentUserId, postIds),
    ]);

    const nextCursor =
      hasMore && posts.length > 0
        ? Buffer.from(posts[posts.length - 1].createdAt.toISOString()).toString('base64url')
        : undefined;

    return {
      posts: posts.map((p) => ({
        ...p,
        isLiked: likedPostIds.has(p.id),
        isBookmarked: bookmarkedPostIds.has(p.id),
        isReposted: repostedPostIds.has(p.id),
      })),
      nextCursor,
      hasMore,
    };
  }

  async getTrendingFeed(
    currentUserId: string | null,
    cursor?: string,
    limit = 20,
  ): Promise<FeedResponse> {
    // Cursor encodes "<hotScore>|<postId>" for stable keyset pagination
    let cursorScore: number | null = null;
    let cursorId: string | null = null;
    if (cursor) {
      const decoded = Buffer.from(cursor, 'base64url').toString('utf-8');
      const sepIdx = decoded.lastIndexOf('|');
      if (sepIdx !== -1) {
        cursorScore = parseFloat(decoded.slice(0, sepIdx));
        cursorId = decoded.slice(sepIdx + 1);
      }
    }

    const hasCursor = cursorScore !== null && cursorId !== null;
    const params: (number | string)[] = [limit + 1];
    let cursorClause = '';
    if (hasCursor) {
      params.push(cursorScore as number, cursorId as string);
      cursorClause = `AND (
        (p.like_count * 3.0 / POW(EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600.0 + 2, 1.5)) < $2
        OR (
          (p.like_count * 3.0 / POW(EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600.0 + 2, 1.5)) = $2
          AND p.id < $3
        )
      )`;
    }

    const rawPosts = await this.dataSource.query(
      `
      SELECT
        p.id,
        p.author_id       AS "authorId",
        p.content,
        p.image_url       AS "imageUrl",
        p.image_public_id AS "imagePublicId",
        p.like_count      AS "likeCount",
        p.repost_count    AS "repostCount",
        p.created_at      AS "createdAt",
        p.updated_at      AS "updatedAt",
        u.id              AS "u_id",
        u.username        AS "u_username",
        u.display_name    AS "u_displayName",
        u.avatar_url      AS "u_avatarUrl",
        (p.like_count * 3.0 / POW(EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600.0 + 2, 1.5)) AS "hotScore"
      FROM posts p
      JOIN users u ON u.id = p.author_id
      WHERE p.created_at >= NOW() - INTERVAL '7 days'
      ${cursorClause}
      ORDER BY "hotScore" DESC, p.id DESC
      LIMIT $1
      `,
      params,
    ) as Array<Record<string, unknown>>;

    const hasMore = rawPosts.length > limit;
    if (hasMore) rawPosts.pop();

    const posts = rawPosts.map((r) => {
      const post = new PostEntity();
      post.id = r['id'] as string;
      post.authorId = r['authorId'] as string;
      post.content = r['content'] as string;
      post.imageUrl = (r['imageUrl'] ?? null) as string | null;
      post.imagePublicId = (r['imagePublicId'] ?? null) as string | null;
      post.likeCount = Number(r['likeCount']);
      post.repostCount = Number(r['repostCount'] ?? 0);
      post.createdAt = new Date(r['createdAt'] as string);
      post.updatedAt = new Date(r['updatedAt'] as string);
      const author = new UserEntity();
      author.id = r['u_id'] as string;
      author.username = (r['u_username'] ?? null) as string | null;
      author.displayName = (r['u_displayName'] ?? null) as string | null;
      author.avatarUrl = (r['u_avatarUrl'] ?? null) as string | null;
      post.author = author;
      (post as PostEntity & { hotScore: number }).hotScore = Number(r['hotScore']);
      return post;
    });

    const postIds = posts.map((p) => p.id);
    const [likedPostIds, bookmarkedPostIds, repostedPostIds] = await Promise.all([
      this.getLikedPostIds(currentUserId, postIds),
      this.getBookmarkedPostIds(currentUserId, postIds),
      this.getRepostedPostIds(currentUserId, postIds),
    ]);

    const lastPost = posts[posts.length - 1] as (PostEntity & { hotScore?: number }) | undefined;
    const nextCursor =
      hasMore && lastPost
        ? Buffer.from(`${lastPost.hotScore ?? 0}|${lastPost.id}`).toString('base64url')
        : undefined;

    return {
      posts: posts.map((p) => ({
        ...p,
        isLiked: likedPostIds.has(p.id),
        isBookmarked: bookmarkedPostIds.has(p.id),
        isReposted: repostedPostIds.has(p.id),
      })),
      nextCursor,
      hasMore,
    };
  }

  private async getLikedPostIds(
    userId: string | null,
    postIds: string[],
  ): Promise<Set<string>> {
    if (!userId || postIds.length === 0) return new Set();
    const likes = await this.likeRepo
      .createQueryBuilder('like')
      .where('like.userId = :userId', { userId })
      .andWhere('like.postId IN (:...postIds)', { postIds })
      .getMany();
    return new Set(likes.map((l) => l.postId));
  }

  private async getBookmarkedPostIds(
    userId: string | null,
    postIds: string[],
  ): Promise<Set<string>> {
    if (!userId || postIds.length === 0) return new Set();
    const bookmarks = await this.bookmarkRepo
      .createQueryBuilder('bookmark')
      .where('bookmark.userId = :userId', { userId })
      .andWhere('bookmark.postId IN (:...postIds)', { postIds })
      .getMany();
    return new Set(bookmarks.map((b) => b.postId));
  }

  private async getRepostedPostIds(
    userId: string | null,
    postIds: string[],
  ): Promise<Set<string>> {
    if (!userId || postIds.length === 0) return new Set();
    const reposts = await this.repostRepo
      .createQueryBuilder('repost')
      .where('repost.userId = :userId', { userId })
      .andWhere('repost.postId IN (:...postIds)', { postIds })
      .getMany();
    return new Set(reposts.map((r) => r.postId));
  }
}
