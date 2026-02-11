import { useState, useEffect, useRef, useCallback } from "react";
import type { Restaurant } from "../../types/restaurant";
import { CATEGORIES } from "../../types/restaurant";
import { formatDistance } from "../../utils/timeUtils";

interface KakaoMapProps {
  restaurants: Restaurant[];
  userLatitude: number | null;
  userLongitude: number | null;
  onRestaurantSelect?: (restaurant: Restaurant | null) => void;
  onMapMove?: (latitude: number, longitude: number) => void;
}

export function KakaoMap({
  restaurants,
  userLatitude,
  userLongitude,
  onRestaurantSelect,
  onMapMove,
}: KakaoMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  // 마커를 식당 ID로 관리하는 Map (기존 마커 유지를 위함)
  const markersMapRef = useRef<Map<string, kakao.maps.Marker>>(new Map());
  const onMapMoveRef = useRef(onMapMove);
  const restaurantsRef = useRef<Restaurant[]>(restaurants);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const isInitialLoadRef = useRef(true);

  // onMapMove 콜백 최신 상태 유지
  useEffect(() => {
    onMapMoveRef.current = onMapMove;
  }, [onMapMove]);

  // restaurants 최신 상태 유지 (마커 클릭 시 최신 이미지 사용)
  useEffect(() => {
    restaurantsRef.current = restaurants;
  }, [restaurants]);

  // 지도 초기화
  useEffect(() => {
    if (!mapContainerRef.current || !userLatitude || !userLongitude) return;

    const initMap = () => {
      const container = mapContainerRef.current!;
      const options = {
        center: new window.kakao.maps.LatLng(userLatitude, userLongitude),
        level: 4, // 확대 레벨
      };

      const map = new window.kakao.maps.Map(container, options);
      mapRef.current = map;

      // 지도 이동 완료 이벤트 (드래그 끝났을 때) - debounce 적용
      let debounceTimer: ReturnType<typeof setTimeout>;
      window.kakao.maps.event.addListener(map, "dragend", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const center = map.getCenter();
          const lat = center.getLat();
          const lng = center.getLng();
          onMapMoveRef.current?.(lat, lng);
        }, 500); // 500ms 대기 후 검색
      });

      setIsMapReady(true);
    };

    // SDK 로드 대기 및 초기화
    const waitForKakaoAndInit = () => {
      if (window.kakao && window.kakao.maps && window.kakao.maps.load) {
        window.kakao.maps.load(initMap);
      } else {
        // SDK가 아직 로드되지 않았으면 100ms 후 재시도
        setTimeout(waitForKakaoAndInit, 100);
      }
    };

    waitForKakaoAndInit();
  }, [userLatitude, userLongitude]);

  // 마커 생성 및 업데이트 (점진적 추가 방식)
  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;

    const currentMarkers = markersMapRef.current;

    // 새 마커만 추가 (이미 있는 마커는 건너뜀)
    restaurants.forEach((restaurant) => {
      if (!restaurant.latitude || !restaurant.longitude) return;

      // 이미 마커가 있으면 건너뜀
      if (currentMarkers.has(restaurant.id)) return;

      const position = new window.kakao.maps.LatLng(
        restaurant.latitude,
        restaurant.longitude,
      );

      const marker = new window.kakao.maps.Marker({
        position,
        map: mapRef.current!,
      });

      // 마커 클릭 이벤트 — restaurantsRef로 최신 데이터 사용
      window.kakao.maps.event.addListener(marker, "click", () => {
        const latest =
          restaurantsRef.current.find((r) => r.id === restaurant.id) ||
          restaurant;
        setSelectedRestaurant(latest);
        onRestaurantSelect?.(latest);
        mapRef.current?.panTo(position);
      });

      // Map에 마커 저장
      currentMarkers.set(restaurant.id, marker);
    });

    // 최초 로드 시에만 지도 범위 조정
    if (
      isInitialLoadRef.current &&
      restaurants.length > 0 &&
      userLatitude &&
      userLongitude
    ) {
      const bounds = new window.kakao.maps.LatLngBounds();
      bounds.extend(new window.kakao.maps.LatLng(userLatitude, userLongitude));
      restaurants.forEach((r) => {
        if (r.latitude && r.longitude) {
          bounds.extend(new window.kakao.maps.LatLng(r.latitude, r.longitude));
        }
      });
      mapRef.current?.setBounds(bounds);
      isInitialLoadRef.current = false;
    }
  }, [
    isMapReady,
    restaurants,
    userLatitude,
    userLongitude,
    onRestaurantSelect,
  ]);

  const handleCloseCard = useCallback(() => {
    setSelectedRestaurant(null);
    onRestaurantSelect?.(null);
  }, [onRestaurantSelect]);

  const handleOpenDetail = useCallback(() => {
    if (selectedRestaurant?.placeUrl) {
      window.open(selectedRestaurant.placeUrl, "_blank");
    }
  }, [selectedRestaurant]);

  const category = selectedRestaurant
    ? CATEGORIES.find((c) => c.key === selectedRestaurant.category)
    : null;

  return (
    <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-lg">
      {/* 지도 컨테이너 */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* 지도 로딩 중 */}
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500">지도를 불러오는 중...</p>
          </div>
        </div>
      )}

      {/* 선택된 음식점 미니 카드 */}
      {selectedRestaurant && (
        <div className="absolute bottom-4 left-4 right-4 z-50 bg-white rounded-xl shadow-xl p-4 animate-slide-up">
          <button
            onClick={handleCloseCard}
            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            ✕
          </button>

          <div className="flex gap-4">
            {/* 이미지 */}
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={selectedRestaurant.imageUrl}
                alt={selectedRestaurant.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400";
                }}
              />
            </div>

            {/* 정보 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-800 truncate">
                  {selectedRestaurant.name}
                </h3>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600 flex-shrink-0">
                  {category?.emoji} {category?.label}
                </span>
              </div>

              <p className="text-sm text-gray-500 truncate mb-2">
                {selectedRestaurant.address}
              </p>

              <div className="flex items-center gap-3">
                {selectedRestaurant.distance && (
                  <span className="text-xs text-primary-600 font-medium">
                    📍 {formatDistance(selectedRestaurant.distance)}
                  </span>
                )}

                <button
                  onClick={handleOpenDetail}
                  className="text-xs bg-primary-500 text-white px-3 py-1.5 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  상세보기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
