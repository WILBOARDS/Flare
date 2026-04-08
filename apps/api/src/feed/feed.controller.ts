import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { FeedService } from './feed.service';
import { TrendingService } from './trending.service';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '../entities/user.entity';

@Controller('feed')
export class FeedController {
  constructor(
    private readonly feedService: FeedService,
    private readonly trendingService: TrendingService,
  ) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  getFeed(
    @CurrentUser() user: UserEntity | undefined,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.feedService.getFeed(
      user?.id ?? null,
      cursor,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('trending')
  @UseGuards(OptionalAuthGuard)
  getTrending(
    @CurrentUser() user: UserEntity | undefined,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const offset = cursor ? parseInt(Buffer.from(cursor, 'base64url').toString()) : 0;
    return this.trendingService.getTrending(
      user?.id,
      limit ? parseInt(limit, 10) : 20,
      offset,
    );
  }

  @Get('user/:username/liked')
  @UseGuards(OptionalAuthGuard)
  getUserLikedFeed(
    @Param('username') username: string,
    @CurrentUser() user: UserEntity | undefined,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.feedService.getUserLikedFeed(
      username,
      user?.id ?? null,
      cursor,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('user/:username')
  @UseGuards(OptionalAuthGuard)
  getUserFeed(
    @Param('username') username: string,
    @CurrentUser() user: UserEntity | undefined,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.feedService.getUserFeed(
      username,
      user?.id ?? null,
      cursor,
      limit ? parseInt(limit, 10) : 20,
    );
  }
}
