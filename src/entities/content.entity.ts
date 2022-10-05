import { Content } from '@src/interfaces/content.interface';
import { IsString, IsUrl } from 'class-validator';
import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from './base.entity';
import { TagEntity } from './tag.entity';

@Entity({ name: 'tb_content' })
export class ContentEntity extends BaseEntity implements Content {
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

  @ManyToMany(() => TagEntity)
  @JoinTable({
    name: 'tb_content_tag_reg',
  })
  tags: TagEntity[];
}
