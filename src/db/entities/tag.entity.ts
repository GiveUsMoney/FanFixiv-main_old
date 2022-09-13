import { Exclude } from 'class-transformer';
import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { ITag, TagTypes } from '@src/interfaces/tag.interface';
import { Entity, Column } from 'typeorm';
import { Base } from './base.entity';

@Entity({ name: 'tb_tag' })
export class Tag extends Base implements ITag {
  @Column({
    type: 'enum',
    enum: TagTypes,
    default: TagTypes.ATTRIBUTE,
  })
  @IsEnum(TagTypes)
  type: TagTypes;

  @Column()
  @IsString()
  name: string;

  @Column()
  @IsString()
  describe: string;

  @Exclude()
  @IsBoolean()
  @Column({ default: false })
  using: boolean;
}
