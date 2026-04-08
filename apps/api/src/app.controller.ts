import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller()
export class AppController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  healthCheck() {
    return { status: 'ok', service: 'flare-api' };
  }

  @Get('stats')
  async getStats() {
    const [usersResult, postsResult, tokensResult] = await Promise.all([
      this.dataSource.query(
        `SELECT COUNT(*)::int AS count FROM users WHERE username IS NOT NULL`,
      ),
      this.dataSource.query(`SELECT COUNT(*)::int AS count FROM posts`),
      this.dataSource.query(`SELECT COUNT(*)::int AS count FROM creator_tokens`),
    ]);
    return {
      totalUsers: usersResult[0]?.count ?? 0,
      totalPosts: postsResult[0]?.count ?? 0,
      totalCreatorTokens: tokensResult[0]?.count ?? 0,
    };
  }
}
