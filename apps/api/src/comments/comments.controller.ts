import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '../entities/user.entity';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  findAll(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.commentsService.findByPost(postId, limit ? parseInt(limit, 10) : 50, cursor);
  }

  @Post()
  @UseGuards(SupabaseAuthGuard)
  create(
    @Param('postId', ParseUUIDPipe) postId: string,
    @CurrentUser() user: UserEntity,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(postId, user.id, dto);
  }

  @Delete(':commentId')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.commentsService.delete(commentId, user.id);
  }
}
