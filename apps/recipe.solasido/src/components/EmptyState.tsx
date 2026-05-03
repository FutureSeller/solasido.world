interface EmptyStateProps {
  isSearching: boolean;
}

export function EmptyState({ isSearching }: EmptyStateProps) {
  return (
    <div className="surface-card rounded-[28px] px-5 py-14 text-center">
      <p className="section-label mb-3">{isSearching ? 'No Match' : 'Empty Library'}</p>
      <h3 className="text-strong text-2xl font-semibold tracking-[-0.03em]">
        {isSearching ? '검색 결과가 없습니다' : '레시피가 아직 없습니다'}
      </h3>
      <p className="text-base mx-auto mt-3 max-w-md text-sm leading-6 sm:text-base">
        {isSearching
          ? '다른 재료 이름이나 더 짧은 키워드로 다시 찾아보세요.'
          : '데이터가 들어오면 이 화면은 검색과 탐색 중심 레이아웃으로 바로 동작합니다.'}
      </p>
    </div>
  );
}
