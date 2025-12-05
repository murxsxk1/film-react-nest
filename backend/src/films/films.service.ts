import { Injectable, Inject } from '@nestjs/common';

import { FilmDto, ScheduleDto } from './dto/films.dto';
import {
  FILMS_REPOSITORY_TOKEN,
  FilmsRepository,
} from '../repository/films.repository';

@Injectable()
export class FilmsService {
  constructor(
    @Inject(FILMS_REPOSITORY_TOKEN)
    private readonly filmsRepository: FilmsRepository,
  ) {}

  async getAllFilms(): Promise<FilmDto[]> {
    return this.filmsRepository.findAll();
  }

  async getFilmSchedule(id: string): Promise<ScheduleDto[]> {
    return this.filmsRepository.getScheduleByFilmId(id);
  }
}
