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
import { RepostsService } from './reposts.service';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '../entities/user.entity';

@Controller('posts/:postId/repost')
@UseGuards(SupabaseAuthGuard)
export class RepostsController {
  constructor(private readonly repostsService: RepostsService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  repost(
    @CurrentUser() user: UserEntity,
    @Param('postId', ParseUUIDPipe) postId: string,
  ) {
    return this.repostsService.repost(user.id, postId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  unrepost(
    @CurrentUser() user: UserEntity,
    @Param('postId', ParseUUIDPipe) postId: string,
  ) {
    return this.repostsService.unrepost(user.id, postId);
  }
}
