import { Injectable, Inject } from '@nestjs/common';
import {
  FilmsRepository,
  FILMS_REPOSITORY_TOKEN,
} from 'src/repository/films.repository';
import { FilmDto, ScheduleDto } from './dto/films.dto';

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
