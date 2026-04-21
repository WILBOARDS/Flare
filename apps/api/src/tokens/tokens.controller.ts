import { Controller, Get, Post, Param, Body, UseGuards, Req, HttpCode } from '@nestjs/common';
import { IsString, IsNotEmpty, MaxLength, Matches } from 'class-validator';
import { TokensService } from './tokens.service';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';

class MintTokenDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  @Matches(/^[A-Z]{1,10}$/, { message: 'symbol must be 1–10 uppercase letters' })
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
