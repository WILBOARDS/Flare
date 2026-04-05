import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { FollowEntity } from '../entities/follow.entity';
import { UpdateUserDto } from './dto/update-user.dto';

export interface UserWithMeta extends UserEntity {
  isFollowing?: boolean;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepo: Repository<FollowEntity>,
  ) {}

  async upsertFromSupabase(data: {
    supabaseId: string;
    email?: string;
    displayName?: string;
    avatarUrl?: string;
  }): Promise<UserEntity> {
    const existing = await this.repo.findOne({
      where: { supabaseId: data.supabaseId },
    });

    if (existing) {
      if (data.email && !existing.email) existing.email = data.email;
      return this.repo.save(existing);
    }

    const user = this.repo.create({
      supabaseId: data.supabaseId,
      email: data.email ?? null,
      displayName: data.displayName ?? null,
      avatarUrl: data.avatarUrl ?? null,
    });
    return this.repo.save(user);
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByUsername(username: string, viewerId?: string | null): Promise<UserWithMeta> {
    const user = await this.repo.findOne({ where: { username } });
    if (!user) throw new NotFoundException(`User @${username} not found`);
    const [withMeta] = await this.attachIsFollowing([user], viewerId ?? null);
    return withMeta;
  }

  async search(query: string, viewerId: string | null, limit = 20): Promise<UserWithMeta[]> {
    const q = `%${query.trim()}%`;
    const users = await this.repo
      .createQueryBuilder('u')
      .where('u.username IS NOT NULL')
      .andWhere('(u.username ILIKE :q OR u.display_name ILIKE :q)', { q })
      .orderBy('u.follower_count', 'DESC')
      .take(limit)
      .getMany();

    return this.attachIsFollowing(users, viewerId);
  }

  async discover(viewerId: string | null, limit = 20): Promise<UserWithMeta[]> {
    let users: UserEntity[];

    if (!viewerId) {
      // Unauthenticated: just top users by follower count
      users = await this.repo
        .createQueryBuilder('u')
        .where('u.username IS NOT NULL')
        .orderBy('u.follower_count', 'DESC')
        .take(limit)
        .getMany();
    } else {
      // Usage-based algorithm:
      // score = (mutual_follows * 3) + (liked_creators * 2) + LN(follower_count + 1)
      //
      // mutual_follows: people who follow someone you follow AND also follow this candidate
      // liked_creators: you liked a post by this person but don't follow them yet
      const rows: UserEntity[] = await this.repo.manager.query(
        `
        SELECT u.*,
          (
            COALESCE((
              SELECT COUNT(*)
              FROM follows f1
              INNER JOIN follows f2
                ON f2.follower_id = f1.following_id
               AND f2.following_id = u.id
              WHERE f1.follower_id = $1
            ), 0) * 3
            +
            COALESCE((
              SELECT COUNT(*)
              FROM likes l
              INNER JOIN posts p ON p.id = l.post_id AND p.author_id = u.id
              WHERE l.user_id = $1
            ), 0) * 2
            +
            LN(u.follower_count + 1)
          ) AS score
        FROM users u
        WHERE u.username IS NOT NULL
          AND u.id != $1
          AND u.id NOT IN (
            SELECT following_id FROM follows WHERE follower_id = $1
          )
        ORDER BY score DESC
        LIMIT $2
        `,
        [viewerId, limit],
      );

      // Map snake_case DB columns back to camelCase entity fields
      users = rows.map((r: any) => {
        const u = new UserEntity();
        u.id = r.id;
        u.supabaseId = r.supabase_id;
        u.email = r.email;
        u.username = r.username;
        u.displayName = r.display_name;
        u.bio = r.bio;
        u.avatarUrl = r.avatar_url;
        u.walletAddress = r.wallet_address;
        u.followerCount = parseInt(r.follower_count, 10);
        u.followingCount = parseInt(r.following_count, 10);
        u.creatorTokenAddress = r.creator_token_address;
        u.createdAt = r.created_at;
        u.updatedAt = r.updated_at;
        return u;
      });
    }

    return this.attachIsFollowing(users, viewerId);
  }

  private async attachIsFollowing(users: UserEntity[], viewerId: string | null): Promise<UserWithMeta[]> {
    if (!viewerId || users.length === 0) {
      return users.map((u) => ({ ...u, isFollowing: false }));
    }
    const ids = users.map((u) => u.id);
    const follows = await this.followRepo
      .createQueryBuilder('f')
      .where('f.follower_id = :viewerId', { viewerId })
      .andWhere('f.following_id IN (:...ids)', { ids })
      .getMany();
    const followingSet = new Set(follows.map((f) => f.followingId));
    return users.map((u) => ({ ...u, isFollowing: followingSet.has(u.id) }));
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.username && dto.username !== user.username) {
      const taken = await this.repo.findOne({ where: { username: dto.username } });
      if (taken) throw new ConflictException('Username already taken');
    }

    Object.assign(user, dto);
    return this.repo.save(user);
  }
}
