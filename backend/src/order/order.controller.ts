import { Body, Controller, Post } from '@nestjs/common';
import { CreateOrderDto, OrderResponseDto } from './dto/order.dto';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() dto: CreateOrderDto): Promise<OrderResponseDto> {
    const items = await this.orderService.createOrder(dto);
    return {
      total: items.length,
      items,
    };
  }
}
