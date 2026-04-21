import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from '../entities/post.entity';
import { PostViewEntity } from '../entities/post-view.entity';
import { PostsService } from './posts.service';
import { ViewsService } from './views.service';
import { PostsController } from './posts.controller';
import { UsersModule } from '../users/users.module';
import { HashtagsModule } from '../hashtags/hashtags.module';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity, PostViewEntity]), UsersModule, HashtagsModule],
  providers: [PostsService, ViewsService],
  controllers: [PostsController],
  exports: [PostsService],
})
export class PostsModule {}
