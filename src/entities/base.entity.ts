import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';

/**
 * 모든 Entity는 해당 Base Class를 상속
 */
export class Base extends BaseEntity {
  @PrimaryGeneratedColumn()
  seq: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
