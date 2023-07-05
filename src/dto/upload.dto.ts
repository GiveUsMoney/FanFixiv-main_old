import { FileLocation } from '@src/interfaces/upload.interface';
import { IsInt, IsString, IsUrl } from '@src/common/validator';
import { IsOptional } from 'class-validator';
import { BaseDto } from './base.dto';

export class FileLocationResultDto extends BaseDto implements FileLocation {
  @IsUrl()
  location: string;

  @IsString()
  key: string;
}

export class ProfileFormDto extends BaseDto {
  @IsString()
  key: string;

  @IsString()
  auth: string;
}

export class ProfileFormResultDto extends BaseDto {
  @IsInt()
  status: number;

  @IsString()
  key: string;

  @IsOptional()
  @IsString()
  message?: string;
}
