import {
  Content,
  ContentSource,
  SourceType,
  Image,
} from '@src/interfaces/content.interface';
import {
  Entity,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { LikesEntity } from './likes.entity';
import { SeriesEntity } from './series.entity';
import { TagEntity } from './tag.entity';

@Entity({ name: 'tb_content' })
export class ContentEntity extends BaseEntity implements Content {
  @Column()
  title: string;

  @Column()
  thumbnail: string;

  @Column()
  uploaderSeq: number;

  @Column()
  translateReview: string;

  @Column({ default: false })
  isAdult: boolean;

  @Column()
  status: boolean;

  // typeorm의 .addSelectAndMap 기능이 현재 존재하지 않아 있는 임시 컬럼...
  @Column({ select: false, nullable: true, insert: false, update: false })
  like: number;

  // typeorm의 .addSelectAndMap 기능이 현재 존재하지 않아 있는 임시 컬럼...
  @Column({ select: false, nullable: true, insert: false, update: false })
  doLike: boolean;

  @ManyToOne(() => TagEntity, (tag) => tag.work)
  artist: TagEntity;

  @ManyToOne(() => SeriesEntity, (series) => series.content)
  series: SeriesEntity;

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

  @OneToMany(() => LikesEntity, (like) => like.content, { cascade: true })
  likes: LikesEntity[];

  @OneToMany(() => ContentSourceEntity, (source) => source.content, {
    cascade: true,
  })
  source: ContentSourceEntity[];

  @OneToMany(() => ContentImageEntity, (img) => img.content)
  imgs: ContentImageEntity[];
}

@Entity({ name: 'tb_content_source' })
export class ContentSourceEntity extends BaseEntity implements ContentSource {
  @Column({
    type: 'enum',
    enum: SourceType,
  })
  type: SourceType;

  @Column()
  link: string;

  @ManyToOne(() => ContentEntity, (content) => content.source)
  content: ContentEntity;
}

@Entity({ name: 'tb_img' })
export class ContentImageEntity extends BaseEntity implements Image {
  @Column()
  link: string;

  @ManyToOne(() => ContentEntity, (content) => content.imgs)
  content: ContentEntity;
}
