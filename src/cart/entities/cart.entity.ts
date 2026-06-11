import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { CartItem } from './cartItem.entity';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'created_at', type: 'date' })
  createdAt!: string;

  @Column({ name: 'updated_at', type: 'date' })
  updatedAt!: string;

  @Column({ name: 'status', enum: ['OPEN', 'ORDERED'] })
  status!: 'OPEN' | 'ORDERED';

  @OneToMany(() => CartItem, (item) => item.cart)
  items!: CartItem[];
}
