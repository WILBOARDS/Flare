import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { FollowEntity } from '../entities/follow.entity';
import { UsersService } from './users.service';
import { LeaderboardService } from './leaderboard.service';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, FollowEntity])],
  providers: [UsersService, LeaderboardService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
