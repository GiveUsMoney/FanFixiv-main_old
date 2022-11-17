import { Likes } from '@src/interfaces/likes.interface';
import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ContentEntity } from './content.entity';

@Entity({ name: 'tb_likes' })
export class LikesEntity extends BaseEntity implements Likes {
  @Column()
  userSeq: number;

  @ManyToOne(() => ContentEntity, (content) => content.likes, {
    onDelete: 'CASCADE',
  })
  content: ContentEntity;
}
