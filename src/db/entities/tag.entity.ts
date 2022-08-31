import { Exclude } from 'class-transformer';
import { ITag, TagTypes } from 'src/interfaces/tag.interface';
import { Entity, Column, OneToMany } from 'typeorm';
import { Base } from './base.entity';
import { TagName } from './tag.names.entity';

@Entity({ name: 'tb_tag' })
export class Tag extends Base implements ITag {
  @Column({
    type: 'enum',
    enum: TagTypes,
    default: TagTypes.ATTRIBUTE,
  })
  type: TagTypes;

  @Column()
  describe: string;

  @Exclude()
  @Column({ default: false })
  using: boolean;

  @OneToMany(() => TagName, (tag) => tag.tag)
  names!: TagName[];
}
