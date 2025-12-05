import { FilmDto, ScheduleDto } from '../films/dto/films.dto';

export interface FilmsRepository {
  findAll(): Promise<FilmDto[]>;
  getScheduleByFilmId(id: string): Promise<ScheduleDto[]>;
}

export const FILMS_REPOSITORY_TOKEN = 'FilmsRepository';
