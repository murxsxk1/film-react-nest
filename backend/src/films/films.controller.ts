import { Controller, Get, Param } from '@nestjs/common';
import { FilmDto, ScheduleDto } from './dto/films.dto';
import { FilmsService } from './films.service';

@Controller('films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Get()
  async getAllFilms(): Promise<FilmDto[]> {
    return this.filmsService.getAllFilms();
  }

  @Get(':id/schedule')
  async getFilmSchedule(@Param('id') id: string): Promise<ScheduleDto[]> {
    return this.filmsService.getFilmSchedule(id);
  }
}

