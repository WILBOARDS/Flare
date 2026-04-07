import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { FollowsService } from './follows.service';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '../entities/user.entity';

@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post(':userId')
  @UseGuards(SupabaseAuthGuard)
  follow(
    @CurrentUser() me: UserEntity,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.followsService.follow(me.id, userId);
  }

  @Delete(':userId')
  @UseGuards(SupabaseAuthGuard)
  unfollow(
    @CurrentUser() me: UserEntity,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.followsService.unfollow(me.id, userId);
  }

  @Get(':userId/followers')
  getFollowers(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.followsService.getFollowers(userId);
  }

  @Get(':userId/following')
  getFollowing(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.followsService.getFollowing(userId);
  }
}
