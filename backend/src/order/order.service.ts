import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'node:crypto';
import { Model } from 'mongoose';
import { CreateOrderDto, OrderResultDto, TicketDto } from './dto/order.dto';
import {
  FilmDocument,
  FilmModelName,
  ScheduleDocument,
} from 'src/films/schemas/film.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(FilmModelName) private readonly filmModel: Model<FilmDocument>,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<OrderResultDto[]> {
    if (!dto.tickets || dto.tickets.length === 0) {
      throw new BadRequestException('Не переданы билеты для бронирования');
    }

    const groupedTickets = this.groupBySession(dto.tickets);
    const results: OrderResultDto[] = [];

    for (const [, group] of groupedTickets) {
      const film = await this.filmModel.findOne({ id: group.filmId });
      if (!film) {
        throw new NotFoundException(`Фильм с id ${group.filmId} не найден`);
      }

      const schedule = film.schedule.find(
        (item: ScheduleDocument) => item.id === group.scheduleId,
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
      schedule.taken.push(...seatKeys);

      await film.save();

      results.push(
        ...group.tickets.map((ticket) => ({
          id: randomUUID(),
          film: group.filmId,
          session: group.scheduleId,
          daytime: schedule.daytime,
          row: ticket.row,
          seat: ticket.seat,
          price: schedule.price,
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

  private validateTickets(tickets: TicketDto[], schedule: ScheduleDocument) {
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

  private ensureSeatsAreFree(seatKeys: string[], schedule: ScheduleDocument) {
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
