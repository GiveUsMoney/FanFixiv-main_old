import { Module } from '@nestjs/common';
import { ProfileImgController } from './profile-img.controller';

@Module({
  controllers: [ProfileImgController],
})
export class ProfileImgModule {}
