import { FileLocation } from '@src/interfaces/upload.interface';
import { IsInt, IsString, IsUrl } from '@src/common/validator';
import { IsOptional } from 'class-validator';

export class FileLocationResultDto implements FileLocation {
  @IsUrl()
  location: string;

  @IsString()
  key: string;
}

export class ProfileFormDto {
  @IsString()
  key: string;

  @IsString()
  auth: string;
}

export class ProfileFormResultDto {
  @IsInt()
  status: number;

  @IsString()
  key: string;

  @IsOptional()
  @IsString()
  message?: string;
}
