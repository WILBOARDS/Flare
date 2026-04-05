import { Controller, Get, Param } from '@nestjs/common';
import { TokensService } from './tokens.service';

@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Get('flc/balance/:address')
  getFlcBalance(@Param('address') address: string) {
    return this.tokensService.getFlcBalance(address);
  }
}
