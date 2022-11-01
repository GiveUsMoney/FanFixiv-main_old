import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { ApiTags } from '@nestjs/swagger';
import { TempImageStorage } from '@src/common/storage/multer-s3.storage';
import { FileLocationResultDto } from '@src/dto/upload.dto';

@ApiTags('profile-img')
@Controller('profile-img')
export class ProfileImgController {
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
}
