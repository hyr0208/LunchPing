import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ImageCacheService } from './image-cache.service';

@Injectable()
export class RestaurantsService {
  private readonly KAKAO_API_BASE = 'https://dapi.kakao.com/v2/local/search';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly imageCacheService: ImageCacheService,
  ) {}

  private get headers() {
    return {
      Authorization: `KakaoAK ${this.configService.get<string>('KAKAO_REST_API_KEY')}`,
    };
  }

  async getNearby(
    latitude: number,
    longitude: number,
    radius: number = 1000,
    page: number = 1,
  ) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.KAKAO_API_BASE}/category.json`, {
          headers: this.headers,
          params: {
            category_group_code: 'FD6',
            x: longitude.toString(),
            y: latitude.toString(),
            radius: radius.toString(),
            sort: 'distance',
            page: page.toString(),
            size: 15,
          },
        }),
      );

      const restaurants = data.documents.map(this.transformToRestaurant);

      // Google Places API로 실제 이미지 보강
      const enriched = await this.enrichWithImages(restaurants);

      return {
        restaurants: enriched,
        hasMore: !data.meta.is_end,
      };
    } catch (error) {
      throw new InternalServerErrorException('Kakao API Call Failed');
    }
  }

  async searchByKeyword(
    keyword: string,
    latitude: number,
    longitude: number,
    radius: number = 2000,
  ) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.KAKAO_API_BASE}/keyword.json`, {
          headers: this.headers,
          params: {
            query: keyword,
            category_group_code: 'FD6',
            x: longitude.toString(),
            y: latitude.toString(),
            radius: radius.toString(),
            sort: 'distance',
            size: 15,
          },
        }),
      );

      const restaurants = data.documents.map(this.transformToRestaurant);
      return this.enrichWithImages(restaurants);
    } catch (error) {
      throw new InternalServerErrorException('Kakao API Search Failed');
    }
  }

  // --- 이미지 보강 ---

  /**
   * 식당 목록에 Google Places 이미지를 병렬로 보강합니다.
   * 캐시에 있으면 캐시 사용, 없으면 Google API 호출 후 캐싱.
   * 실패 시 기존 카테고리 기본 이미지 유지.
   */
  private async enrichWithImages(restaurants: any[]): Promise<any[]> {
    const imageMap = await this.imageCacheService.getImagesForRestaurants(
      restaurants.map((r) => ({
        id: r.id,
        name: r.name,
        category: r.category,
      })),
    );

    return restaurants.map((restaurant) => ({
      ...restaurant,
      imageUrl: imageMap.get(restaurant.id) || restaurant.imageUrl,
    }));
  }

  // --- Helper Functions ---

  private transformToRestaurant = (doc: any) => {
    const category = this.mapKakaoCategory(doc.category_name);
    return {
      id: doc.id,
      name: doc.place_name,
      category,
      description: doc.category_name,
      address: doc.road_address_name || doc.address_name,
      distance: parseInt(doc.distance) || undefined,
      rating: 0,
      reviewCount: 0,
      priceRange: this.estimatePriceRange(doc.category_name),
      imageUrl: this.getRandomImage(category), // 기본 이미지 (fallback)
      phoneNumber: doc.phone || undefined,
      businessHours: {
        monday: null,
        tuesday: null,
        wednesday: null,
        thursday: null,
        friday: null,
        saturday: null,
        sunday: null,
      },
      holidays: [],
      recommendedMenus: [],
      placeUrl: doc.place_url,
    };
  };

  private mapKakaoCategory(categoryName: string): string {
    const lower = categoryName.toLowerCase();
    if (
      lower.includes('한식') ||
      lower.includes('백반') ||
      lower.includes('국밥')
    )
      return 'korean';
    if (lower.includes('중식') || lower.includes('중국')) return 'chinese';
    if (
      lower.includes('일식') ||
      lower.includes('초밥') ||
      lower.includes('돈까스')
    )
      return 'japanese';
    if (
      lower.includes('양식') ||
      lower.includes('이탈리') ||
      lower.includes('파스타') ||
      lower.includes('스테이크')
    )
      return 'western';
    if (
      lower.includes('베트남') ||
      lower.includes('태국') ||
      lower.includes('아시안')
    )
      return 'asian';
    if (
      lower.includes('분식') ||
      lower.includes('떡볶이') ||
      lower.includes('김밥')
    )
      return 'snack';
    if (
      lower.includes('카페') ||
      lower.includes('커피') ||
      lower.includes('디저트')
    )
      return 'cafe';
    if (
      lower.includes('패스트') ||
      lower.includes('버거') ||
      lower.includes('피자')
    )
      return 'fastfood';
    return 'korean';
  }

  private estimatePriceRange(categoryName: string): 1 | 2 | 3 {
    const lower = categoryName.toLowerCase();
    if (lower.includes('분식') || lower.includes('패스트')) return 1;
    if (
      lower.includes('오마카세') ||
      lower.includes('스테이크') ||
      lower.includes('파인')
    )
      return 3;
    return 2;
  }

  private getRandomImage(category: string): string {
    const images: Record<string, string[]> = {
      korean: [
        'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400',
        'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400',
        'https://images.unsplash.com/photo-1580651315530-69c8e0026377?w=400',
      ],
      chinese: [
        'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400',
      ],
      japanese: [
        'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400',
      ],
      western: [
        'https://images.unsplash.com/photo-1481931098730-318b6f776db0?w=400',
      ],
      asian: [
        'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400',
      ],
      snack: [
        'https://images.unsplash.com/photo-1635363638580-c2809d049eee?w=400',
      ],
      cafe: [
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
      ],
      fastfood: [
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
      ],
    };
    const list = images[category] || images['korean'];
    return list[Math.floor(Math.random() * list.length)];
  }

  /**
   * 카테고리 기반 랜덤 이미지 반환 (스크래핑/API 대체)
   */
  async getPlaceImage(
    placeUrl: string,
    fallbackCategory: string = 'korean',
  ): Promise<string> {
    return this.getRandomImage(fallbackCategory);
  }
}
