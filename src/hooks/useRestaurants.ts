import { useState, useEffect, useCallback } from "react";
import type { Restaurant } from "../types/restaurant";
import { searchNearbyRestaurants } from "../services/kakaoApi";

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

        setState((prev) => {
          // 새 식당 데이터를 기존 데이터에 병합 (중복 제거)
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
