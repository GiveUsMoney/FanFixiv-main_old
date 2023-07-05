import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { ApiBody, ApiConsumes, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  fileFilter,
  TempImageStorage,
} from '@src/common/storage/multer-s3.storage';
import { FileLocationResultDto } from '@src/dto/upload.dto';

@ApiTags('profile-img')
@Controller('profile-img')
export class ProfileImgController {
  @Post('temp')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOkResponse({
    type: FileLocationResultDto,
  })
  @UseInterceptors(
    FileInterceptor('images', {
      storage: TempImageStorage,
      fileFilter: fileFilter,
    }),
  )
  uploadTemp(
    @UploadedFile() file: Express.MulterS3.File,
  ): FileLocationResultDto {
    return { location: file.location, key: file.key };
  }
}
