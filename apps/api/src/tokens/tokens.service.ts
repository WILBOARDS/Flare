import {
  Injectable,
  Inject,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { BLOCKCHAIN_PROVIDER } from './blockchain.provider';
import { CreatorTokenEntity } from '../entities/creator-token.entity';
import { UserEntity } from '../entities/user.entity';

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

const FACTORY_ABI = [
  'function createToken(string name, string symbol, address owner) returns (address)',
  'event TokenCreated(address indexed tokenAddress, address indexed creator, string name, string symbol)',
];

@Injectable()
export class TokensService {
  constructor(
    @Inject(BLOCKCHAIN_PROVIDER)
    private readonly provider: ethers.JsonRpcProvider,
    private readonly configService: ConfigService,
    @InjectRepository(CreatorTokenEntity)
    private readonly creatorTokenRepo: Repository<CreatorTokenEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly dataSource: DataSource,
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

  async mintCreatorToken(
    userId: string,
    name: string,
    symbol: string,
  ): Promise<{ contractAddress: string; txHash: string }> {
    const user = await this.userRepo.findOneByOrFail({ id: userId });

    if (user.creatorTokenAddress) {
      throw new BadRequestException('You have already launched a creator token');
    }

    const adminKey = this.configService.get<string>('blockchain.adminPrivateKey');
    const factoryAddress = this.configService.get<string>('blockchain.creatorFactoryAddress');

    if (!adminKey || !factoryAddress || !user.walletAddress) {
      throw new InternalServerErrorException('Blockchain configuration incomplete');
    }

    const signer = new ethers.Wallet(adminKey, this.provider);
    const factory = new ethers.Contract(factoryAddress, FACTORY_ABI, signer);

    let contractAddress: string;
    let txHash: string;

    try {
      const tx: ethers.ContractTransactionResponse = await factory.createToken(
        name,
        symbol,
        user.walletAddress,
      );
      const receipt = await tx.wait();
      if (!receipt) throw new Error('No receipt');
      txHash = receipt.hash;

      // Parse TokenCreated event
      const iface = new ethers.Interface(FACTORY_ABI);
      let found = false;
      for (const log of receipt.logs) {
        try {
          const parsed = iface.parseLog({ topics: log.topics as string[], data: log.data });
          if (parsed?.name === 'TokenCreated') {
            contractAddress = parsed.args[0] as string;
            found = true;
            break;
          }
        } catch {}
      }
      if (!found) throw new Error('TokenCreated event not found in receipt');
    } catch (err) {
      throw new InternalServerErrorException(`Token deployment failed: ${(err as Error).message}`);
    }

    // Persist in DB
    await this.dataSource.transaction(async (manager) => {
      await manager.save(CreatorTokenEntity, {
        creatorId: userId,
        contractAddress: contractAddress!,
        name,
        symbol,
        txHash,
      });
      await manager.update(UserEntity, { id: userId }, { creatorTokenAddress: contractAddress! });
    });

    return { contractAddress: contractAddress!, txHash };
  }
}
