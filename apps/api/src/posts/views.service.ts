import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ViewsService {
  constructor(private readonly dataSource: DataSource) {}

  async recordView(postId: string, viewerId: string): Promise<void> {
    const rows = await this.dataSource.query(
      `INSERT INTO post_views (post_id, viewer_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING 1`,
      [postId, viewerId],
    );
    if (rows.length > 0) {
      await this.dataSource.query(
        `UPDATE posts SET view_count = view_count + 1 WHERE id = $1`,
        [postId],
      );
    }
  }
}
