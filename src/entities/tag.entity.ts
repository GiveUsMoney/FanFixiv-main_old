import { ExtraTagTypes, Tag, TagTypes } from '@src/interfaces/tag.interface';
import { Entity, Column, OneToMany } from 'typeorm';
import { ArtistProfileEntity } from './artist-profile.entity';
import { BaseEntity } from './base.entity';

@Entity({ name: 'tb_tag' })
export class TagEntity extends BaseEntity implements Tag {
  @Column({
    type: 'enum',
    enum: TagTypes,
    default: TagTypes.ATTRIBUTE,
  })
  type: TagTypes;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  requester: number;

  @Column({ default: false })
  status: boolean;

  @Column({ default: false })
  isAdult: boolean;

  @Column({
    type: 'enum',
    enum: ExtraTagTypes,
    nullable: true,
    default: null,
  })
  extraTag: ExtraTagTypes;

  @OneToMany(() => ArtistProfileEntity, (profile) => profile.tag, {
    cascade: true,
  })
  profiles?: ArtistProfileEntity[];
}

@Entity({ name: 'tb_type_name' })
export class TagNameEntity extends BaseEntity {
  @Column()
  typeSeq: string;

  @Column()
  typeName: string;
}
