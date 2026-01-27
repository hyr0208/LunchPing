interface FloatingButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function FloatingButton({ onClick, disabled }: FloatingButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`fixed bottom-6 right-6 md:static md:transform-none z-50 flex items-center gap-2 px-5 py-3.5 
      bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full shadow-lg shadow-primary-500/30
      hover:shadow-primary-500/50 hover:-translate-y-1 active:translate-y-0 transition-all duration-300
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg
      font-bold text-base group`}
    >
      <span className="text-xl group-hover:rotate-12 transition-transform duration-300">
        🎲
      </span>
      <span>메뉴 추천받기</span>
    </button>
  );
}
