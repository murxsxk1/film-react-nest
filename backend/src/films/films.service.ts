import { Injectable } from '@nestjs/common';
import { FilmsRepository } from 'src/repository/films.repository';
import { FilmDto, ScheduleDto } from './dto/films.dto';

@Injectable()
export class FilmsService {
  constructor(private readonly filmsRepository: FilmsRepository) {}

  async getAllFilms(): Promise<FilmDto[]> {
    return this.filmsRepository.findAll();
  }

  async getFilmSchedule(id: string): Promise<ScheduleDto[]> {
    return this.filmsRepository.getScheduleByFilmId(id);
  }
}
