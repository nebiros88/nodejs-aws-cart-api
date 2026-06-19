import {
  Controller,
  Get,
  Delete,
  Put,
  Body,
  Req,
  UseGuards,
  HttpStatus,
  HttpCode,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { BasicAuthGuard } from '../auth';
import { OrderService } from '../order';
import { AppRequest, getUserIdFromRequest } from '../shared';
import { calculateCartTotal } from './models-rules';
import { CartService } from './services';
import { CreateOrderDto, PutCartPayload } from 'src/order/type';
import { OrderEntity } from 'src/order/entities/order.entity';
import { CartItem } from './models';

@Controller('api/profile/cart')
export class CartController {
  constructor(
    @Inject(CartService) private cartService: CartService,
    @Inject(OrderService) private orderService: OrderService,
  ) {}

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Get()
  async findUserCart(@Req() req: AppRequest): Promise<CartItem[]> {
    const cart = await this.cartService.findOrCreateByUserId(
      getUserIdFromRequest(req),
    );

    return cart.items;
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Put()
  async updateUserCart(
    @Req() req: AppRequest,
    @Body() body: PutCartPayload,
  ): Promise<CartItem[] | null> {
    // TODO: validate body payload...
    const cart = await this.cartService.updateByUserId(
      getUserIdFromRequest(req),
      body,
    );

    if (!cart) return null;

    return cart.items;
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Delete()
  @HttpCode(HttpStatus.OK)
  clearUserCart(@Req() req: AppRequest) {
    this.cartService.removeByUserId(getUserIdFromRequest(req));
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Put('order')
  async checkout(@Req() req: AppRequest, @Body() body: CreateOrderDto) {
    const userId = getUserIdFromRequest(req);
    const cart = await this.cartService.findByUserId(userId);

    if (!(cart && cart.items.length)) {
      throw new BadRequestException('Cart is empty');
    }

    const { id: cartId, items } = cart;

    const order = await this.orderService.create({
      userId,
      cartId,
      items: items.map((i) => ({ productId: i.product.id, count: i.count })),
      address: body.address,
      total: calculateCartTotal(items),
      payment: body.payment,
      comments: body.comments,
    });

    // Set status to 'ORDERED' after checkout instead of cart deletion.
    await this.cartService.setOrderedStatus(userId);
    return {
      order,
    };
  }

  @UseGuards(BasicAuthGuard)
  @Get('order')
  async getOrder(): Promise<OrderEntity[]> {
    return this.orderService.getAll();
  }
}
