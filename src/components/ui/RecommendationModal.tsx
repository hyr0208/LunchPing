import { useEffect, useState, useCallback } from "react";
import type { Restaurant } from "../../types/restaurant";
import { RestaurantCard } from "../restaurant/RestaurantCard";

interface RecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurants: Restaurant[];
}

export function RecommendationModal({
  isOpen,
  onClose,
  restaurants,
}: RecommendationModalProps) {
  const [isShuffling, setIsShuffling] = useState(false);
  const [displayRestaurant, setDisplayRestaurant] = useState<Restaurant | null>(
    null,
  );
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);

  // 이미 추천된 음식점 ID 추적
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());

  // 랜덤 선택 로직
  const pickRandom = useCallback(() => {
    if (restaurants.length === 0) return;

    // 아직 추천되지 않은 후보군 추리기
    let candidates = restaurants.filter((r) => !seenIds.has(r.id));

    // 모든 음식점을 다 봤다면 초기화
    if (candidates.length === 0) {
      candidates = restaurants;
      setSeenIds(new Set());
    }

    setIsShuffling(true);
    setSelectedRestaurant(null);

    // 셔플 애니메이션 (이름 보여주기)
    let count = 0;
    const maxCount = 20; // 몇 번 바뀔지
    const interval = setInterval(() => {
      // 셔플 중에는 전체 목록에서 랜덤 표시 (시각적 효과)
      const randomIndex = Math.floor(Math.random() * restaurants.length);
      setDisplayRestaurant(restaurants[randomIndex]);
      count++;

      if (count >= maxCount) {
        clearInterval(interval);
        // 최종 선택 (후보군 중에서 선택)
        const winnerIndex = Math.floor(Math.random() * candidates.length);
        const winner = candidates[winnerIndex];

        setDisplayRestaurant(winner);
        setSelectedRestaurant(winner);

        // 본 목록에 추가
        setSeenIds((prev) => {
          const newSet = new Set(prev);
          newSet.add(winner.id);
          return newSet;
        });

        setIsShuffling(false);
      }
    }, 100); // 0.1초마다 변경
  }, [restaurants, seenIds]);

  // 모달이 열리면 자동으로 시작
  useEffect(() => {
    if (isOpen) {
      if (restaurants.length > 0) {
        // 모달 열릴 때 초기화하고 시작하시겠습니까?
        // 아니면 "다시 돌리기"의 연장선인가요?
        // 보통 모달을 껐다 켜면 새로운 게임으로 인식하는게 자연스러움.
        setSeenIds(new Set());
        // pickRandom은 seenIds 의존성이 있으므로,
        // 여기서 직접 호출하기보다 effect 분리가 나을 수 있으나,
        // 초기화 직후 실행이 보장되어야 함.
        // setTimeout으로 실행 순서 보장
        setTimeout(() => pickRandom(), 0);
      }
    } else {
      // 닫힐 때 초기화
      setIsShuffling(false);
      setDisplayRestaurant(null);
      setSelectedRestaurant(null);
      setSeenIds(new Set());
    }
  }, [isOpen]); // restaurants, pickRandom 제거하여 무한 루프 방지 및 의도된 제어

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 백드롭 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* 모달 컨텐츠 */}
      <div className="relative bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl transform transition-all duration-300 scale-100">
        {/* 헤더 */}
        <div className="bg-primary-50 p-4 text-center border-b border-primary-100">
          <h3 className="text-lg font-bold text-gray-800">
            {isShuffling ? "🎲 메뉴 고르는 중..." : "🎉 오늘의 추천 메뉴!"}
          </h3>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* 바디 */}
        <div className="p-6">
          {displayRestaurant ? (
            <div
              className={`transition-all duration-300 ${isShuffling ? "opacity-70 scale-95 blur-[1px]" : "opacity-100 scale-100"}`}
            >
              {/* 셔플 중에는 간단한 카드나 이름만 보여줄 수도 있지만, RestaurantCard를 그대로 써도 됨. 
                   다만 셔플 중엔 제약이 있을 수 있으니 이름과 이미지만 크게 보여주는 커스텀 뷰를 만들거나, 
                   기존 카드를 재활용하되 클릭 이벤트를 막음. */}

              {/* 당첨되었을 때 강조 효과 */}
              {!isShuffling && (
                <div className="absolute -top-2 -left-2 z-10 text-4xl animate-bounce">
                  👑
                </div>
              )}

              <div className="pointer-events-none">
                <RestaurantCard restaurant={displayRestaurant} />
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              추천할 음식점이 없어요 😢
            </div>
          )}

          {/* 버튼 영역 */}
          {!isShuffling && selectedRestaurant && (
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => {
                  if (selectedRestaurant.placeUrl) {
                    window.open(selectedRestaurant.placeUrl, "_blank");
                  }
                }}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <span>🗺️ 상세보기</span>
              </button>

              <button
                onClick={pickRandom}
                className="w-full bg-white border border-gray-200 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                🔄 다시 돌리기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
