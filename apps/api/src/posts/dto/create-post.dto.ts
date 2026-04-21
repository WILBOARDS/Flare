import { IsBoolean, IsString, IsNotEmpty, MaxLength, IsOptional, IsUrl, Length, ValidateIf, Matches } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  content: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  imagePublicId?: string;

  @IsOptional()
  @IsBoolean()
  isTokenGated?: boolean;

  @ValidateIf((o) => o.isTokenGated === true)
  @IsNotEmpty({ message: 'requiredTokenAddress is required when isTokenGated is true' })
  @IsString()
  @Length(42, 42, { message: 'requiredTokenAddress must be a 42-character Ethereum address' })
  @Matches(/^0x[0-9a-fA-F]{40}$/, { message: 'requiredTokenAddress must be a valid Ethereum address' })
  requiredTokenAddress?: string;
}
