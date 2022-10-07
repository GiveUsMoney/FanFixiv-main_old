import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { ApiTags } from '@nestjs/swagger';
import { ProfileImgService } from './profile-img.service';
import { TempImageStorage } from '@src/common/storage/multer-s3.storage';
import {
  FileLocationResultDto,
  ProfileFormDto,
  ProfileFormResultDto,
} from '@src/dto/upload.dto';

@ApiTags('profile-img')
@Controller('profile-img')
export class ProfileImgController {
  constructor(private readonly uploadService: ProfileImgService) {}

  @Post('temp')
  @UseInterceptors(
    FileInterceptor('images', {
      storage: TempImageStorage,
    }),
  )
  uploadTemp(
    @UploadedFile() file: Express.MulterS3.File,
  ): FileLocationResultDto {
    return { location: file.location, key: file.key };
  }

  /**
   * TODO: 해당 API에 대한 접근을 유저 서버만 가능하도록 구현.
   *  1. IP 접근 제한
   *  2. 토큰 생성
   */
  @Post('form')
  uploadForm(@Body() dto: ProfileFormDto): Promise<ProfileFormResultDto> {
    return this.uploadService.toProfile(dto);
  }
}
