import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CartItemEntity } from './cartItem.entity';
import { UserEntity } from 'src/users/entities/user.entity';

@Entity('carts')
export class CartEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt!: string;

  @Column({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: string;

  @Column({ name: 'status', enum: ['OPEN', 'ORDERED'] })
  status!: 'OPEN' | 'ORDERED';

  @ManyToOne(() => UserEntity, (user) => user.carts)
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @OneToMany(() => CartItemEntity, (item) => item.cart)
  items!: CartItemEntity[];
}
