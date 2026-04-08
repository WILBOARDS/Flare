import { IsString, IsOptional, Matches } from 'class-validator';

export class SaveWalletDto {
  @IsString()
  @Matches(/^0x[0-9a-fA-F]{40}$/, { message: 'walletAddress must be a valid Ethereum address' })
  walletAddress: string;

  // AES-256-GCM encrypted keystore JSON. Generated and encrypted entirely client-side.
  // The server stores it opaquely; the plaintext mnemonic/private key never leaves the browser.
  @IsOptional()
  @IsString()
  encryptedKeystore?: string;
}
