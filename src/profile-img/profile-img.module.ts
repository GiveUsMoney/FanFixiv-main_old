import { Module } from '@nestjs/common';
import { ProfileImgController } from './profile-img.controller';
import { ProfileImgService } from './profile-img.service';

@Module({
  controllers: [ProfileImgController],
  providers: [ProfileImgService],
})
export class ProfileImgModule {}
