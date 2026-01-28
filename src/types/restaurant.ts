export interface BusinessHours {
  open: string; // "09:00"
  close: string; // "21:00"
}

export interface Restaurant {
  id: string;
  name: string;
  category: Category;
  description: string;
  address: string;
  distance?: number; // meters
  rating: number;
  reviewCount: number;
  priceRange: 1 | 2 | 3; // $ $$ $$$
  imageUrl: string;
  phoneNumber?: string;
  placeUrl?: string;
  latitude?: number;
  longitude?: number;

  // 영업 정보
  businessHours: {
    monday: BusinessHours | null;
    tuesday: BusinessHours | null;
    wednesday: BusinessHours | null;
    thursday: BusinessHours | null;
    friday: BusinessHours | null;
    saturday: BusinessHours | null;
    sunday: BusinessHours | null;
  };

  holidays: string[]; // ["2026-01-01", "2026-01-27"] ISO date strings

  // 추천 메뉴
  recommendedMenus: Menu[];
}

export interface Menu {
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  isPopular?: boolean;
}

export type Category =
  | "korean" // 한식
  | "chinese" // 중식
  | "japanese" // 일식
  | "western" // 양식
  | "asian" // 아시안
  | "snack" // 분식
  | "cafe" // 카페
  | "fastfood"; // 패스트푸드

export interface CategoryInfo {
  key: Category;
  label: string;
  emoji: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { key: "korean", label: "한식", emoji: "🍚" },
  { key: "chinese", label: "중식", emoji: "🥟" },
  { key: "japanese", label: "일식", emoji: "🍣" },
  { key: "western", label: "양식", emoji: "🍝" },
  { key: "asian", label: "아시안", emoji: "🍜" },
  { key: "snack", label: "분식", emoji: "🍢" },
  { key: "cafe", label: "카페", emoji: "☕" },
  { key: "fastfood", label: "패스트푸드", emoji: "🍔" },
];

export type OpenStatus =
  | "open"
  | "closed"
  | "holiday"
  | "opening-soon"
  | "closing-soon";
