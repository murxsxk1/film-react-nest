import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'node:crypto';
import { CreateOrderDto, OrderResultDto, TicketDto } from './dto/order.dto';
import { FilmEntity } from '../films/entities/film.entity';
import { ScheduleEntity } from '../films/entities/schedule.entity';
import { IOrderService } from './order.service.interface';

@Injectable()
export class OrderPostgresService implements IOrderService {
  constructor(
    @InjectRepository(FilmEntity)
    private readonly filmRepository: Repository<FilmEntity>,
    @InjectRepository(ScheduleEntity)
    private readonly scheduleRepository: Repository<ScheduleEntity>,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<OrderResultDto[]> {
    if (!dto.tickets || dto.tickets.length === 0) {
      throw new BadRequestException('Не переданы билеты для бронирования');
    }

    const groupedTickets = this.groupBySession(dto.tickets);
    const results: OrderResultDto[] = [];

    for (const [, group] of groupedTickets) {
      const film = await this.filmRepository.findOne({
        where: { id: group.filmId },
        relations: ['schedule'],
      });

      if (!film) {
        throw new NotFoundException(`Фильм с id ${group.filmId} не найден`);
      }

      const schedule = film.schedule.find(
        (item: ScheduleEntity) => item.id === group.scheduleId,
      );

      if (!schedule) {
        throw new NotFoundException(`Сеанс с id ${group.scheduleId} не найден`);
      }

      this.validateTickets(group.tickets, schedule);

      const seatKeys = group.tickets.map((ticket) =>
        this.composeSeatKey(ticket.row, ticket.seat),
      );

      this.ensureSeatsAreFree(seatKeys, schedule);

      schedule.taken = schedule.taken ?? [];
      schedule.taken = [...schedule.taken, ...seatKeys];

      await this.scheduleRepository.save(schedule);

      results.push(
        ...group.tickets.map((ticket) => ({
          id: randomUUID(),
          film: group.filmId,
          session: group.scheduleId,
          daytime: schedule.daytime,
          row: ticket.row,
          seat: ticket.seat,
          price: Number(schedule.price),
        })),
      );
    }

    return results;
  }

  private groupBySession(tickets: TicketDto[]) {
    return tickets.reduce((acc, ticket) => {
      const key = `${ticket.film}:${ticket.session}`;
      if (!acc.has(key)) {
        acc.set(key, {
          filmId: ticket.film,
          scheduleId: ticket.session,
          tickets: [] as TicketDto[],
        });
      }
      acc.get(key)?.tickets.push(ticket);
      return acc;
    }, new Map<string, { filmId: string; scheduleId: string; tickets: TicketDto[] }>());
  }

  private validateTickets(tickets: TicketDto[], schedule: ScheduleEntity) {
    tickets.forEach((ticket) => {
      if (ticket.row < 1 || ticket.row > schedule.rows) {
        throw new BadRequestException(
          `Ряд ${ticket.row} недоступен для выбранного сеанса`,
        );
      }
      if (ticket.seat < 1 || ticket.seat > schedule.seats) {
        throw new BadRequestException(
          `Место ${ticket.seat} недоступно для выбранного сеанса`,
        );
      }
    });

    const seatKeys = tickets.map((ticket) =>
      this.composeSeatKey(ticket.row, ticket.seat),
    );

    if (seatKeys.length !== new Set(seatKeys).size) {
      throw new BadRequestException('В заказе обнаружены дублирующиеся места');
    }
  }

  private ensureSeatsAreFree(seatKeys: string[], schedule: ScheduleEntity) {
    const taken = schedule.taken ?? [];
    const alreadyTaken = seatKeys.filter((seat) => taken.includes(seat));

    if (alreadyTaken.length > 0) {
      throw new BadRequestException(
        `Места ${alreadyTaken.join(', ')} уже заняты`,
      );
    }
  }

  private composeSeatKey(row: number, seat: number): string {
    return `${row}:${seat}`;
  }
}
