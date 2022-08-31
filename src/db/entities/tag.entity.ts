import { Exclude } from 'class-transformer';
import { ITag, TagTypes } from 'src/interfaces/tag.interface';
import { Entity, Column } from 'typeorm';
import { Base } from './base.entity';

@Entity({ name: 'tb_tag' })
export class Tag extends Base implements ITag {
  @Column({
    type: 'enum',
    enum: TagTypes,
    default: TagTypes.ATTRIBUTE,
  })
  type: TagTypes;

  @Column()
  name: string;

  @Column()
  describe: string;

  @Exclude()
  @Column({ default: false })
  using: boolean;
}
