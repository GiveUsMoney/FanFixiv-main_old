import { ApiProperty } from '@nestjs/swagger';
import { Content, Series } from '@src/interfaces/content.interface';
import { Exclude, Expose } from 'class-transformer';
import { BaseDto } from './base.dto';
import { ContentCardDto } from './content.dto';

@Exclude()
export class SeriesDto extends BaseDto implements Series {
  @Expose()
  @ApiProperty({
    type: Number,
    description: '고유 아이디',
  })
  seq: number;

  @Expose()
  @ApiProperty({
    type: String,
    description: '시리즈 제목',
  })
  title: string;

  content: Content[];
}

@Exclude()
export class SeriesWithContentDto extends SeriesDto {
  @Expose()
  @ApiProperty({
    type: [ContentCardDto],
    description: '컨텐츠 카드',
  })
  content: ContentCardDto[];
}
