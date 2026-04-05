import { Controller, Post, UseGuards } from '@nestjs/common';
import { UploadService } from './upload.service';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';

@Controller('upload')
@UseGuards(SupabaseAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('signature')
  getSignature() {
    return this.uploadService.generateSignature();
  }
}
