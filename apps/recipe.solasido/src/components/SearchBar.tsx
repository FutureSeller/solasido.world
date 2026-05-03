interface SearchBarProps {
  query: string;
  isSearching: boolean;
  onChange: (value: string) => void;
  onClear: () => void;
}

export function SearchBar({
  query,
  isSearching,
  onChange,
  onClear,
}: SearchBarProps) {
  return (
    <section className="relative z-10 mt-5 sm:mt-6">
      <div className="surface-card rounded-[30px] p-3 sm:p-4">
        <div className="group relative flex min-h-[62px] items-center overflow-hidden rounded-[24px] border border-transparent bg-white/82 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] focus-within:border-[var(--line-strong)] focus-within:shadow-[0_18px_36px_rgba(56,32,16,0.08)]">
          <div className="pointer-events-none absolute left-5 text-base text-[var(--text-soft)] transition-transform duration-300 group-focus-within:scale-110">
            Search
          </div>

          <input
            type="text"
            className="text-strong flex-1 border-none bg-transparent px-5 py-4 pl-[88px] pr-16 text-[15px] font-medium outline-none placeholder:font-normal placeholder:text-[var(--text-soft)] sm:text-base"
            placeholder="레시피 이름, 재료, 기억나는 단어로 검색하세요"
            autoComplete="off"
            value={query}
            onChange={(e) => onChange(e.target.value)}
          />

          {isSearching && (
            <button
              className="accent-wash text-accent absolute right-3 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] font-semibold transition-all duration-200 hover:scale-105 hover:bg-[var(--accent)] hover:text-white"
              onClick={onClear}
              aria-label="검색 초기화"
            >
              ✕
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-soft text-sm leading-6">
            {isSearching
              ? `"${query}" 기준으로 레시피를 다시 찾고 있습니다.`
              : '레시피 이름이나 재료로 바로 원하는 항목을 좁혀서 볼 수 있습니다.'}
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="ingredient-chip rounded-full px-3 py-1.5">예: 두부</span>
            <span className="ingredient-chip rounded-full px-3 py-1.5">예: 볶음</span>
            <span className="ingredient-chip rounded-full px-3 py-1.5">예: 15분</span>
          </div>
        </div>
      </div>
    </section>
  );
}
