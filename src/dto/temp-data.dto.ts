import { ApiProperty } from '@nestjs/swagger';
import { TempData } from '@src/interfaces/temp.interface';

export class TempDataDto implements TempData {
  @ApiProperty()
  id: number;

  @ApiProperty()
  content: string;
}
