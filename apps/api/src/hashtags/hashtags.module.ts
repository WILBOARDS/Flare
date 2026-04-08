import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HashtagEntity } from '../entities/hashtag.entity';
import { HashtagsService } from './hashtags.service';
import { HashtagsController } from './hashtags.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HashtagEntity])],
  providers: [HashtagsService],
  controllers: [HashtagsController],
  exports: [HashtagsService],
})
export class HashtagsModule {}
