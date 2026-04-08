import { Controller, Get, Patch, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { SaveWalletDto } from './dto/save-wallet.dto';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '../entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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

  @Post('me/wallet')
  @UseGuards(SupabaseAuthGuard)
  saveWallet(@CurrentUser() user: UserEntity, @Body() dto: SaveWalletDto) {
    return this.usersService.saveWallet(user.id, dto.walletAddress, dto.encryptedKeystore);
  }

  @Get('me/keystore')
  @UseGuards(SupabaseAuthGuard)
  async getKeystore(@CurrentUser() user: UserEntity) {
    const encryptedKeystore = await this.usersService.getKeystore(user.id);
    return { encryptedKeystore };
  }

  @Get('search')
  @UseGuards(OptionalAuthGuard)
  search(
    @Query('q') q: string,
    @CurrentUser() user: UserEntity | null,
  ) {
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
