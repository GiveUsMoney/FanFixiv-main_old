import { IContent } from '@src/interfaces/content.interface';
import { IsString, IsUrl } from 'class-validator';
import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { Base } from './base.entity';
import { Tag } from './tag.entity';

@Entity({ name: 'tb_content' })
export class Content extends Base implements IContent {
  @Column()
  @IsString()
  title: string;

  @Column()
  @IsUrl()
  thumbnail: string;

  @Column()
  @IsString()
  translateReview: string;

  // 후일 User테이블이 추가된 후 변경할 예정입니다.
  like: number;

  @ManyToMany(() => Tag)
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
  tags: Tag[];
}
