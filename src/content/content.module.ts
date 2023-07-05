import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentEntity } from '@src/entities/content.entity';
import { TagEntity } from '@src/entities/tag.entity';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';

@Module({
  imports: [TypeOrmModule.forFeature([ContentEntity, TagEntity])],
  controllers: [ContentController],
  providers: [ContentService],
})
export class ContentModule {}
