import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentEntity } from '@src/entities/content.entity';
import { SeriesEntity } from '@src/entities/series.entity';
import { SeriesController } from './series.controller';
import { SeriesService } from './series.service';

@Module({
  imports: [TypeOrmModule.forFeature([ContentEntity, SeriesEntity])],
  controllers: [SeriesController],
  providers: [SeriesService],
})
export class SeriesModule {}
