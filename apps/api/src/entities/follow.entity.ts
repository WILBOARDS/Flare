import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('follows')
@Unique(['followerId', 'followingId'])
export class FollowEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'follower_id', type: 'uuid' })
  followerId: string;

  @Index()
  @Column({ name: 'following_id', type: 'uuid' })
  followingId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => UserEntity, (u) => u.following, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'follower_id' })
  follower: UserEntity;

  @ManyToOne(() => UserEntity, (u) => u.followers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'following_id' })
  following: UserEntity;
}
