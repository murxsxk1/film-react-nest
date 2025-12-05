import { Body, Controller, Inject, Post } from '@nestjs/common';
import { CreateOrderDto, OrderResponseDto } from './dto/order.dto';
import { IOrderService, ORDER_SERVICE_TOKEN } from './order.service.interface';

@Controller('order')
export class OrderController {
  constructor(
    @Inject(ORDER_SERVICE_TOKEN) private readonly orderService: IOrderService,
  ) {}

  @Post()
  async create(@Body() dto: CreateOrderDto): Promise<OrderResponseDto> {
    const items = await this.orderService.createOrder(dto);
    return {
      total: items.length,
      items,
    };
  }
}
