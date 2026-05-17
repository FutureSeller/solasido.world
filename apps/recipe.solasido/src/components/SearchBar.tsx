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
      <div className="surface-card rounded-[24px] px-4 py-4 sm:px-5">
        <div className="group relative flex min-h-[60px] items-center rounded-[18px] border border-[var(--line)] bg-[#fffdfa] transition-all duration-200 ease-out focus-within:border-[var(--line-strong)] focus-within:shadow-[0_12px_26px_rgba(56,32,16,0.06)]">
          <div className="pointer-events-none absolute left-4 text-sm font-medium tracking-[0.02em] text-[var(--text-soft)]">
            검색
          </div>

          <input
            type="text"
            className="text-strong flex-1 border-none bg-transparent px-4 py-4 pl-[62px] pr-14 text-[15px] font-medium outline-none placeholder:font-normal placeholder:text-[var(--text-soft)] sm:text-base"
            placeholder="레시피 이름이나 재료로 검색"
            autoComplete="off"
            value={query}
            onChange={(e) => onChange(e.target.value)}
          />

          {isSearching && (
            <button
              className="absolute right-3 flex h-9 w-9 items-center justify-center rounded-full text-base font-semibold text-[var(--text-soft)] transition-colors duration-200 hover:bg-[var(--surface-muted)] hover:text-[var(--text-strong)]"
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
              ? `"${query}" 기준으로 다시 찾고 있습니다.`
              : '이름, 재료, 기억나는 단어로 바로 좁혀서 볼 수 있습니다.'}
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-[var(--text-soft)]">
            <span>두부</span>
            <span>볶음</span>
            <span>15분</span>
          </div>
        </div>
      </div>
    </section>
  );
}
