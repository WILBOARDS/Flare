import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface TrendingTag {
  tag: string;
  postCount: number;
}

export interface HashtagFeedResponse {
  posts: any[];
  nextCursor: string | undefined;
  hasMore: boolean;
}

@Injectable()
export class HashtagsService {
  constructor(private readonly dataSource: DataSource) {}

  async extractAndSave(postId: string, content: string): Promise<void> {
    const regex = /#(\w{1,100})/g;
    const tags = new Set<string>();
    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
      tags.add(match[1].toLowerCase());
    }
    if (tags.size === 0) return;

    for (const tag of tags) {
      const [{ id: hashtagId }] = await this.dataSource.query(
        `INSERT INTO hashtags (tag) VALUES ($1) ON CONFLICT (tag) DO UPDATE SET tag = EXCLUDED.tag RETURNING id`,
        [tag],
      );
      await this.dataSource.query(
        `INSERT INTO post_hashtags (post_id, hashtag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [postId, hashtagId],
      );
    }
  }

  async getTrending(limit = 10): Promise<TrendingTag[]> {
    const rows = await this.dataSource.query(
      `SELECT h.tag, COUNT(ph.post_id)::int AS "postCount"
       FROM post_hashtags ph
       JOIN hashtags h ON h.id = ph.hashtag_id
       JOIN posts p ON p.id = ph.post_id
       WHERE p.created_at > NOW() - INTERVAL '7 days'
       GROUP BY h.tag
       ORDER BY COUNT(ph.post_id) DESC
       LIMIT $1`,
      [limit],
    );
    return rows;
  }

  async getFeedByTag(
    tag: string,
    cursor?: string,
    limit = 20,
    currentUserId?: string,
  ): Promise<HashtagFeedResponse> {
    const normalizedTag = tag.toLowerCase();
    // $1 = tag, $2 = limit+1, $3 = currentUserId (NULL when unauthenticated)
    const params: any[] = [normalizedTag, limit + 1, currentUserId ?? null];

    let cursorClause = '';
    if (cursor) {
      const decoded = Buffer.from(cursor, 'base64url').toString('utf-8');
      params.push(decoded);
      cursorClause = `AND p.created_at < $${params.length}`;
    }

    const rows = await this.dataSource.query(
      `SELECT p.id, p.author_id AS "authorId", p.content, p.image_url AS "imageUrl",
              p.like_count AS "likeCount", p.comment_count AS "commentCount",
              p.view_count AS "viewCount",
              p.is_token_gated AS "isTokenGated",
              p.required_token_address AS "requiredTokenAddress",
              p.created_at AS "createdAt", p.updated_at AS "updatedAt",
              u.id AS "author_id", u.username AS "author_username",
              u.display_name AS "author_displayName", u.avatar_url AS "author_avatarUrl",
              COALESCE((SELECT TRUE FROM likes l WHERE l.post_id = p.id AND l.user_id = $3), FALSE) AS "isLiked",
              COALESCE((SELECT TRUE FROM bookmarks b WHERE b.post_id = p.id AND b.user_id = $3), FALSE) AS "isBookmarked"
       FROM post_hashtags ph
       JOIN hashtags h ON h.id = ph.hashtag_id
       JOIN posts p ON p.id = ph.post_id
       JOIN users u ON u.id = p.author_id
       WHERE h.tag = $1 ${cursorClause}
       ORDER BY p.created_at DESC
       LIMIT $2`,
      params,
    );

    const hasMore = rows.length > limit;
    if (hasMore) rows.pop();

    const posts = rows.map((r: any) => ({
      id: r.id,
      authorId: r.authorId,
      content: r.content,
      imageUrl: r.imageUrl,
      likeCount: r.likeCount,
      commentCount: r.commentCount,
      viewCount: r.viewCount,
      isTokenGated: r.isTokenGated,
      requiredTokenAddress: r.requiredTokenAddress,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      isLiked: r.isLiked,
      isBookmarked: r.isBookmarked,
      author: {
        id: r.author_id,
        username: r.author_username,
        displayName: r.author_displayName,
        avatarUrl: r.author_avatarUrl,
      },
    }));

    const nextCursor =
      hasMore && posts.length > 0
        ? Buffer.from(new Date(posts[posts.length - 1].createdAt).toISOString()).toString('base64url')
        : undefined;

    return { posts, nextCursor, hasMore };
  }

  async searchTags(q: string, limit = 10): Promise<{ tag: string; postCount: number }[]> {
    const rows = await this.dataSource.query(
      `SELECT h.tag, COUNT(*)::int AS "postCount"
       FROM hashtags h
       JOIN post_hashtags ph ON ph.hashtag_id = h.id
       WHERE h.tag ILIKE $1
       GROUP BY h.tag
       ORDER BY COUNT(*) DESC
       LIMIT $2`,
      [`${q.toLowerCase()}%`, limit],
    );
    return rows;
  }
}
