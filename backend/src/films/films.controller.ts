import { Controller, Get, Param } from '@nestjs/common';
import { FilmsResponseDto, ScheduleResponseDto } from './dto/films.dto';
import { FilmsService } from './films.service';

@Controller('films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Get()
  async getAllFilms(): Promise<FilmsResponseDto> {
    const items = await this.filmsService.getAllFilms();
    return {
      total: items.length,
      items,
    };
  }

  @Get(':id/schedule')
  async getFilmSchedule(@Param('id') id: string): Promise<ScheduleResponseDto> {
    const items = await this.filmsService.getFilmSchedule(id);
    return {
      total: items.length,
      items,
    };
  }
}
