import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { OrderEntity, OrderStatus } from '../entities/order.entity';
import { CreateOrderPayload } from '../type';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async getAll(): Promise<OrderEntity[]> {
    return this.orderRepository.find();
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
}
