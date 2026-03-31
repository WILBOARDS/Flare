import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { FollowEntity } from '../entities/follow.entity';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(FollowEntity)
    private readonly followRepo: Repository<FollowEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async follow(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    await this.dataSource.transaction(async (manager) => {
      try {
        await manager.insert(FollowEntity, { followerId, followingId });
      } catch (err: any) {
        if (err.code === '23505') throw new ConflictException('Already following');
        throw err;
      }
      await manager.increment(UserEntity, { id: followerId }, 'followingCount', 1);
      await manager.increment(UserEntity, { id: followingId }, 'followerCount', 1);
    });
  }

  async unfollow(followerId: string, followingId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const result = await manager.delete(FollowEntity, { followerId, followingId });
      if (result.affected === 0) throw new NotFoundException('Not following this user');
      await manager.decrement(UserEntity, { id: followerId }, 'followingCount', 1);
      await manager.decrement(UserEntity, { id: followingId }, 'followerCount', 1);
    });
  }

  async getFollowers(userId: string): Promise<FollowEntity[]> {
    return this.followRepo.find({
      where: { followingId: userId },
      relations: ['follower'],
    });
  }

  async getFollowing(userId: string): Promise<FollowEntity[]> {
    return this.followRepo.find({
      where: { followerId: userId },
      relations: ['following'],
    });
  }
}
