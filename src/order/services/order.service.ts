import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { OrderEntity, OrderStatus } from '../entities/order.entity';
import { CreateOrderPayload, OrderStatus as OrderModelStatus } from '../type';
import { Order } from '../models';
import { CartItemEntity } from 'src/cart/entities/cartItem.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    private readonly dataSource: DataSource,
    @InjectRepository(CartItemEntity)
    private readonly cartItemRepository: Repository<CartItemEntity>,
  ) {}

  async getAll(): Promise<Order[]> {
    const orderEntities = await this.orderRepository.find();

    const orders = Promise.all(
      orderEntities.map((o) => this.mapOrderEntityToOrderModel(o)),
    );

    return orders;
  }

  async findById(orderId: string): Promise<OrderEntity | null> {
    return this.orderRepository.findOneBy({ id: orderId });
  }

  async create(data: CreateOrderPayload): Promise<OrderEntity> {
    return this.dataSource.transaction(async (manager) => {
      const orderRepository = manager.getRepository(OrderEntity);

      const order = orderRepository.create({
        userId: data.userId,
        cartId: data.cartId,
        payment: { type: data.payment },
        delivery: data.address,
        comments: data.comments,
        total: data.total,
        status: OrderStatus.OPEN,
      });

      return orderRepository.save(order);
    });
  }

  async update(orderId: string, data: Partial<OrderEntity>) {
    const order = await this.findById(orderId);

    if (!order) {
      throw new Error('Order does not exist.');
    }

    order.status = data.status ?? order.status;
    return this.orderRepository.save(order);
  }

  private async mapOrderEntityToOrderModel(
    orderEntity: OrderEntity,
  ): Promise<Order> {
    const items = await this.getCartItems(orderEntity.cartId);

    return {
      id: orderEntity.id,
      userId: orderEntity.userId,
      items,
      cartId: orderEntity.cartId,
      address: {
        address: orderEntity.delivery.address as string,
        firstName: orderEntity.delivery.firstName as string,
        lastName: orderEntity.delivery.lastName as string,
        comment: orderEntity.delivery.comment as string,
      },
      statusHistory: [
        {
          status: orderEntity.status as unknown as OrderModelStatus.Open,
          timestamp: 0,
          comment: '',
        },
      ],
    };
  }

  private async getCartItems(
    cartId: string,
  ): Promise<{ productId: string; count: number }[]> {
    const items = await this.cartItemRepository.find({ where: { cartId } });

    return items.map(({ count, productId }) => ({
      productId,
      count,
    }));
  }
}
