import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookmarkEntity } from '../entities/bookmark.entity';
import { PostEntity } from '../entities/post.entity';

export interface SavedFeedResponse {
  posts: PostEntity[];
  nextCursor: string | undefined;
  hasMore: boolean;
}

@Injectable()
export class BookmarksService {
  constructor(
    @InjectRepository(BookmarkEntity)
    private readonly bookmarkRepo: Repository<BookmarkEntity>,
  ) {}

  async save(userId: string, postId: string): Promise<void> {
    try {
      await this.bookmarkRepo.insert({ userId, postId });
    } catch (err: any) {
      if (err.code === '23505') return;
      throw err;
    }
  }

  async unsave(userId: string, postId: string): Promise<void> {
    await this.bookmarkRepo.delete({ userId, postId });
  }

  async getSavedFeed(
    userId: string,
    cursor?: string,
    limit = 20,
  ): Promise<SavedFeedResponse> {
    const qb = this.bookmarkRepo
      .createQueryBuilder('bookmark')
      .innerJoinAndSelect('bookmark.post', 'post')
      .innerJoinAndSelect('post.author', 'author')
      .where('bookmark.userId = :userId', { userId })
      .orderBy('bookmark.createdAt', 'DESC')
      .take(limit + 1);

    if (cursor) {
      const decoded = Buffer.from(cursor, 'base64url').toString('utf-8');
      qb.andWhere('bookmark.createdAt < :cursor', { cursor: decoded });
    }

    const bookmarks = await qb.getMany();
    const hasMore = bookmarks.length > limit;
    if (hasMore) bookmarks.pop();

    const nextCursor =
      hasMore && bookmarks.length > 0
        ? Buffer.from(bookmarks[bookmarks.length - 1].createdAt.toISOString()).toString('base64url')
        : undefined;

    return {
      posts: bookmarks.map((b) => b.post),
      nextCursor,
      hasMore,
    };
  }
}
