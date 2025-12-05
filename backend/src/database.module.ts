import { Module, DynamicModule, Global, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { FilmEntity } from './films/entities/film.entity';
import { ScheduleEntity } from './films/entities/schedule.entity';
import { FilmModelName, FilmSchema } from './films/schemas/film.schema';
import { FilmsPostgresRepository } from './repository/films.postgres.repository';
import { FilmsMongoDbRepository } from './repository/films.mongodb.repository';
import { FILMS_REPOSITORY_TOKEN } from './repository/films.repository';
import { OrderMongoService } from './order/order.mongo.service';
import { OrderPostgresService } from './order/order.postgres.service';
import { ORDER_SERVICE_TOKEN } from './order/order.service.interface';

@Global()
@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    const driver =
      process.env.DATABASE_DRIVER?.trim()
        .replace(/^["']|["']$/g, '')
        .toLowerCase() || '';
    const correctedDriver = driver === 'postgress' ? 'postgres' : driver;
    const isPostgres = correctedDriver === 'postgres';
    const isMongo = correctedDriver === 'mongodb';

    const imports: DynamicModule[] = [];
    const providers: Provider[] = [];

    if (isPostgres) {
      imports.push(
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres' as const,
            host: configService.get<string>('DATABASE_HOST'),
            port: configService.get<number>('DATABASE_PORT'),
            username: configService.get<string>('DATABASE_USERNAME'),
            password: configService.get<string>('DATABASE_PASSWORD'),
            database: configService.get<string>('DATABASE_NAME'),
            entities: [FilmEntity, ScheduleEntity],
            synchronize: false,
            logging: false,
          }),
        }),
        TypeOrmModule.forFeature([FilmEntity, ScheduleEntity]),
      );
      providers.push(FilmsPostgresRepository, OrderPostgresService);
    }

    if (isMongo) {
      imports.push(
        MongooseModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            uri: configService.get<string>('DATABASE_URL') || '',
          }),
        }),
        MongooseModule.forFeature([
          { name: FilmModelName, schema: FilmSchema },
        ]),
      );
      providers.push(FilmsMongoDbRepository, OrderMongoService);
    }

    providers.push({
      provide: FILMS_REPOSITORY_TOKEN,
      useFactory: (
        configService: ConfigService,
        postgresRepo?: FilmsPostgresRepository,
        mongoRepo?: FilmsMongoDbRepository,
      ) => {
        const currentDriver = configService
          .get<string>('DATABASE_DRIVER')
          ?.trim()
          .replace(/^["']|["']$/g, '')
          .toLowerCase();
        const corrected =
          currentDriver === 'postgress' ? 'postgres' : currentDriver;
        if (corrected === 'postgres' && postgresRepo) {
          return postgresRepo;
        }
        if (corrected === 'mongodb' && mongoRepo) {
          return mongoRepo;
        }
        throw new Error(
          `Invalid DATABASE_DRIVER: ${currentDriver}. Expected 'postgres' or 'mongodb'`,
        );
      },
      inject: [
        ConfigService,
        { token: FilmsPostgresRepository, optional: true },
        { token: FilmsMongoDbRepository, optional: true },
      ],
    });

    providers.push({
      provide: ORDER_SERVICE_TOKEN,
      useFactory: (
        configService: ConfigService,
        postgresService?: OrderPostgresService,
        mongoService?: OrderMongoService,
      ) => {
        const currentDriver = configService
          .get<string>('DATABASE_DRIVER')
          ?.trim()
          .replace(/^["']|["']$/g, '')
          .toLowerCase();
        const corrected =
          currentDriver === 'postgress' ? 'postgres' : currentDriver;
        if (corrected === 'postgres' && postgresService) {
          return postgresService;
        }
        if (corrected === 'mongodb' && mongoService) {
          return mongoService;
        }
        throw new Error(
          `Invalid DATABASE_DRIVER: ${currentDriver}. Expected 'postgres' or 'mongodb'`,
        );
      },
      inject: [
        ConfigService,
        { token: OrderPostgresService, optional: true },
        { token: OrderMongoService, optional: true },
      ],
    });

    return {
      module: DatabaseModule,
      imports,
      providers,
      exports: [FILMS_REPOSITORY_TOKEN, ORDER_SERVICE_TOKEN],
    };
  }
}
