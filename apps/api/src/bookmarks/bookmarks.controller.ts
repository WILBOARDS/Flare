import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';

@Controller('bookmarks')
@UseGuards(SupabaseAuthGuard)
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post(':postId')
  @HttpCode(HttpStatus.CREATED)
  save(@Req() req: any, @Param('postId') postId: string) {
    return this.bookmarksService.save(req.user.id, postId);
  }

  @Delete(':postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  unsave(@Req() req: any, @Param('postId') postId: string) {
    return this.bookmarksService.unsave(req.user.id, postId);
  }

  @Get()
  getSavedFeed(
    @Req() req: any,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.bookmarksService.getSavedFeed(
      req.user.id,
      cursor,
      limit ? parseInt(limit, 10) : undefined,
    );
  }
}
