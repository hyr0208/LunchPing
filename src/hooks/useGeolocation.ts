import { useState, useEffect } from "react";

// 기본 위치: 서울 시청 (위치 권한 거부 시 폴백)
const DEFAULT_LATITUDE = 37.5666805;
const DEFAULT_LONGITUDE = 126.9784147;

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  isDefaultLocation: boolean; // 기본 위치 사용 여부
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
    isDefaultLocation: false,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      // 지오로케이션 미지원 → 기본 위치 사용
      setState({
        latitude: DEFAULT_LATITUDE,
        longitude: DEFAULT_LONGITUDE,
        error: null,
        loading: false,
        isDefaultLocation: true,
      });
      return;
    }

    const successHandler = (position: GeolocationPosition) => {
      setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        error: null,
        loading: false,
        isDefaultLocation: false,
      });
    };

    const errorHandler = () => {
      // 위치 권한 거부/실패 → 기본 위치(서울 시청)로 폴백
      setState({
        latitude: DEFAULT_LATITUDE,
        longitude: DEFAULT_LONGITUDE,
        error: "위치 권한이 없어 서울 시청 기준으로 검색합니다.",
        loading: false,
        isDefaultLocation: true,
      });
    };

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5분간 캐시
    };

    navigator.geolocation.getCurrentPosition(
      successHandler,
      errorHandler,
      options,
    );
  }, []);

  const refresh = () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
          isDefaultLocation: false,
        });
      },
      () => {
        setState({
          latitude: DEFAULT_LATITUDE,
          longitude: DEFAULT_LONGITUDE,
          error: "위치 권한이 없어 서울 시청 기준으로 검색합니다.",
          loading: false,
          isDefaultLocation: true,
        });
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return { ...state, refresh };
}
