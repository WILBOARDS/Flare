import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from '../entities/post.entity';
import { LikeEntity } from '../entities/like.entity';

export interface FeedResponse {
  posts: (PostEntity & { isLiked: boolean })[];
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

    const likedPostIds = await this.getLikedPostIds(currentUserId, posts.map((p) => p.id));

    const nextCursor =
      hasMore && posts.length > 0
        ? Buffer.from(posts[posts.length - 1].createdAt.toISOString()).toString('base64url')
        : undefined;

    return {
      posts: posts.map((p) => ({ ...p, isLiked: likedPostIds.has(p.id) })),
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

    const likedPostIds = await this.getLikedPostIds(currentUserId, posts.map((p) => p.id));

    const nextCursor =
      hasMore && posts.length > 0
        ? Buffer.from(posts[posts.length - 1].createdAt.toISOString()).toString('base64url')
        : undefined;

    return {
      posts: posts.map((p) => ({ ...p, isLiked: likedPostIds.has(p.id) })),
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
}
