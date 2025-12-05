import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilmDto, ScheduleDto } from '../films/dto/films.dto';
import { FilmEntity } from '../films/entities/film.entity';
import { ScheduleEntity } from '../films/entities/schedule.entity';
import { Repository } from 'typeorm';
import { FilmsRepository } from './films.repository';

@Injectable()
export class FilmsPostgresRepository implements FilmsRepository {
  constructor(
    @InjectRepository(FilmEntity)
    private filmRepository: Repository<FilmEntity>,
  ) {}

  private mapToFilmDto(film: FilmEntity): FilmDto {
    return {
      id: film.id,
      rating: film.rating,
      director: film.director,
      tags: film.tags,
      image: film.image,
      cover: film.cover,
      title: film.title,
      about: film.about,
      description: film.description,
      schedule: film.schedule.map((sched) => this.mapToScheduleDto(sched)),
    };
  }

  private mapToScheduleDto(schedule: ScheduleEntity): ScheduleDto {
    return {
      id: schedule.id,
      daytime: schedule.daytime,
      hall: schedule.hall,
      rows: schedule.rows,
      seats: schedule.seats,
      price: schedule.price,
      taken: schedule.taken,
    };
  }

  async findAll(): Promise<FilmDto[]> {
    const films = await this.filmRepository.find({
      relations: ['schedule'],
      order: {
        schedule: {
          daytime: 'ASC',
        },
      },
    });
    return films.map((film) => this.mapToFilmDto(film));
  }

  async getScheduleByFilmId(id: string): Promise<ScheduleDto[]> {
    const film = await this.filmRepository.findOne({
      where: { id },
      relations: ['schedule'],
      order: {
        schedule: {
          daytime: 'ASC',
        },
      },
    });
    if (!film) {
      throw new Error(`Фильм с id ${id} не найден`);
    }
    return film.schedule.map((sched) => this.mapToScheduleDto(sched));
  }
}
