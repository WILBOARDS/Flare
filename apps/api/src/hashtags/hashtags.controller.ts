import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { HashtagsService } from './hashtags.service';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '../entities/user.entity';

@Controller('hashtags')
export class HashtagsController {
  constructor(private readonly hashtagsService: HashtagsService) {}

  @Get('trending')
  getTrending(@Query('limit') limit?: string) {
    return this.hashtagsService.getTrending(limit ? parseInt(limit, 10) : 10);
  }

  @Get('search')
  searchTags(@Query('q') q: string, @Query('limit') limit?: string) {
    return this.hashtagsService.searchTags(q ?? '', limit ? parseInt(limit, 10) : 10);
  }

  @Get(':tag/feed')
  @UseGuards(OptionalAuthGuard)
  getFeedByTag(
    @Param('tag') tag: string,
    @CurrentUser() user: UserEntity | undefined,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.hashtagsService.getFeedByTag(tag, cursor, limit ? parseInt(limit, 10) : 20, user?.id);
  }
}
