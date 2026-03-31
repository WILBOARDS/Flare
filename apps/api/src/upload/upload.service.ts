import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('cloudinary.cloudName'),
      api_key: this.configService.get<string>('cloudinary.apiKey'),
      api_secret: this.configService.get<string>('cloudinary.apiSecret'),
    });
  }

  generateSignature(): {
    timestamp: number;
    signature: string;
    cloudName: string;
    apiKey: string;
    folder: string;
  } {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'flare/posts';
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      this.configService.get<string>('cloudinary.apiSecret')!,
    );

    return {
      timestamp,
      signature,
      cloudName: this.configService.get<string>('cloudinary.cloudName')!,
      apiKey: this.configService.get<string>('cloudinary.apiKey')!,
      folder,
    };
  }
}
