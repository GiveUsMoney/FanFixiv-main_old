import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { ApiTags } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { TempImageStorage } from '@src/common/storage/multer-s3.storage';
import { FileLocation } from '@src/interfaces/upload.interface';
import { FileLocationDto } from '@src/dto/upload.dto';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('temp')
  @UseInterceptors(
    FileInterceptor('images', {
      storage: TempImageStorage,
    }),
  )
  uploadTempImg(@UploadedFile() file: Express.MulterS3.File): FileLocation {
    return { location: file.location, key: file.key };
  }

  @Post('to-profile')
  uploadToProfile(@Body() dto: FileLocationDto): Promise<{ status: number }> {
    return this.uploadService.toProfile(dto);
  }
}
