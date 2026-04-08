import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class TrendingService {
  constructor(private readonly dataSource: DataSource) {}

  async getTrending(currentUserId?: string, limit = 20, offset = 0) {
    const rows = await this.dataSource.query(
      `
      SELECT
        p.id,
        p.content,
        p.image_url          AS "imageUrl",
        p.like_count         AS "likeCount",
        p.comment_count      AS "commentCount",
        COALESCE(p.view_count, 0) AS "viewCount",
        p.created_at         AS "createdAt",
        p.is_token_gated     AS "isTokenGated",
        p.required_token_address AS "requiredTokenAddress",
        u.id                 AS "authorId",
        u.username           AS "authorUsername",
        u.display_name       AS "authorDisplayName",
        u.avatar_url         AS "authorAvatarUrl",
        u.creator_token_address AS "authorCreatorTokenAddress",
        (
          (p.like_count * 3 + p.comment_count * 2 + LN(COALESCE(p.view_count, 0) + 1))
          / POWER(EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600.0 + 2, 1.5)
        ) AS score
      FROM posts p
      JOIN users u ON u.id = p.author_id
      WHERE p.created_at > NOW() - INTERVAL '7 days'
      ORDER BY score DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset],
    );

    let likedPostIds = new Set<string>();
    if (currentUserId && rows.length > 0) {
      const postIds = rows.map((r: any) => r.id);
      const likes = await this.dataSource.query(
        `SELECT post_id FROM likes WHERE user_id = $1 AND post_id = ANY($2)`,
        [currentUserId, postIds],
      );
      likedPostIds = new Set(likes.map((l: any) => l.post_id));
    }

    const posts = rows.map((r: any) => ({
      id: r.id,
      content: r.content,
      imageUrl: r.imageUrl,
      likeCount: r.likeCount,
      commentCount: r.commentCount,
      viewCount: r.viewCount,
      createdAt: r.createdAt,
      isTokenGated: r.isTokenGated,
      requiredTokenAddress: r.requiredTokenAddress,
      isLiked: likedPostIds.has(r.id),
      isBookmarked: false,
      author: {
        id: r.authorId,
        username: r.authorUsername,
        displayName: r.authorDisplayName,
        avatarUrl: r.authorAvatarUrl,
        creatorTokenAddress: r.authorCreatorTokenAddress,
      },
    }));

    const hasMore = rows.length === limit;
    const nextOffset = offset + limit;
    const nextCursor = hasMore
      ? Buffer.from(String(nextOffset)).toString('base64url')
      : undefined;

    return { posts, nextCursor, hasMore };
  }
}
