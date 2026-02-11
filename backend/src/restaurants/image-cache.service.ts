import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { RestaurantImage } from './entities/restaurant-image.entity';

@Injectable()
export class ImageCacheService {
  private readonly logger = new Logger(ImageCacheService.name);

  constructor(
    @InjectRepository(RestaurantImage)
    private readonly imageRepo: Repository<RestaurantImage>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 식당 이미지를 가져옵니다.
   * 1) DB 캐시 확인 → 있으면 반환
   * 2) Google Places API로 이미지 검색 → DB에 저장 후 반환
   * 3) 실패 시 null 반환 (호출측에서 기본 이미지 사용)
   */
  async getImage(
    kakaoPlaceId: string,
    placeName: string,
    category: string,
  ): Promise<string | null> {
    // 1. DB 캐시 확인
    try {
      const cached = await this.imageRepo.findOne({
        where: { kakaoPlaceId },
      });
      if (cached) {
        return cached.imageUrl;
      }
    } catch (error) {
      this.logger.warn(`DB cache lookup failed: ${error.message}`);
    }

    // 2. Google Places API로 이미지 검색
    const apiKey = this.configService.get<string>('GOOGLE_PLACES_API_KEY');
    if (!apiKey) {
      return null;
    }

    try {
      const imageUrl = await this.fetchGooglePlacePhoto(placeName, apiKey);
      if (imageUrl) {
        // DB에 캐싱
        await this.saveToCache(kakaoPlaceId, imageUrl, category);
        return imageUrl;
      }
    } catch (error) {
      this.logger.warn(
        `Google Places API failed for "${placeName}": ${error.message}`,
      );
    }

    return null;
  }

  /**
   * 여러 식당의 이미지를 병렬로 가져옵니다.
   */
  async getImagesForRestaurants(
    restaurants: Array<{
      id: string;
      name: string;
      category: string;
    }>,
  ): Promise<Map<string, string>> {
    const results = new Map<string, string>();

    const promises = restaurants.map(async (restaurant) => {
      const imageUrl = await this.getImage(
        restaurant.id,
        restaurant.name,
        restaurant.category,
      );
      if (imageUrl) {
        results.set(restaurant.id, imageUrl);
      }
    });

    await Promise.allSettled(promises);
    return results;
  }

  /**
   * Google Places API: Text Search → Place Photo
   */
  private async fetchGooglePlacePhoto(
    placeName: string,
    apiKey: string,
  ): Promise<string | null> {
    // Step 1: Text Search로 장소 찾기
    const searchResponse = await firstValueFrom(
      this.httpService.post(
        'https://places.googleapis.com/v1/places:searchText',
        {
          textQuery: placeName,
          languageCode: 'ko',
          maxResultCount: 1,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'places.photos',
          },
        },
      ),
    );

    const places = searchResponse.data?.places;
    if (!places || places.length === 0 || !places[0].photos?.length) {
      return null;
    }

    // Step 2: 첫 번째 사진의 URL 생성
    const photoName = places[0].photos[0].name;
    const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=400&key=${apiKey}`;

    return photoUrl;
  }

  /**
   * DB에 이미지 URL 캐싱
   */
  private async saveToCache(
    kakaoPlaceId: string,
    imageUrl: string,
    category: string,
  ): Promise<void> {
    try {
      const image = this.imageRepo.create({
        kakaoPlaceId,
        imageUrl,
        category,
      });
      await this.imageRepo.save(image);
      this.logger.log(`Cached image for place ${kakaoPlaceId}`);
    } catch (error) {
      // 중복 키 에러 등은 무시 (이미 다른 요청에서 저장됨)
      this.logger.warn(`Failed to cache image: ${error.message}`);
    }
  }
}
