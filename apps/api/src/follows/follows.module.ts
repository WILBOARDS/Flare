import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowEntity } from '../entities/follow.entity';
import { UserEntity } from '../entities/user.entity';
import { FollowsService } from './follows.service';
import { FollowsController } from './follows.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([FollowEntity, UserEntity]), UsersModule],
  providers: [FollowsService],
  controllers: [FollowsController],
})
export class FollowsModule {}
