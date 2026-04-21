import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from '../entities/post.entity';
import { LikeEntity } from '../entities/like.entity';
import { BookmarkEntity } from '../entities/bookmark.entity';
import { FeedService } from './feed.service';
import { TrendingService } from './trending.service';
import { FeedController } from './feed.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity, LikeEntity, BookmarkEntity]), UsersModule],
  providers: [FeedService, TrendingService],
  controllers: [FeedController],
})
export class FeedModule {}
