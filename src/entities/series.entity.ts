import { Series } from '@src/interfaces/content.interface';
import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ContentEntity } from './content.entity';

@Entity({ name: 'tb_series' })
export class SeriesEntity extends BaseEntity implements Series {
  @Column()
  title: string;

  @OneToMany(() => ContentEntity, (content) => content.series)
  content: ContentEntity[];
}
