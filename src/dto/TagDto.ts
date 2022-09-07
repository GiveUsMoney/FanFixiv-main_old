import { Tag } from '@src/db/entities/tag.entity';
import { ITag, TagTypes } from '@src/interfaces/tag.interface';
import { Exclude, Expose } from 'class-transformer';
import { IsInt, IsString, IsOptional, IsEnum } from 'class-validator';

export class LimitDto {
  @IsOptional()
  @IsInt()
  limit: number;
}
export class TagDto extends LimitDto {
  @IsString()
  s: string;

  limit = 5;
}

@Exclude()
export class TagResultDto implements ITag {
  constructor(tag: Tag) {
    Object.assign(this, tag);
  }

  @Expose()
  @IsEnum(TagTypes)
  type: TagTypes;

  @Expose()
  @IsString()
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
  describe: string;

  using: boolean;
}
