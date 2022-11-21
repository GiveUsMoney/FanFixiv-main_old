import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsString, IsUrl } from '@src/common/validator';
import { TagRequest, TagTypes } from '@src/interfaces/tag.interface';
import { IsOptional } from 'class-validator';
import { BaseDto } from './base.dto';

export class TagRequestDto extends BaseDto implements TagRequest {
  @IsEnum(TagTypes)
  @ApiProperty({
    enum: TagTypes,
    description: '태그 종류',
  })
  type: TagTypes;

  @IsString()
  @ApiProperty({
    type: String,
    description: '태그 이름',
  })
  name: string;

  @IsString()
  @ApiProperty({
    type: String,
    description: '태그에 대한 설명',
  })
  description: string;

  @IsBoolean()
  @ApiProperty({
    type: Boolean,
    description: '성인 태그 여부',
    default: false,
  })
  isAdult = false;

  @IsUrl({}, { each: true })
  @IsOptional()
  @ApiProperty({
    type: [String],
    description: '원작자의 프로필 링크',
    required: false,
  })
  profiles?: string[];
}
