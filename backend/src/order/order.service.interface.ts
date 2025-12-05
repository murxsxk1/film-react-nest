import { CreateOrderDto, OrderResultDto } from './dto/order.dto';

export interface IOrderService {
  createOrder(dto: CreateOrderDto): Promise<OrderResultDto[]>;
}

export const ORDER_SERVICE_TOKEN = 'OrderService';
