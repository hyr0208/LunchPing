import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsService } from './restaurants.service';
import { RestaurantsController } from './restaurants.controller';
import { ImageCacheService } from './image-cache.service';
import { RestaurantImage } from './entities/restaurant-image.entity';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    TypeOrmModule.forFeature([RestaurantImage]),
  ],
  controllers: [RestaurantsController],
  providers: [RestaurantsService, ImageCacheService],
})
export class RestaurantsModule {}
