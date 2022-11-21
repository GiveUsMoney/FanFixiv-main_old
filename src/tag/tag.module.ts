import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtistProfileEntity } from '@src/entities/artist-profile.entity';
import { TagEntity } from '@src/entities/tag.entity';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';

@Module({
  // 태그 repository 사용
  imports: [TypeOrmModule.forFeature([TagEntity, ArtistProfileEntity])],
  controllers: [TagController],
  providers: [TagService],
})
export class TagModule {}
