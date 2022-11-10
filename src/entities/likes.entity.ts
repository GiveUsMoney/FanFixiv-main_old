import { Likes } from '@src/interfaces/likes.interface';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'tb_likes' })
export class LikesEntity extends BaseEntity implements Likes {
  @Column()
  userSeq: number;

  @Column()
  contentSeq: number;
}
