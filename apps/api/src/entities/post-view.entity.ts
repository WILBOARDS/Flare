import { Entity, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('post_views')
export class PostViewEntity {
  @PrimaryColumn({ name: 'post_id' })
  postId: string;

  @PrimaryColumn({ name: 'viewer_id' })
  viewerId: string;

  @CreateDateColumn({ name: 'viewed_at' })
  viewedAt: Date;
}
