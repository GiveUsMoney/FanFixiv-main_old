import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity as Base,
} from 'typeorm';

/**
 * 모든 Entity는 해당 Base Class를 상속
 */
export class BaseEntity extends Base {
  constructor(obj) {
    super();
    Object.assign(this, obj);
  }

  @PrimaryGeneratedColumn()
  seq: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
