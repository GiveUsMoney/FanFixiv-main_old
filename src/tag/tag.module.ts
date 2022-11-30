import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagEntity } from '@src/entities/tag.entity';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';

@Module({
  // 태그 repository 사용
  imports: [TypeOrmModule.forFeature([TagEntity])],
  controllers: [TagController],
  providers: [TagService],
})
export class TagModule {}
