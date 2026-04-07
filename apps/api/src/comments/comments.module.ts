import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from '../entities/comment.entity';
import { PostEntity } from '../entities/post.entity';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CommentEntity, PostEntity])],
  providers: [CommentsService],
  controllers: [CommentsController],
})
export class CommentsModule {}
