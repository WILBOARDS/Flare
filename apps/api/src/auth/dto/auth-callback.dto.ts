import { IsString, IsNotEmpty } from 'class-validator';

export class AuthCallbackDto {
  @IsString()
  @IsNotEmpty()
  access_token: string;
}
