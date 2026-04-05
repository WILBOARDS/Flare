import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RepostEntity } from '../entities/repost.entity';
import { PostEntity } from '../entities/post.entity';

@Injectable()
export class RepostsService {
  constructor(
    @InjectRepository(RepostEntity)
    private readonly repostRepo: Repository<RepostEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async repost(userId: string, postId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      try {
        await manager.insert(RepostEntity, { userId, postId });
      } catch (err: any) {
        if (err.code === '23505') throw new ConflictException('Already reposted');
        throw err;
      }
      await manager.increment(PostEntity, { id: postId }, 'repostCount', 1);
    });
  }

  async unrepost(userId: string, postId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const result = await manager.delete(RepostEntity, { userId, postId });
      if (result.affected === 0) throw new NotFoundException('Repost not found');
      await manager.decrement(PostEntity, { id: postId }, 'repostCount', 1);
    });
  }
}
