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

  // 랜덤 선택 로직
  const pickRandom = useCallback(() => {
    if (restaurants.length === 0) return;

    setIsShuffling(true);
    setSelectedRestaurant(null);

    // 셔플 애니메이션 (이름 보여주기)
    let count = 0;
    const maxCount = 20; // 몇 번 바뀔지
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * restaurants.length);
      setDisplayRestaurant(restaurants[randomIndex]);
      count++;

      if (count >= maxCount) {
        clearInterval(interval);
        // 최종 선택
        const winnerIndex = Math.floor(Math.random() * restaurants.length);
        const winner = restaurants[winnerIndex];
        setDisplayRestaurant(winner);
        setSelectedRestaurant(winner);
        setIsShuffling(false);
      }
    }, 100); // 0.1초마다 변경
  }, [restaurants]);

  // 모달이 열리면 자동으로 시작
  useEffect(() => {
    if (isOpen && restaurants.length > 0) {
      pickRandom();
    } else {
      // 초기화
      setIsShuffling(false);
      setDisplayRestaurant(null);
      setSelectedRestaurant(null);
    }
  }, [isOpen, restaurants, pickRandom]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 백드롭 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* 모달 컨텐츠 */}
      <div className="relative bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl transform transition-all animate-bounce-in">
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
