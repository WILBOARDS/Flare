import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepostEntity } from '../entities/repost.entity';
import { PostEntity } from '../entities/post.entity';
import { RepostsService } from './reposts.service';
import { RepostsController } from './reposts.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([RepostEntity, PostEntity]), UsersModule],
  providers: [RepostsService],
  controllers: [RepostsController],
})
export class RepostsModule {}
