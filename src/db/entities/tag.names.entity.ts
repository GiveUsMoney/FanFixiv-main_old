import { ITagName, Language } from 'src/interfaces/tag.interface';
import { Entity, Column, ManyToOne } from 'typeorm';
import { Base } from './base.entity';
import { Tag } from './tag.entity';

@Entity({ name: 'tb_tag_name' })
export class TagName extends Base implements ITagName {
  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: Language,
    default: Language.KR,
  })
  lang: Language;

  @ManyToOne(() => Tag, (Tag) => Tag.names)
  tag!: Tag;
}
