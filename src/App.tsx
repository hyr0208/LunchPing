import { useState, useMemo } from "react";
import { Header } from "./components/layout/Header";
import { CategoryFilter } from "./components/ui/CategoryFilter";
import { RestaurantCard } from "./components/restaurant/RestaurantCard";
import { FloatingButton } from "./components/ui/FloatingButton";
import { RecommendationModal } from "./components/ui/RecommendationModal";
import { useGeolocation } from "./hooks/useGeolocation";
import { useRestaurants } from "./hooks/useRestaurants";
import type { Category, Restaurant } from "./types/restaurant";

function App() {
  const {
    latitude,
    longitude,
    loading: locationLoading,
    error: locationError,
    refresh: refreshLocation,
  } = useGeolocation();
  const {
    restaurants,
    loading: restaurantsLoading,
    error: restaurantsError,
    hasMore,
    loadMore,
    refresh: refreshRestaurants,
  } = useRestaurants({
    latitude,
    longitude,
    radius: 1000, // 1km 반경
  });

  const [selectedCategory, setSelectedCategory] = useState<Category | "all">(
    "all",
  );
  const [isRecommendationModalOpen, setIsRecommendationModalOpen] =
    useState(false);

  const filteredRestaurants = useMemo(() => {
    let filtered: Restaurant[] = restaurants;

    // 카테고리 필터
    if (selectedCategory !== "all") {
      filtered = filtered.filter((r) => r.category === selectedCategory);
    }

    return filtered;
  }, [restaurants, selectedCategory]);

  const isLoading = locationLoading || restaurantsLoading;
  const error = locationError || restaurantsError;

  return (
    <div className="min-h-screen pb-24 relative">
      <Header
        loading={locationLoading}
        error={locationError}
        onRefreshLocation={refreshLocation}
      />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* 타이틀 섹션 */}
        <section className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            🍴 오늘의 점심 추천
          </h2>
          <p className="text-gray-500">
            {latitude && longitude
              ? "현재 위치 기준 주변 맛집을 추천해 드려요"
              : "위치 정보를 허용하면 주변 맛집을 추천해 드려요"}
          </p>
        </section>

        {/* 필터 섹션 */}
        <section className="mb-6 space-y-4">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          {/* 하단 툴바 */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-gray-400">
              총 {filteredRestaurants.length}개 음식점
            </span>

            {restaurants.length > 0 && (
              <button
                onClick={refreshRestaurants}
                className="ml-auto text-sm text-primary-500 hover:text-primary-600 font-medium"
              >
                🔄 새로고침
              </button>
            )}
          </div>
        </section>

        {/* 로딩 상태 */}
        {isLoading && restaurants.length === 0 && (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">주변 맛집을 찾고 있어요...</p>
          </div>
        )}

        {/* 에러 상태 */}
        {error && !isLoading && restaurants.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😢</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              음식점을 불러올 수 없어요
            </h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button onClick={refreshLocation} className="btn-primary">
              다시 시도하기
            </button>
          </div>
        )}

        {/* 음식점 목록 */}
        {!isLoading && !error && (
          <section>
            {filteredRestaurants.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredRestaurants.map((restaurant) => (
                    <RestaurantCard
                      key={restaurant.id}
                      restaurant={restaurant}
                    />
                  ))}
                </div>

                {/* 더보기 버튼 */}
                {hasMore && selectedCategory === "all" && (
                  <div className="text-center mt-8">
                    <button
                      onClick={loadMore}
                      disabled={restaurantsLoading}
                      className="bg-white text-gray-700 font-medium py-3 px-8 rounded-xl border border-gray-200 
                               hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
                    >
                      {restaurantsLoading ? "불러오는 중..." : "더 보기"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {restaurants.length === 0
                    ? "주변에 음식점이 없어요"
                    : "조건에 맞는 음식점이 없어요"}
                </h3>
                <p className="text-gray-500">
                  {restaurants.length === 0
                    ? "검색 반경을 넓혀보세요"
                    : "다른 카테고리를 선택하거나 필터를 조정해 보세요"}
                </p>
              </div>
            )}
          </section>
        )}
      </main>

      {/* 푸터 */}
      <footer className="mt-12 py-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-400">
          <p>© 2026 LunchPing. 맛있는 점심 되세요! 🍱</p>
        </div>
      </footer>

      {/* 랜덤 추천 플로팅 버튼 & 모달 */}
      <FloatingButton
        onClick={() => setIsRecommendationModalOpen(true)}
        disabled={isLoading || filteredRestaurants.length === 0}
      />
      <RecommendationModal
        isOpen={isRecommendationModalOpen}
        onClose={() => setIsRecommendationModalOpen(false)}
        restaurants={filteredRestaurants}
      />
    </div>
  );
}

export default App;
