import { FileLocation } from '@src/interfaces/upload.interface';
import { IsString } from '@src/common/validator';

export class FileLocationDto implements FileLocation {
  @IsString()
  location: string;

  @IsString()
  key: string;
}
