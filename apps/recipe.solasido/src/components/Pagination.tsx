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

  const buttonClass =
    'rounded-full border border-[var(--line)] bg-white/82 px-4 py-2.5 text-sm font-medium text-[var(--text-base)] transition-all duration-200 hover:enabled:-translate-y-px hover:enabled:border-[var(--line-strong)] hover:enabled:text-[var(--text-strong)] disabled:cursor-not-allowed disabled:opacity-35';

  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5 pb-4 sm:mt-12">
      <button
        onClick={onFirst}
        disabled={currentPage === 1}
        className={buttonClass}
      >
        처음
      </button>

      <button
        onClick={onPrev}
        disabled={currentPage === 1}
        className={buttonClass}
      >
        이전
      </button>

      <div className="surface-card rounded-full px-4 py-2">
        <span className="text-soft text-xs font-semibold uppercase tracking-[0.18em]">Page</span>
        <span className="text-strong ml-2 text-sm font-semibold">
          {currentPage} / {totalPages}
        </span>
      </div>

      <button
        onClick={onNext}
        disabled={currentPage === totalPages}
        className={buttonClass}
      >
        다음
      </button>

      <button
        onClick={onLast}
        disabled={currentPage === totalPages}
        className={buttonClass}
      >
        끝
      </button>
    </div>
  );
}
