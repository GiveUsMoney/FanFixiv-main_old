import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

enum TagTypes {
  ARTIST = 'artist',
  series = 'series',
  CHARACTOR = 'charactor',
  ATTRIBUTE = 'attribute',
  LANGUAGE = 'language',
}

@Entity({ name: 'tb_tag' })
export class Tag {
  @PrimaryGeneratedColumn()
  seq: number;

  @Column({
    type: 'enum',
    enum: TagTypes,
    default: TagTypes.ATTRIBUTE,
  })
  type: string;

  @Column()
  name: string;

  @Column()
  describe: string;

  @Column({ default: false })
  using: boolean;
}
