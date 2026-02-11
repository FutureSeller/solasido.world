interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onFirst,
  onPrev,
  onNext,
  onLast,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-3 my-[50px] mb-[30px] flex-wrap">
      <button
        onClick={onFirst}
        disabled={currentPage === 1}
        className="bg-white border-2 border-[#e0e0e0] px-4 py-2.5 rounded-lg cursor-pointer transition-all duration-300 text-[0.95em] font-medium text-[#5a6c7d] min-w-[44px] hover:enabled:text-white hover:enabled:border-transparent hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_4px_12px_rgba(255,85,34,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
        onMouseEnter={(e) => {
          if (!e.currentTarget.disabled) {
            e.currentTarget.style.background = 'linear-gradient(135deg, #ff9944 0%, #ff5522 100%)';
          }
        }}
        onMouseLeave={(e) => {
          if (!e.currentTarget.disabled) {
            e.currentTarget.style.background = 'white';
          }
        }}
      >
        첫 페이지
      </button>

      <button
        onClick={onPrev}
        disabled={currentPage === 1}
        className="bg-white border-2 border-[#e0e0e0] px-4 py-2.5 rounded-lg cursor-pointer transition-all duration-300 text-[0.95em] font-medium text-[#5a6c7d] min-w-[44px] hover:enabled:text-white hover:enabled:border-transparent hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_4px_12px_rgba(255,85,34,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
        onMouseEnter={(e) => {
          if (!e.currentTarget.disabled) {
            e.currentTarget.style.background = 'linear-gradient(135deg, #ff9944 0%, #ff5522 100%)';
          }
        }}
        onMouseLeave={(e) => {
          if (!e.currentTarget.disabled) {
            e.currentTarget.style.background = 'white';
          }
        }}
      >
        이전
      </button>

      <span className="text-[#5a6c7d] text-[0.95em] px-3 font-medium">
        페이지 {currentPage} / {totalPages}
      </span>

      <button
        onClick={onNext}
        disabled={currentPage === totalPages}
        className="bg-white border-2 border-[#e0e0e0] px-4 py-2.5 rounded-lg cursor-pointer transition-all duration-300 text-[0.95em] font-medium text-[#5a6c7d] min-w-[44px] hover:enabled:text-white hover:enabled:border-transparent hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_4px_12px_rgba(255,85,34,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
        onMouseEnter={(e) => {
          if (!e.currentTarget.disabled) {
            e.currentTarget.style.background = 'linear-gradient(135deg, #ff9944 0%, #ff5522 100%)';
          }
        }}
        onMouseLeave={(e) => {
          if (!e.currentTarget.disabled) {
            e.currentTarget.style.background = 'white';
          }
        }}
      >
        다음
      </button>

      <button
        onClick={onLast}
        disabled={currentPage === totalPages}
        className="bg-white border-2 border-[#e0e0e0] px-4 py-2.5 rounded-lg cursor-pointer transition-all duration-300 text-[0.95em] font-medium text-[#5a6c7d] min-w-[44px] hover:enabled:text-white hover:enabled:border-transparent hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_4px_12px_rgba(255,85,34,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
        onMouseEnter={(e) => {
          if (!e.currentTarget.disabled) {
            e.currentTarget.style.background = 'linear-gradient(135deg, #ff9944 0%, #ff5522 100%)';
          }
        }}
        onMouseLeave={(e) => {
          if (!e.currentTarget.disabled) {
            e.currentTarget.style.background = 'white';
          }
        }}
      >
        마지막 페이지
      </button>
    </div>
  );
}
