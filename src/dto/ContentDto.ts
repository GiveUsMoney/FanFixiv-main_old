import { ApiProperty } from '@nestjs/swagger';
import { Content } from '@src/entities/content.entity';
import { IContent } from '@src/interfaces/content.interface';
import { Exclude, Expose, plainToInstance, Transform } from 'class-transformer';
import { IsInt, Min } from '@src/common/validator';
import { TagResultDto } from './TagDto';

export class ContentDto {
  @IsInt()
  @Min(1)
  @Transform((x) => parseInt(x.value))
  @ApiProperty({
    description: '컨텐츠 카드 개수',
    type: Number,
    default: 10,
  })
  count = 10;

  @IsInt()
  @Min(1)
  @Transform((x) => parseInt(x.value))
  @ApiProperty({
    description: '몇번째 페이지',
    type: Number,
    default: 1,
  })
  page = 1;
}

@Exclude()
export class ContentCardDto implements IContent {
  constructor(content: Content) {
    Object.assign(this, content);
    this.tags = plainToInstance(TagResultDto, content.tags);
  }

  @Expose()
  @ApiProperty({
    type: Date,
    description: '생성일자',
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    type: String,
    description: '만화 제목',
  })
  title: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: '썸네일 링크',
  })
  thumbnail: string;

  @Expose()
  @ApiProperty({
    type: Number,
    description: '좋아요 개수',
  })
  like: number;

  translateReview: string;

  @Expose()
  @ApiProperty({
    type: [TagResultDto],
    description: '태그 목록',
  })
  tags: TagResultDto[];
}

export class ContentResultDto {
  constructor(pageCount: number, content: Content[]) {
    this.pageCount = pageCount;
    this.content = content.map((item) => new ContentCardDto(item));
  }

  @ApiProperty({
    type: Number,
    description: '총 페이지 개수',
  })
  pageCount: number;

  @ApiProperty({
    type: [ContentCardDto],
    description: '컨텐츠 카드 목록',
  })
  content: ContentCardDto[];
}
