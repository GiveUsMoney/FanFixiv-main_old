import { ApiProperty } from '@nestjs/swagger';
import { TagEntity } from '@src/entities/tag.entity';
import { Tag, TagTypes } from '@src/interfaces/tag.interface';
import { Exclude, Expose, Transform } from 'class-transformer';
import { IsInt, IsString } from '@src/common/validator';
import { IsEnum, IsOptional } from 'class-validator';

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
export class TagResultDto implements Tag {
  constructor(tag: TagEntity) {
    Object.assign(this, tag);
  }

  @Expose()
  @IsEnum(TagTypes)
  @ApiProperty({
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

  description: string;

  status: boolean;

  isAdult: boolean;
}

@Exclude()
export class TagDescriptionDto extends TagResultDto implements Tag {
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
  description: string;

  status: boolean;

  isAdult: boolean;
}
