import {
  CATEGORIES,
  type CategoryInfo,
  type OpenStatus,
  type Restaurant,
} from "../../types/restaurant";
import {
  formatDistance,
  formatPriceRange,
  getOpenStatus,
  getOpenStatusLabel,
  getTodayBusinessHoursString,
} from "../../utils/timeUtils";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

function StatusBadge({ status }: { status: OpenStatus }) {
  const label = getOpenStatusLabel(status);

  const baseClasses =
    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold";

  const statusClasses: Record<OpenStatus, string> = {
    open: "bg-emerald-100 text-emerald-700",
    closed: "bg-gray-100 text-gray-500",
    holiday: "bg-red-100 text-red-600",
    "opening-soon": "bg-amber-100 text-amber-700",
    "closing-soon": "bg-orange-100 text-orange-700",
  };

  const statusIcons: Record<OpenStatus, string> = {
    open: "🟢",
    closed: "⚫",
    holiday: "🔴",
    "opening-soon": "🟡",
    "closing-soon": "🟠",
  };

  return (
    <span className={`${baseClasses} ${statusClasses[status]}`}>
      <span className="text-[10px]">{statusIcons[status]}</span>
      {label}
    </span>
  );
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const status = getOpenStatus(restaurant.businessHours, restaurant.holidays);
  const businessHoursString = getTodayBusinessHoursString(
    restaurant.businessHours,
  );
  const category = CATEGORIES.find(
    (c: CategoryInfo) => c.key === restaurant.category,
  );
  const popularMenus = restaurant.recommendedMenus.filter((m) => m.isPopular);

  return (
    <div className="card p-0 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
      {/* 이미지 영역 */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={restaurant.imageUrl}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* 상단 배지 */}
        <div className="absolute top-3 left-3 flex gap-2">
          <StatusBadge status={status} />
        </div>

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
        {/* 평점 및 가격대 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-amber-400">★</span>
              <span className="font-semibold text-gray-800">
                {restaurant.rating}
              </span>
              <span className="text-gray-400 text-sm">
                ({restaurant.reviewCount})
              </span>
            </div>
            {/* <span className="text-primary-500 font-medium">
              {formatPriceRange(restaurant.priceRange)}
            </span> */}
          </div>
          <span className="text-gray-500 text-sm">{businessHoursString}</span>
        </div>

        {/* 설명 */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-1">
          {restaurant.description}
        </p>

        {/* 인기 메뉴 */}
        {popularMenus.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {popularMenus.slice(0, 3).map((menu, index) => (
              <span
                key={index}
                className="bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full text-xs font-medium"
              >
                🔥 {menu.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
