import { ApiProperty } from '@nestjs/swagger';
import { ITempData } from 'src/interfaces/temp.interface';

export class TempDataDto implements ITempData {
  @ApiProperty()
  id: number;

  @ApiProperty()
  content: string;
}
