import { Controller, Get, Post, Param, Body, UseGuards, Req, HttpCode } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';

class MintTokenDto {
  name: string;
  symbol: string;
}

@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Get('flc/balance/:address')
  getFlcBalance(@Param('address') address: string) {
    return this.tokensService.getFlcBalance(address);
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('mint')
  @HttpCode(201)
  mintToken(@Req() req: any, @Body() dto: MintTokenDto) {
    return this.tokensService.mintCreatorToken(req.user.id, dto.name, dto.symbol);
  }
}
