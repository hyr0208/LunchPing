interface HeaderProps {
  loading: boolean;
  error: string | null;
  onRefreshLocation?: () => void;
}

export function Header({ loading, error, onRefreshLocation }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 로고 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <span className="text-xl">🍽️</span>
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-800">
                Lunch<span className="text-primary-500">Ping</span>
              </h1>
              <p className="text-xs text-gray-500">오늘 점심 뭐 먹지?</p>
            </div>
          </div>

          {/* 위치 정보 */}
          <div className="flex items-center gap-2">
            {loading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">위치 확인 중...</span>
              </div>
            ) : error ? (
              <button
                onClick={onRefreshLocation}
                className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors"
              >
                <span className="text-sm">📍 위치 권한 필요</span>
              </button>
            ) : (
              <button
                onClick={onRefreshLocation}
                className="flex items-center gap-2 text-gray-600 hover:text-primary-500 transition-colors"
              >
                <span className="text-lg">📍</span>
                <span className="text-sm font-medium">내 주변</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
