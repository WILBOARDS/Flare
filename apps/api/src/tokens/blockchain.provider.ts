import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

export const BLOCKCHAIN_PROVIDER = 'BLOCKCHAIN_PROVIDER';

export const blockchainProvider = {
  provide: BLOCKCHAIN_PROVIDER,
  useFactory: (config: ConfigService) => {
    return new ethers.JsonRpcProvider(config.get<string>('blockchain.rpcUrl'));
  },
  inject: [ConfigService],
};
