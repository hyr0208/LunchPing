import {
  CATEGORIES,
  type CategoryInfo,
  type Restaurant,
} from "../../types/restaurant";
import { useState, useEffect } from "react";
import { formatDistance } from "../../utils/timeUtils";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

// function StatusBadge removed (fake logic)

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  // getOpenStatus removed
  const category = CATEGORIES.find(
    (c: CategoryInfo) => c.key === restaurant.category,
  );
  const popularMenus = restaurant.recommendedMenus.filter((m) => m.isPopular);

  const [imgSrc, setImgSrc] = useState(restaurant.imageUrl);

  // restaurant prop이 변경되면 이미지도 리셋 (props 변경 대응)
  useEffect(() => {
    setImgSrc(restaurant.imageUrl);
  }, [restaurant.imageUrl]);

  const handleOpenMap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (restaurant.placeUrl) {
      window.open(restaurant.placeUrl, "_blank");
    }
  };

  const handleImageError = () => {
    setImgSrc(
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
    );
  };

  return (
    <div
      onClick={handleOpenMap}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100 flex flex-col h-full"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={imgSrc}
          alt={restaurant.name}
          onError={handleImageError}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

        {/* 카테고리 */}
        <div className="absolute top-3 right-3">
          <span className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium text-gray-700">
            {category?.emoji} {category?.label}
          </span>
        </div>

        {/* 하단 정보 */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          <div>
            <h3 className="text-white font-bold text-lg drop-shadow-md">
              {restaurant.name}
            </h3>
            <p className="text-white/80 text-xs mt-0.5">{restaurant.address}</p>
          </div>
          {restaurant.distance && (
            <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs font-medium">
              {formatDistance(restaurant.distance)}
            </span>
          )}
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="p-4">
        {/* 설명 */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-1">
          {restaurant.description}
        </p>

        <div className="flex justify-between items-center">
          {/* 인기 메뉴 (있으면 표시) */}
          <div className="flex flex-wrap gap-1.5 flex-1">
            {popularMenus.length > 0 ? (
              popularMenus.slice(0, 2).map((menu, index) => (
                <span
                  key={index}
                  className="bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full text-xs font-medium"
                >
                  🔥 {menu.name}
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-xs">메뉴 정보 없음</span>
            )}
          </div>

          {/* 상세보기 버튼 */}
          {restaurant.placeUrl && (
            <button
              onClick={handleOpenMap}
              className="ml-2 flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            >
              <span>상세보기</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
