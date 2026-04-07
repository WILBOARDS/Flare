import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { TokensController } from './tokens.controller';
import { blockchainProvider } from './blockchain.provider';

@Module({
  providers: [TokensService, blockchainProvider],
  controllers: [TokensController],
})
export class TokensModule {}
