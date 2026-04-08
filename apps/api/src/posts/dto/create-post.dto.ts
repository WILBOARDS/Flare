import { IsBoolean, IsString, IsNotEmpty, MaxLength, IsOptional, IsUrl, Length } from 'class-validator';

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

  @IsOptional()
  @IsString()
  @Length(42, 42)
  requiredTokenAddress?: string;
}
