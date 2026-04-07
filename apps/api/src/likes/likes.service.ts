import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { LikeEntity } from '../entities/like.entity';
import { PostEntity } from '../entities/post.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(LikeEntity)
    private readonly likeRepo: Repository<LikeEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async like(userId: string, postId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      try {
        await manager.insert(LikeEntity, { userId, postId });
      } catch (err: any) {
        if (err.code === '23505') throw new ConflictException('Already liked');
        throw err;
      }
      await manager.increment(PostEntity, { id: postId }, 'likeCount', 1);
    });
  }

  async unlike(userId: string, postId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const result = await manager.delete(LikeEntity, { userId, postId });
      if (result.affected === 0) throw new NotFoundException('Like not found');
      await manager.decrement(PostEntity, { id: postId }, 'likeCount', 1);
    });
  }
}
