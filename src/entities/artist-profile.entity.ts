import { ArtistProfile } from '@src/interfaces/tag.interface';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { TagEntity } from './tag.entity';

@Entity({ name: 'tb_artist_profile' })
export class ArtistProfileEntity extends BaseEntity implements ArtistProfile {
  @Column({ unique: true })
  artistProfile: string;

  @ManyToOne(() => TagEntity, (tag) => tag.profiles)
  @JoinColumn({ name: 'tag_seq' })
  tag: TagEntity;
}
