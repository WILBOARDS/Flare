import { Controller, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { LeaderboardService } from './leaderboard.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '../entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly leaderboardService: LeaderboardService,
  ) {}

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  getMe(@CurrentUser() user: UserEntity) {
    return user;
  }

  @Patch('me')
  @UseGuards(SupabaseAuthGuard)
  updateMe(@CurrentUser() user: UserEntity, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.id, dto);
  }

  @Get('leaderboard')
  getLeaderboard(@Query('period') period?: string) {
    return this.leaderboardService.getLeaderboard(
      period === 'week' ? 'week' : 'all',
      50,
    );
  }

  @Get('search')
  @UseGuards(OptionalAuthGuard)
  search(@Query('q') q: string, @CurrentUser() user: UserEntity | null) {
    if (!q?.trim()) return [];
    return this.usersService.search(q, user?.id ?? null);
  }

  @Get('discover')
  @UseGuards(OptionalAuthGuard)
  discover(@CurrentUser() user: UserEntity | null) {
    return this.usersService.discover(user?.id ?? null);
  }

  @Get(':username')
  @UseGuards(OptionalAuthGuard)
  getByUsername(
    @Param('username') username: string,
    @CurrentUser() viewer: UserEntity | null,
  ) {
    return this.usersService.findByUsername(username, viewer?.id ?? null);
  }
}
