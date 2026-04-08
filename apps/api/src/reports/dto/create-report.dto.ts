import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateReportDto {
  @IsOptional()
  @IsUUID()
  postId?: string;

  @IsOptional()
  @IsUUID()
  reportedUserId?: string;

  @IsString()
  @IsIn(['spam', 'harassment', 'misinformation', 'inappropriate', 'other'])
  reason: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  details?: string;
}
