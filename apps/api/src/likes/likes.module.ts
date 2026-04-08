import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikeEntity } from '../entities/like.entity';
import { PostEntity } from '../entities/post.entity';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([LikeEntity, PostEntity]), UsersModule, NotificationsModule],
  providers: [LikesService],
  controllers: [LikesController],
})
export class LikesModule {}
