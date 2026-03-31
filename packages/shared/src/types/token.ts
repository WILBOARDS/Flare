export interface CreatorTokenInfo {
  id: string;
  creatorId: string;
  contractAddress: string;
  name: string;
  symbol: string;
  txHash: string;
  createdAt: string;
}

export interface TokenBalance {
  address: string;
  balance: string;
  decimals: number;
  symbol: string;
}
