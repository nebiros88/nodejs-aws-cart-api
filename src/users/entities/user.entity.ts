import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CartEntity } from 'src/cart/entities/cart.entity';
import { OrderEntity } from 'src/order/entities/order.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  password!: string;

  @OneToMany(() => CartEntity, (cart) => cart.user)
  carts!: CartEntity[];

  @OneToMany(() => OrderEntity, (order) => order.user)
  orders!: OrderEntity[];
}
