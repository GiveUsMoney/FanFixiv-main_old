import { Exclude } from 'class-transformer';
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';

export class Base extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  seq: number;

  @CreateDateColumn({ name: 'created_at', select: false })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt!: Date;
}
