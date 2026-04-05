import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { PostEntity } from './post.entity';

@Entity('comments')
export class CommentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'post_id', type: 'uuid' })
  postId: string;

  @Column({ name: 'author_id', type: 'uuid' })
  authorId: string;

  @Column({ type: 'text' })
  content: string;

  @Index()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => PostEntity, (p) => p.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: PostEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'author_id' })
  author: UserEntity;
}
