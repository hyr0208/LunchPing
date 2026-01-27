import {
  CATEGORIES,
  type Category,
  type CategoryInfo,
} from "../../types/restaurant";

interface CategoryFilterProps {
  selectedCategory: Category | "all";
  onCategoryChange: (category: Category | "all") => void;
}

export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {/* 전체 버튼 */}
      <button
        onClick={() => onCategoryChange("all")}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200
          ${
            selectedCategory === "all"
              ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30"
              : "bg-white hover:bg-gray-50 text-gray-700 shadow-sm border border-gray-100"
          }`}
      >
        <span>🍴</span>
        <span>전체</span>
      </button>

      {/* 카테고리 버튼들 */}
      {CATEGORIES.map((category: CategoryInfo) => (
        <button
          key={category.key}
          onClick={() => onCategoryChange(category.key)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200
            ${
              selectedCategory === category.key
                ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30"
                : "bg-white hover:bg-gray-50 text-gray-700 shadow-sm border border-gray-100"
            }`}
        >
          <span>{category.emoji}</span>
          <span>{category.label}</span>
        </button>
      ))}
    </div>
  );
}
