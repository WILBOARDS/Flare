import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokensService } from './tokens.service';
import { TokensController } from './tokens.controller';
import { blockchainProvider } from './blockchain.provider';
import { CreatorTokenEntity } from '../entities/creator-token.entity';
import { UserEntity } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CreatorTokenEntity, UserEntity])],
  providers: [TokensService, blockchainProvider],
  controllers: [TokensController],
})
export class TokensModule {}
