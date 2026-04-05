import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { LikeEntity } from './like.entity';
import { RepostEntity } from './repost.entity';

@Entity('posts')
export class PostEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'author_id', type: 'uuid' })
  authorId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'image_url', type: 'varchar', nullable: true, length: 500 })
  imageUrl: string | null;

  @Column({ name: 'image_public_id', type: 'varchar', nullable: true, length: 255 })
  imagePublicId: string | null;

  @Column({ name: 'like_count', type: 'int', default: 0 })
  likeCount: number;

  @Column({ name: 'repost_count', type: 'int', default: 0 })
  repostCount: number;

  @Index()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: UserEntity;

  @OneToMany(() => LikeEntity, (l) => l.post)
  likes: LikeEntity[];

  @OneToMany(() => RepostEntity, (r) => r.post)
  reposts: RepostEntity[];
}
