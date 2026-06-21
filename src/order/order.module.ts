import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderEntity } from './entities/order.entity';
import { OrderService } from './services';
import { CartItemEntity } from 'src/cart/entities/cartItem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, CartItemEntity])],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
