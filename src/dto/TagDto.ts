import { ApiProperty } from '@nestjs/swagger';
import { Tag } from '@src/db/entities/tag.entity';
import { ITag, TagTypes } from '@src/interfaces/tag.interface';
import { Exclude, Expose, Transform } from 'class-transformer';
import { IsInt, IsString, IsOptional, IsEnum } from 'class-validator';

export class LimitDto {
  @IsOptional()
  @IsInt()
  @Transform((x) => parseInt(x.value))
  @ApiProperty({
    type: Number,
    description: '태그 표시 개수',
  })
  limit: number;
}
export class TagDto extends LimitDto {
  @IsString()
  @ApiProperty({
    type: String,
    description: '태그 검색 키워드',
  })
  s: string;

  @ApiProperty({
    default: 5,
  })
  limit = 5;
}

@Exclude()
export class TagResultDto implements ITag {
  constructor(tag: Tag) {
    Object.assign(this, tag);
  }

  @Expose()
  @IsEnum(TagTypes)
  @ApiProperty({
    enum: ['원작자', '시리즈', '캐릭터', '속성', '언어'],
    description: '태그 종류',
  })
  type: TagTypes;

  @Expose()
  @IsString()
  @ApiProperty({
    type: String,
    description: '태그 이름',
  })
  name: string;

  describe: string;

  using: boolean;
}

@Exclude()
export class TagDescribeDto extends TagResultDto implements ITag {
  @Expose()
  @IsEnum(TagTypes)
  type: TagTypes;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  @ApiProperty({
    type: String,
    description: '태그 설명',
  })
  describe: string;

  using: boolean;
}
