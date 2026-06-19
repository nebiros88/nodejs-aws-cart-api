import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Cart, CartStatuses } from '../models';
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

  async findByUserId(userId: string): Promise<Cart | null> {
    const cart = await this.cartRepository.findOne({
      where: {
        userId,
        status: CartStatuses.OPEN,
      },
      relations: {
        items: true,
      },
    });

    if (!cart) return null;

    const cartItems = await this.getCartItems(cart?.id);
    return {
      id: cart.id,
      user_id: cart.userId,
      created_at: cart.createdAt.getTime(),
      updated_at: cart.updatedAt.getTime(),
      status: cart.status as CartStatuses,
      items: cartItems,
    };
  }

  async createByUserId(userId: string): Promise<Cart> {
    const timestamp = new Date();

    const cart = this.cartRepository.create({
      userId,
      createdAt: timestamp,
      updatedAt: timestamp,
      status: CartStatuses.OPEN,
    });

    const newCart = await this.cartRepository.save(cart);
    return {
      id: newCart.id,
      user_id: newCart.userId,
      created_at: newCart.createdAt.getTime(),
      updated_at: newCart.updatedAt.getTime(),
      status: newCart.status as CartStatuses,
      items: [],
    };
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    const userCart = await this.findByUserId(userId);

    if (userCart) {
      return userCart;
    }

    return this.createByUserId(userId);
  }

  async updateByUserId(
    userId: string,
    payload: PutCartPayload,
  ): Promise<Cart | null> {
    //const cart = await this.findOrCreateByUserId(userId);
    const cart = await this.cartRepository.findOne({ where: { userId } });

    if (!cart) return null;

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
    const updatedCart = await this.cartRepository.save(cart);

    const cartItems = await this.getCartItems(cart.id);
    return {
      id: updatedCart.id,
      user_id: updatedCart.userId,
      created_at: updatedCart.createdAt.getTime(),
      updated_at: updatedCart.updatedAt.getTime(),
      status: updatedCart.status as CartStatuses,
      items: cartItems,
    };
  }

  async removeByUserId(userId: string): Promise<void> {
    const cart = await this.findByUserId(userId);

    if (!cart) return;

    await this.cartRepository.delete({ id: cart.id });
  }

  async setOrderedStatus(userId: string): Promise<void> {
    const cart = await this.findByUserId(userId);

    if (!cart) return;

    cart.status = CartStatuses.ORDERED;
    await this.cartRepository.save(cart);
  }

  private async getCartItems(cartId: string) {
    const items = await this.cartItemRepository.find({ where: { cartId } });
    return items.map((i) => ({
      product: { id: i.productId, title: '', description: '', price: 0 },
      count: i.count,
    }));
  }
}
