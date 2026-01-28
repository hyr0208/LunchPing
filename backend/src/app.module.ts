import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { StorageModule } from './storage/storage.module';

// 조건부 TypeORM 설정
const typeOrmModule = TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (config: ConfigService) => {
    const dbHost = config.get<string>('DB_HOST');

    // DB_HOST가 없으면 SQLite in-memory 사용 (개발용)
    if (!dbHost) {
      return {
        type: 'sqlite',
        database: ':memory:',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      };
    }

    return {
      type: 'postgres',
      host: dbHost,
      port: config.get<number>('DB_PORT'),
      username: config.get<string>('DB_USERNAME'),
      password: config.get<string>('DB_PASSWORD'),
      database: config.get<string>('DB_DATABASE'),
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      retryAttempts: 10,
    };
  },
  inject: [ConfigService],
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    typeOrmModule,
    RestaurantsModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
