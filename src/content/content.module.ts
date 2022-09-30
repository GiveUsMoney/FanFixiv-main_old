import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from '@src/entities/content.entity';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';

@Module({
  imports: [TypeOrmModule.forFeature([Content])],
  controllers: [ContentController],
  providers: [ContentService],
})
export class ContentModule {}
