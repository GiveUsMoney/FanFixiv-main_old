import { ApiProperty } from '@nestjs/swagger';
import {
  Content,
  ContentSource,
  Series,
} from '@src/interfaces/content.interface';
import { Likes } from '@src/interfaces/likes.interface';
import { Tag } from '@src/interfaces/tag.interface';
import { Exclude, Expose, Type } from 'class-transformer';
import { BaseDto } from './base.dto';

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
export class ContentSeriesDto extends BaseDto implements Content {
  @Expose()
  @ApiProperty({
    type: Number,
    description: '고유 아이디',
  })
  seq: number;

  @Expose()
  @ApiProperty({
    type: String,
    description: '컨텐츠 제목',
  })
  title: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: '썸네일',
  })
  thumbnail: string;

  translateReview: string;
  isAdult: boolean;
  status: boolean;
  like: number;
  doLike: boolean;
  artist: Tag;
  tags: Tag[];
  likes: Likes[];
  source: ContentSource[];
  series: Series;
}

@Exclude()
export class SeriesWithContentDto extends SeriesDto {
  @Expose()
  @Type(() => ContentSeriesDto)
  @ApiProperty({
    type: [ContentSeriesDto],
    description: '컨텐츠 카드',
  })
  content: ContentSeriesDto[];
}
