import { useState, useEffect, useCallback } from "react";
import type { Restaurant } from "../types/restaurant";
import {
  searchNearbyRestaurants,
  enrichRestaurantImages,
} from "../services/kakaoApi";

interface UseRestaurantsState {
  restaurants: Restaurant[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
}

interface UseRestaurantsOptions {
  latitude: number | null;
  longitude: number | null;
  radius?: number;
}

export function useRestaurants({
  latitude,
  longitude,
  radius = 1000,
}: UseRestaurantsOptions) {
  const [state, setState] = useState<UseRestaurantsState>({
    restaurants: [],
    loading: false,
    error: null,
    hasMore: false,
  });
  const [page, setPage] = useState(1);

  const fetchRestaurants = useCallback(
    async (pageNum: number = 1) => {
      if (!latitude || !longitude) return;

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const { restaurants, hasMore } = await searchNearbyRestaurants(
          latitude,
          longitude,
          radius,
          pageNum,
        );

        // 먼저 기본 이미지로 식당 목록 표시
        setState((prev) => {
          const existingIds = new Set(prev.restaurants.map((r) => r.id));
          const newRestaurants = restaurants.filter(
            (r) => !existingIds.has(r.id),
          );

          return {
            restaurants: [...prev.restaurants, ...newRestaurants],
            loading: false,
            error: null,
            hasMore,
          };
        });

        // 백그라운드로 실제 이미지 보강 (Google Places API + Supabase 캐시)
        enrichRestaurantImages(restaurants).then((enriched) => {
          setState((prev) => ({
            ...prev,
            restaurants: prev.restaurants.map((r) => {
              const updated = enriched.find((e) => e.id === r.id);
              return updated && updated.imageUrl !== r.imageUrl
                ? { ...r, imageUrl: updated.imageUrl }
                : r;
            }),
          }));
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "음식점 정보를 불러오는데 실패했습니다.",
        }));
      }
    },
    [latitude, longitude, radius],
  );

  // 위치가 변경되면 다시 조회
  useEffect(() => {
    if (latitude && longitude) {
      setPage(1);
      fetchRestaurants(1);
    }
  }, [latitude, longitude, fetchRestaurants]);

  const loadMore = useCallback(() => {
    if (!state.loading && state.hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchRestaurants(nextPage);
    }
  }, [page, state.loading, state.hasMore, fetchRestaurants]);

  const refresh = useCallback(() => {
    // 명시적 새로고침 시 기존 데이터 초기화
    setState((prev) => ({ ...prev, restaurants: [] }));
    setPage(1);
    fetchRestaurants(1);
  }, [fetchRestaurants]);

  return {
    ...state,
    loadMore,
    refresh,
  };
}
