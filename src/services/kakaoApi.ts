import type { Category, Restaurant } from "../types/restaurant";

const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
// 프록시를 통해 호출 (CORS 및 도메인 문제 해결용)
const KAKAO_API_BASE = "/api/v2/local/search";

// Kakao API 응답 타입
interface KakaoPlaceDocument {
  id: string;
  place_name: string;
  category_name: string;
  category_group_code: string;
  category_group_name: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  x: string; // longitude
  y: string; // latitude
  place_url: string;
  distance: string;
}

interface KakaoSearchResponse {
  documents: KakaoPlaceDocument[];
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
}

// 카테고리 매핑
function mapKakaoCategory(categoryName: string): Category {
  const lowerCategory = categoryName.toLowerCase();

  if (
    lowerCategory.includes("한식") ||
    lowerCategory.includes("백반") ||
    lowerCategory.includes("국밥")
  ) {
    return "korean";
  }
  if (lowerCategory.includes("중식") || lowerCategory.includes("중국")) {
    return "chinese";
  }
  if (
    lowerCategory.includes("일식") ||
    lowerCategory.includes("초밥") ||
    lowerCategory.includes("돈까스")
  ) {
    return "japanese";
  }
  if (
    lowerCategory.includes("양식") ||
    lowerCategory.includes("이탈리") ||
    lowerCategory.includes("파스타") ||
    lowerCategory.includes("스테이크")
  ) {
    return "western";
  }
  if (
    lowerCategory.includes("베트남") ||
    lowerCategory.includes("태국") ||
    lowerCategory.includes("아시안")
  ) {
    return "asian";
  }
  if (
    lowerCategory.includes("분식") ||
    lowerCategory.includes("떡볶이") ||
    lowerCategory.includes("김밥")
  ) {
    return "snack";
  }
  if (
    lowerCategory.includes("카페") ||
    lowerCategory.includes("커피") ||
    lowerCategory.includes("디저트")
  ) {
    return "cafe";
  }
  if (
    lowerCategory.includes("패스트") ||
    lowerCategory.includes("버거") ||
    lowerCategory.includes("피자")
  ) {
    return "fastfood";
  }

  return "korean"; // 기본값
}

// 가격대 추정
function estimatePriceRange(categoryName: string): 1 | 2 | 3 {
  const lowerCategory = categoryName.toLowerCase();

  if (lowerCategory.includes("분식") || lowerCategory.includes("패스트")) {
    return 1;
  }
  if (
    lowerCategory.includes("오마카세") ||
    lowerCategory.includes("스테이크") ||
    lowerCategory.includes("파인")
  ) {
    return 3;
  }
  return 2;
}

// 음식 이미지 URL (카테고리별)
const categoryImages: Record<Category, string[]> = {
  korean: [
    "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400",
    "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400",
    "https://images.unsplash.com/photo-1580651315530-69c8e0026377?w=400",
  ],
  chinese: [
    "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400",
    "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400",
  ],
  japanese: [
    "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400",
    "https://images.unsplash.com/photo-1553621042-f6e147245754?w=400",
  ],
  western: [
    "https://images.unsplash.com/photo-1481931098730-318b6f776db0?w=400",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
  ],
  asian: [
    "https://images.unsplash.com/photo-1555126634-323283e090fa?w=400",
    "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400",
  ],
  snack: [
    "https://images.unsplash.com/photo-1635363638580-c2809d049eee?w=400",
    "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400",
  ],
  cafe: [
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400",
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400",
  ],
  fastfood: [
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
  ],
};

function getRandomImage(category: Category): string {
  const images = categoryImages[category];
  return images[Math.floor(Math.random() * images.length)];
}

// Kakao 데이터를 Restaurant 타입으로 변환
function transformToRestaurant(doc: KakaoPlaceDocument): Restaurant {
  const category = mapKakaoCategory(doc.category_name);

  return {
    id: doc.id,
    name: doc.place_name,
    category,
    description: doc.category_name,
    address: doc.road_address_name || doc.address_name,
    distance: parseInt(doc.distance) || undefined,
    rating: 0,
    reviewCount: 0,
    priceRange: estimatePriceRange(doc.category_name),
    imageUrl: getRandomImage(category),
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
}

/**
 * 주변 음식점 검색
 */
export async function searchNearbyRestaurants(
  latitude: number,
  longitude: number,
  radius: number = 1000, // 미터 단위, 기본 1km
  page: number = 1,
): Promise<{ restaurants: Restaurant[]; hasMore: boolean }> {
  const queryParams = new URLSearchParams({
    category_group_code: "FD6",
    x: longitude.toString(),
    y: latitude.toString(),
    radius: radius.toString(),
    sort: "distance",
    page: page.toString(),
    size: "15",
  });

  const response = await fetch(
    `${KAKAO_API_BASE}/category.json?${queryParams}`,
    {
      headers: {
        Authorization: `KakaoAK ${KAKAO_API_KEY}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Kakao API Error: ${response.status}`);
  }

  const data: KakaoSearchResponse = await response.json();

  return {
    restaurants: data.documents.map(transformToRestaurant),
    hasMore: !data.meta.is_end,
  };
}

/**
 * 키워드로 음식점 검색
 */
export async function searchRestaurantsByKeyword(
  keyword: string,
  latitude: number,
  longitude: number,
  radius: number = 2000,
): Promise<Restaurant[]> {
  const queryParams = new URLSearchParams({
    query: keyword,
    category_group_code: "FD6",
    x: longitude.toString(),
    y: latitude.toString(),
    radius: radius.toString(),
    sort: "distance",
    size: "15",
  });

  const response = await fetch(
    `${KAKAO_API_BASE}/keyword.json?${queryParams}`,
    {
      headers: {
        Authorization: `KakaoAK ${KAKAO_API_KEY}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Kakao API Error: ${response.status}`);
  }

  const data: KakaoSearchResponse = await response.json();
  return data.documents.map(transformToRestaurant);
}
