import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { BLOCKCHAIN_PROVIDER } from './blockchain.provider';

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

@Injectable()
export class TokensService {
  constructor(
    @Inject(BLOCKCHAIN_PROVIDER)
    private readonly provider: ethers.JsonRpcProvider,
    private readonly configService: ConfigService,
  ) {}

  async getFlcBalance(address: string): Promise<{
    address: string;
    balance: string;
    decimals: number;
    symbol: string;
  }> {
    const tokenAddress = this.configService.get<string>('blockchain.flcTokenAddress');
    const contract = new ethers.Contract(tokenAddress!, ERC20_ABI, this.provider);
    const [balance, decimals, symbol] = await Promise.all([
      contract.balanceOf(address) as Promise<bigint>,
      contract.decimals() as Promise<number>,
      contract.symbol() as Promise<string>,
    ]);

    return {
      address,
      balance: balance.toString(),
      decimals,
      symbol,
    };
  }
}
