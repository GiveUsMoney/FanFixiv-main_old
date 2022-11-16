import { Content } from '@src/interfaces/content.interface';
import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from './base.entity';
import { TagEntity } from './tag.entity';

@Entity({ name: 'tb_content' })
export class ContentEntity extends BaseEntity implements Content {
  @Column()
  title: string;

  @Column()
  thumbnail: string;

  @Column()
  translateReview: string;

  @Column()
  isAdult: boolean;

  // typeorm의 .addSelectAndMap 기능이 현재 존재하지 않아 있는 임시 컬럼...
  @Column({ select: false, nullable: true, insert: false, update: false })
  like: number;

  // typeorm의 .addSelectAndMap 기능이 현재 존재하지 않아 있는 임시 컬럼...
  @Column({ select: false, nullable: true, insert: false, update: false })
  doLike: boolean;

  @ManyToMany(() => TagEntity)
  @JoinTable({
    name: 'tb_content_tag_reg',
    joinColumn: {
      name: 'content_seq',
      referencedColumnName: 'seq',
    },
    inverseJoinColumn: {
      name: 'tag_seq',
      referencedColumnName: 'seq',
    },
  })
  tags: TagEntity[];
}
