import { FileLocation } from '@src/interfaces/upload.interface';
import { IsInt, IsString, IsUrl } from '@src/common/validator';
import { IsOptional } from 'class-validator';

export class FileLocationDto implements FileLocation {
  @IsUrl()
  location: string;

  @IsString()
  key: string;
}

export class UploadResultDto {
  @IsInt()
  status: number;

  @IsOptional()
  @IsString()
  message?: string;
}
