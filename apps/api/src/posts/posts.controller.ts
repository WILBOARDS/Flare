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
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { ViewsService } from './views.service';
import { CreatePostDto } from './dto/create-post.dto';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '../entities/user.entity';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly viewsService: ViewsService,
  ) {}

  @Post()
  @UseGuards(SupabaseAuthGuard)
  create(@CurrentUser() user: UserEntity, @Body() dto: CreatePostDto) {
    return this.postsService.create(user.id, dto);
  }

  @Get('search')
  search(
    @Query('q') q: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    if (!q?.trim() || q.trim().length < 2) {
      return { posts: [], nextCursor: null, hasMore: false };
    }
    return this.postsService.search(q.trim(), cursor, limit ? parseInt(limit, 10) : 20);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.findById(id);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  remove(@CurrentUser() user: UserEntity, @Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.delete(id, user.id);
  }

  @Post(':id/view')
  @HttpCode(204)
  @UseGuards(SupabaseAuthGuard)
  async recordView(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
  ): Promise<void> {
    await this.viewsService.recordView(id, user.id);
  }
}
