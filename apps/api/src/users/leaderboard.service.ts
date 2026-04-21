import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class LeaderboardService {
  constructor(private readonly dataSource: DataSource) {}

  async getLeaderboard(period: 'all' | 'week' = 'all', limit = 50) {
    const periodFilter =
      period === 'week' ? `AND p.created_at > NOW() - INTERVAL '7 days'` : '';

    const rows = await this.dataSource.query(
      `
      SELECT
        u.id,
        u.username,
        u.display_name   AS "displayName",
        u.avatar_url     AS "avatarUrl",
        u.creator_token_address AS "creatorTokenAddress",
        u.follower_count AS "followerCount",
        (
          u.follower_count * 2
          + COALESCE((
              SELECT SUM(p.like_count) FROM posts p
              WHERE p.author_id = u.id ${periodFilter}
            ), 0)
          + COALESCE((
              SELECT SUM(p.comment_count) FROM posts p
              WHERE p.author_id = u.id ${periodFilter}
            ), 0)
        )::int AS "score"
      FROM users u
      WHERE u.username IS NOT NULL
      ORDER BY "score" DESC
      LIMIT $1
      `,
      [limit],
    );

    return rows.map((row: any, i: number) => ({ ...row, rank: i + 1 }));
  }
}
