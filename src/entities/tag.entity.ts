import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { Tag, TagTypes } from '@src/interfaces/tag.interface';
import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'tb_tag' })
export class TagEntity extends BaseEntity implements Tag {
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
  description: string;

  @IsBoolean()
  @Column({ default: false })
  status: boolean;

  @IsBoolean()
  @Column({ default: false })
  isAdult: boolean;
}

@Entity({ name: 'tb_type_name' })
export class TagNameEntity extends BaseEntity {
  @Column()
  @IsString()
  typeSeq: string;

  @Column()
  @IsString()
  typeName: string;
}
