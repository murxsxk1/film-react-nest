import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import * as path from 'node:path';
import { configProvider } from './app.config.provider';
import { FilmsController } from './films/films.controller';
import { OrderController } from './order/order.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FilmModelName, FilmSchema } from './films/schemas/film.schema';
import { FilmsService } from './films/films.service';
import { OrderService } from './order/order.service';
import {
  FilmsMongoDbRepository,
  FILMS_REPOSITORY_TOKEN,
} from './repository/films.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    MongooseModule.forRoot(process.env.DATABASE_URL),
    MongooseModule.forFeature([{ name: FilmModelName, schema: FilmSchema }]),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'public', 'content', 'afisha'),
      serveRoot: '/content/afisha',
    }),
  ],
  controllers: [FilmsController, OrderController],
  providers: [
    configProvider,
    FilmsService,
    FilmsMongoDbRepository,
    OrderService,
    {
      provide: FILMS_REPOSITORY_TOKEN,
      useClass: FilmsMongoDbRepository,
    },
  ],
})
export class AppModule {}
