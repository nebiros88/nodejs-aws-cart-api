import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CartStatuses } from '../models';
import { PutCartPayload } from 'src/order/type';
import { CartEntity } from '../entities/cart.entity';
import { CartItemEntity } from '../entities/cartItem.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
    @InjectRepository(CartItemEntity)
    private readonly cartItemRepository: Repository<CartItemEntity>,
  ) {}

  async findByUserId(userId: string): Promise<CartEntity | null> {
    return this.cartRepository.findOne({
      where: {
        userId,
        status: CartStatuses.OPEN,
      },
      relations: {
        items: true,
      },
    });
  }

  async createByUserId(userId: string): Promise<CartEntity> {
    const timestamp = new Date();

    const cart = this.cartRepository.create({
      userId,
      createdAt: timestamp,
      updatedAt: timestamp,
      status: CartStatuses.OPEN,
    });

    return this.cartRepository.save(cart);
  }

  async findOrCreateByUserId(userId: string): Promise<CartEntity> {
    const userCart = await this.findByUserId(userId);

    if (userCart) {
      return userCart;
    }

    return this.createByUserId(userId);
  }

  async updateByUserId(
    userId: string,
    payload: PutCartPayload,
  ): Promise<CartEntity> {
    const cart = await this.findOrCreateByUserId(userId);

    const existingItem = await this.cartItemRepository.findOne({
      where: {
        cartId: cart?.id,
        productId: payload.product.id,
      },
    });

    if (payload.count === 0) {
      await this.cartItemRepository.delete({
        cartId: cart?.id,
        productId: payload.product.id,
      });
    } else if (existingItem) {
      existingItem.count = payload.count;
      await this.cartItemRepository.save(existingItem);
    } else {
      const newItem = this.cartItemRepository.create({
        cartId: cart?.id,
        productId: payload.product.id,
        count: payload.count,
      });
      await this.cartItemRepository.save(newItem);
    }

    cart.updatedAt = new Date();
    await this.cartRepository.save(cart);

    return this.cartRepository.findOneOrFail({
      where: {
        id: cart.id,
      },
      relations: {
        items: true,
      },
    });
  }

  async removeByUserId(userId: string): Promise<void> {
    const cart = await this.findByUserId(userId);

    if (!cart) return;

    await this.cartRepository.remove(cart);
  }

  async setOrderedStatus(userId: string): Promise<void> {
    const cart = await this.findByUserId(userId);

    if (!cart) return;

    cart.status = 'ORDERED';
    await this.cartRepository.save(cart);
  }
}
