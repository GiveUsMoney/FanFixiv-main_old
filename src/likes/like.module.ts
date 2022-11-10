import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentEntity } from '@src/entities/content.entity';
import { LikesEntity } from '@src/entities/likes.entity';
import { LikesService } from './like.service';
import { LikesController } from './likes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ContentEntity, LikesEntity])],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
