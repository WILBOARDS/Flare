import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from '../entities/post.entity';
import { LikeEntity } from '../entities/like.entity';
import { BookmarkEntity } from '../entities/bookmark.entity';

export interface FeedResponse {
  posts: (PostEntity & { isLiked: boolean; isBookmarked: boolean })[];
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
    const [likedPostIds, bookmarkedPostIds] = await Promise.all([
      this.getLikedPostIds(currentUserId, postIds),
      this.getBookmarkedPostIds(currentUserId, postIds),
    ]);

    const nextCursor =
      hasMore && posts.length > 0
        ? Buffer.from(posts[posts.length - 1].createdAt.toISOString()).toString('base64url')
        : undefined;

    return {
      posts: posts.map((p) => ({ ...p, isLiked: likedPostIds.has(p.id), isBookmarked: bookmarkedPostIds.has(p.id) })),
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
    const [likedPostIds, bookmarkedPostIds] = await Promise.all([
      this.getLikedPostIds(currentUserId, postIds),
      this.getBookmarkedPostIds(currentUserId, postIds),
    ]);

    const nextCursor =
      hasMore && posts.length > 0
        ? Buffer.from(posts[posts.length - 1].createdAt.toISOString()).toString('base64url')
        : undefined;

    return {
      posts: posts.map((p) => ({ ...p, isLiked: likedPostIds.has(p.id), isBookmarked: bookmarkedPostIds.has(p.id) })),
      nextCursor,
      hasMore,
    };
  }

  async getUserLikedFeed(
    targetUsername: string,
    currentUserId: string | null,
    cursor?: string,
    limit = 20,
  ): Promise<FeedResponse> {
    const qb = this.likeRepo
      .createQueryBuilder('like')
      .innerJoinAndSelect('like.post', 'post')
      .innerJoinAndSelect('post.author', 'author')
      .innerJoin('like.user', 'liker')
      .where('liker.username = :username', { username: targetUsername })
      .orderBy('like.createdAt', 'DESC')
      .take(limit + 1);

    if (cursor) {
      const decoded = Buffer.from(cursor, 'base64url').toString('utf-8');
      qb.andWhere('like.createdAt < :cursor', { cursor: decoded });
    }

    const likes = await qb.getMany();
    const hasMore = likes.length > limit;
    if (hasMore) likes.pop();

    const posts = likes.map((l) => l.post);
    const postIds = posts.map((p) => p.id);
    const [likedPostIds, bookmarkedPostIds] = await Promise.all([
      this.getLikedPostIds(currentUserId, postIds),
      this.getBookmarkedPostIds(currentUserId, postIds),
    ]);

    const nextCursor =
      hasMore && likes.length > 0
        ? Buffer.from(likes[likes.length - 1].createdAt.toISOString()).toString('base64url')
        : undefined;

    return {
      posts: posts.map((p) => ({ ...p, isLiked: likedPostIds.has(p.id), isBookmarked: bookmarkedPostIds.has(p.id) })),
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
}
