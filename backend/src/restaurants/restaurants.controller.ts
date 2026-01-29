import { Controller, Get, Query } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get('nearby')
  getNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
    @Query('page') page?: string,
  ) {
    return this.restaurantsService.getNearby(
      parseFloat(lat),
      parseFloat(lng),
      radius ? parseInt(radius) : undefined,
      page ? parseInt(page) : undefined,
    );
  }

  @Get('search')
  search(
    @Query('keyword') keyword: string,
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
  ) {
    return this.restaurantsService.searchByKeyword(
      keyword,
      parseFloat(lat),
      parseFloat(lng),
      radius ? parseInt(radius) : undefined,
    );
  }

  @Get('image')
  async getImage(
    @Query('placeUrl') placeUrl: string,
    @Query('category') category?: string,
  ) {
    const imageUrl = await this.restaurantsService.getPlaceImage(
      placeUrl,
      category,
    );
    return { imageUrl };
  }
}
