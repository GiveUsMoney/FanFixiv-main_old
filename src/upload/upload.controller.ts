import { Controller, Post, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { ApiTags } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import * as multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { config } from 'dotenv';

config({
  path: `.env.${process.env.NODE_ENV}`,
});

const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('profile')
  @UseInterceptors(
    FileInterceptor('images', {
      storage: multerS3({
        s3: s3,
        bucket: AWS_S3_BUCKET_NAME,
        acl: 'public-read',
        key: function (_: Express.Request, file: Express.Multer.File, cb: any) {
          cb(
            null,
            'temp/' +
              Date.now().toString() +
              '.' +
              file.originalname.split('.').pop(),
          );
        },
      }),
    }),
  )
  uploadProfileImg(): string {
    return 'Test Message';
  }
}
