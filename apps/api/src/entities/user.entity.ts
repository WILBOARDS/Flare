import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { PostEntity } from './post.entity';
import { FollowEntity } from './follow.entity';
import { LikeEntity } from './like.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ name: 'supabase_id', type: 'varchar', unique: true })
  supabaseId: string;

  @Column({ name: 'wallet_address', type: 'varchar', nullable: true, length: 42 })
  walletAddress: string | null;

  @Index({ unique: true })
  @Column({ type: 'varchar', nullable: true, unique: true })
  email: string | null;

  @Index({ unique: true })
  @Column({ type: 'varchar', nullable: true, unique: true, length: 30 })
  username: string | null;

  @Column({ name: 'display_name', type: 'varchar', nullable: true, length: 100 })
  displayName: string | null;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ name: 'avatar_url', type: 'varchar', nullable: true, length: 500 })
  avatarUrl: string | null;

  @Column({ name: 'creator_token_address', type: 'varchar', nullable: true, length: 42 })
  creatorTokenAddress: string | null;

  @Column({ name: 'date_of_birth', type: 'varchar', nullable: true, length: 10 })
  dateOfBirth: string | null;

  // Stored encrypted client-side; never returned in default queries
  @Column({ name: 'encrypted_keystore', type: 'text', nullable: true, select: false })
  encryptedKeystore: string | null;

  @Column({ name: 'follower_count', type: 'int', default: 0 })
  followerCount: number;

  @Column({ name: 'following_count', type: 'int', default: 0 })
  followingCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => PostEntity, (post) => post.author)
  posts: PostEntity[];

  @OneToMany(() => FollowEntity, (f) => f.follower)
  following: FollowEntity[];

  @OneToMany(() => FollowEntity, (f) => f.following)
  followers: FollowEntity[];

  @OneToMany(() => LikeEntity, (l) => l.user)
  likes: LikeEntity[];
}
