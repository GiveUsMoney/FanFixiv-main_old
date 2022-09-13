import { Content } from '@src/db/entities/content.entity';
import { IContent } from '@src/interfaces/content.interface';
import { Exclude, Expose, plainToClass, Transform } from 'class-transformer';
import { IsInt } from 'class-validator';
import { TagResultDto } from './TagDto';

export class ContentDto {
  @IsInt()
  @Transform((x) => parseInt(x.value))
  count = 10;

  @IsInt()
  @Transform((x) => parseInt(x.value))
  page: number;
}

@Exclude()
export class ContentCardDto implements IContent {
  constructor(content: Content) {
    Object.assign(this, content);
    this.tags = plainToClass(TagResultDto, content.tags);
  }

  @Expose()
  createdAt: Date;

  @Expose()
  title: string;

  @Expose()
  thumbnail: string;

  @Expose()
  like: number;

  translate_review: string;

  @Expose()
  tags: TagResultDto[];
}

export class ContentResultDto {
  constructor(pageCount: number, content: Content[]) {
    this.pageCount = pageCount;
    this.content = content.map((item) => new ContentCardDto(item));
  }

  pageCount: number;
  content: ContentCardDto[];
}
