import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CartController } from './cart.controller';
import { CartEntity } from './entities/cart.entity';
import { CartItemEntity } from './entities/cartItem.entity';
import { CartService } from './services';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    OrderModule,
    TypeOrmModule.forFeature([CartEntity, CartItemEntity]),
  ],
  providers: [CartService],
  controllers: [CartController],
})
export class CartModule {}
