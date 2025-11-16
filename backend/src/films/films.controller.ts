import { Controller, Get, Param } from '@nestjs/common';
import { FilmDto, ScheduleDto } from './dto/films.dto';

@Controller('films')
export class FilmsController {
  @Get()
  getAllFilms(): FilmDto[] {
    return [];
  }

  @Get(':id/schedule')
  getFilmSchedule(@Param('id') id: string): ScheduleDto[] {
    return [];
  }
}

