import { useState, useEffect } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "이 브라우저에서는 위치 서비스를 지원하지 않습니다.",
        loading: false,
      }));
      return;
    }

    const successHandler = (position: GeolocationPosition) => {
      setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        error: null,
        loading: false,
      });
    };

    const errorHandler = (error: GeolocationPositionError) => {
      let errorMessage: string;

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage =
            "위치 접근 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "위치 정보를 가져올 수 없습니다.";
          break;
        case error.TIMEOUT:
          errorMessage = "위치 정보 요청 시간이 초과되었습니다.";
          break;
        default:
          errorMessage = "위치 정보를 가져오는 중 오류가 발생했습니다.";
      }

      setState((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
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
        });
      },
      (error) => {
        setState((prev) => ({
          ...prev,
          error: error.message,
          loading: false,
        }));
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return { ...state, refresh };
}
