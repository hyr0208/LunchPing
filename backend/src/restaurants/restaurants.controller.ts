import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { ImageCacheService } from './image-cache.service';

@Controller('restaurants')
export class RestaurantsController {
  constructor(
    private readonly restaurantsService: RestaurantsService,
    private readonly imageCacheService: ImageCacheService,
  ) {}

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

  /**
   * 식당 목록의 이미지를 일괄 조회합니다.
   * 캐시에 있으면 캐시 반환, 없으면 Google Places API 호출 후 캐싱.
   */
  @Post('images')
  async getImages(
    @Body()
    body: {
      restaurants: Array<{
        id: string;
        name: string;
        category: string;
      }>;
    },
  ) {
    const imageMap = await this.imageCacheService.getImagesForRestaurants(
      body.restaurants,
    );

    // Map을 일반 객체로 변환
    const result: Record<string, string> = {};
    imageMap.forEach((url, id) => {
      result[id] = url;
    });

    return result;
  }
}
