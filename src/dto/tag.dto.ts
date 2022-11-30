import { ApiProperty } from '@nestjs/swagger';
import {
  ArtistProfile,
  Tag,
  TagSearchTypes,
  TagTypes,
} from '@src/interfaces/tag.interface';
import { Exclude, Expose, Transform } from 'class-transformer';
import { IsInt, IsString } from '@src/common/validator';
import { IsEnum, IsOptional } from 'class-validator';
import { BaseDto } from './base.dto';

export class LimitDto extends BaseDto {
  @IsOptional()
  @IsInt()
  @Transform((x) => parseInt(x.value))
  @ApiProperty({
    type: Number,
    description: '태그 표시 개수',
    required: false,
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

export class TagListDto extends LimitDto {
  @IsEnum(TagTypes)
  @Transform(({ value }) => TagTypes[value])
  @ApiProperty({
    enum: TagTypes,
    description: '태그 종류',
  })
  type: TagTypes;

  @IsOptional()
  @IsEnum(TagSearchTypes)
  @Transform(({ value }) => TagSearchTypes[value])
  @ApiProperty({
    enum: TagSearchTypes,
    description: '태그 검색 유형',
    required: false,
  })
  stype?: TagSearchTypes;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    description: '태그 검색 키워드',
    required: false,
  })
  s?: string;

  @ApiProperty({
    default: 5,
  })
  limit = 5;
}
@Exclude()
export class TagResultDto extends BaseDto implements Tag {
  @Expose()
  @ApiProperty({
    type: Number,
    description: '고유 아이디',
  })
  seq: number;

  @Expose()
  @Transform(({ value }) => (Number.isInteger(value) ? value : parseInt(value)))
  @ApiProperty({
    enum: TagTypes,
    description: '태그 종류',
  })
  type: TagTypes;

  @Expose()
  @ApiProperty({
    type: String,
    description: '태그 이름',
  })
  name: string;

  description: string;

  status: boolean;

  isAdult: boolean;

  requester: number;
}

@Exclude()
export class TagDescriptionDto extends TagResultDto implements Tag {
  @Expose()
  @ApiProperty({
    type: Number,
    description: '고유 아이디',
  })
  seq: number;

  @Expose()
  type: TagTypes;

  @Expose()
  name: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: '태그 설명',
  })
  description: string;

  status: boolean;

  isAdult: boolean;

  requester: number;
}

@Exclude()
export class TagDetailDto extends TagDescriptionDto implements Tag {
  @Expose()
  seq: number;

  @Expose()
  type: TagTypes;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  @Transform(({ value }) => value?.map((x: ArtistProfile) => x.artistProfile))
  @ApiProperty({
    type: [String],
    description: '원작자의 프로필 링크',
  })
  profiles?: ArtistProfile[];

  status: boolean;

  isAdult: boolean;

  requester: number;
}
