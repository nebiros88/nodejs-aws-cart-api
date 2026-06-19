import { CartEntity } from 'src/cart/entities/cart.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum OrderStatus {
  OPEN = 'OPEN',
  APPROVED = 'APPROVED',
  CONFIRMED = 'CONFIRMED',
  SENT = 'SENT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'user_id',
    type: 'uuid',
  })
  userId!: string;

  @Column({
    name: 'cart_id',
    type: 'uuid',
  })
  cartId!: string;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  payment!: Record<string, unknown>;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  delivery!: Record<string, unknown>;

  @Column({
    type: 'text',
    nullable: true,
  })
  comments!: string | null;

  @Column({
    type: 'enum',
    enum: OrderStatus,
  })
  status!: OrderStatus;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  total!: number;

  @ManyToOne(() => UserEntity, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @ManyToOne(() => CartEntity)
  @JoinColumn({ name: 'cart_id' })
  cart!: CartEntity;
}
