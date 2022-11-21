import { ApiProperty } from '@nestjs/swagger';
import { TempData } from '@src/interfaces/temp.interface';
import { BaseDto } from './base.dto';

export class TempDataDto extends BaseDto implements TempData {
  @ApiProperty()
  id: number;

  @ApiProperty()
  content: string;
}
