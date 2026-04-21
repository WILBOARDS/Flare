import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '../entities/user.entity';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(SupabaseAuthGuard)
  create(@CurrentUser() user: UserEntity, @Body() dto: CreateReportDto) {
    return this.reportsService.create(user.id, dto);
  }
}
