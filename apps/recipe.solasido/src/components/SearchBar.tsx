interface SearchBarProps {
  query: string;
  resultCount: number;
  onChange: (value: string) => void;
  onClear: () => void;
}

export function SearchBar({ query, resultCount, onChange, onClear }: SearchBarProps) {
  const isSearching = query.trim().length > 0;

  return (
    <div className="max-w-full mx-auto px-5 relative z-10 mb-0">
      <div className="relative flex items-center bg-white rounded-[40px] overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] border-2 border-transparent min-h-[48px] shadow-[0_8px_24px_rgba(255,85,34,0.12)] group">
        {/* Gradient border on focus */}
        <div className="absolute inset-0 rounded-[40px] p-[2px] opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" style={{
          background: 'linear-gradient(135deg, #ff9944 0%, #ff5522 100%)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude'
        }} />

        {/* Search icon */}
        <div className="absolute left-[22px] text-[1.35em] pointer-events-none transition-transform duration-300 group-focus-within:scale-110">
          🔍
        </div>

        <input
          type="text"
          className="flex-1 px-5 py-3.5 pl-[58px] border-none outline-none text-base font-medium text-[#2c3e50] bg-transparent placeholder:text-[#a0aec0] placeholder:font-normal"
          placeholder="레시피 이름이나 재료로 검색하세요..."
          autoComplete="off"
          value={query}
          onChange={(e) => onChange(e.target.value)}
        />

        {isSearching && (
          <button
            className="absolute right-3 w-[34px] h-[34px] rounded-full cursor-pointer flex items-center justify-center text-orange-main font-semibold transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:text-white hover:rotate-90 hover:scale-110 hover:shadow-[0_4px_12px_rgba(255,85,34,0.4)]"
            style={{
              background: 'linear-gradient(135deg, #ff994415 0%, #ff552215 100%)',
              border: '1px solid #ff994430'
            }}
            onClick={onClear}
            aria-label="검색 초기화"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #ff9944 0%, #ff5522 100%)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #ff994415 0%, #ff552215 100%)';
            }}
          >
            ✕
          </button>
        )}
      </div>

      {isSearching && (
        <div className="mt-4 px-7 py-4 text-orange-main text-[1.1em] font-semibold text-center rounded-xl border border-[#ff994415] animate-[slideDown_0.3s_ease-out]" style={{
          background: 'linear-gradient(135deg, #ff994408 0%, #ff552208 100%)'
        }}>
          {resultCount === 0
            ? `"${query}" 검색 결과가 없습니다.`
            : `총 ${resultCount}개의 레시피를 찾았습니다.`}
        </div>
      )}
    </div>
  );
}
