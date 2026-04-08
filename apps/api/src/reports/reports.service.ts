import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportEntity } from '../entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ReportEntity)
    private readonly repo: Repository<ReportEntity>,
  ) {}

  async create(reporterId: string, dto: CreateReportDto): Promise<ReportEntity> {
    if (!dto.postId && !dto.reportedUserId) {
      throw new BadRequestException('Must provide postId or reportedUserId');
    }
    return this.repo.save(
      this.repo.create({
        reporterId,
        postId: dto.postId ?? null,
        reportedUserId: dto.reportedUserId ?? null,
        reason: dto.reason,
        details: dto.details ?? null,
      }),
    );
  }
}
