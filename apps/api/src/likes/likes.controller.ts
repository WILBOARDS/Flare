import {
  Controller,
  Post,
  Delete,
  Param,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '../entities/user.entity';

@Controller('posts/:postId/like')
@UseGuards(SupabaseAuthGuard)
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  like(
    @CurrentUser() user: UserEntity,
    @Param('postId', ParseUUIDPipe) postId: string,
  ) {
    return this.likesService.like(user.id, postId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  unlike(
    @CurrentUser() user: UserEntity,
    @Param('postId', ParseUUIDPipe) postId: string,
  ) {
    return this.likesService.unlike(user.id, postId);
  }
}
