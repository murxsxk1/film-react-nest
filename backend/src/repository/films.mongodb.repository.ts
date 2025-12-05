import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilmDto, ScheduleDto } from '../films/dto/films.dto';
import {
  FilmDocument,
  FilmModelName,
  ScheduleDocument,
} from 'src/films/schemas/film.schema';
import { FilmsRepository } from './films.repository';

@Injectable()
export class FilmsMongoDbRepository implements FilmsRepository {
  constructor(
    @InjectModel(FilmModelName) private filmModel: Model<FilmDocument>,
  ) {}

  private mapToFilmDto(film: FilmDocument): FilmDto {
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
      schedule: film.schedule.map((sched: ScheduleDocument) =>
        this.mapToScheduleDto(sched),
      ),
    };
  }

  private mapToScheduleDto(schedule: ScheduleDocument): ScheduleDto {
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
    const films = await this.filmModel.find();
    return films.map((film) => this.mapToFilmDto(film));
  }

  async getScheduleByFilmId(id: string): Promise<ScheduleDto[]> {
    const film = await this.filmModel.findOne({ id });
    if (!film) {
      throw new Error(`Фильм с id ${id} не найден`);
    }
    return film.schedule.map((sched: ScheduleDocument) =>
      this.mapToScheduleDto(sched),
    );
  }
}
