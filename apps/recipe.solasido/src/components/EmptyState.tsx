interface EmptyStateProps {
  isSearching: boolean;
}

export function EmptyState({ isSearching }: EmptyStateProps) {
  return (
    <div className="text-center py-[60px] px-5 text-[#95a5a6]">
      <h3 className="text-2xl mb-3 text-[#7f8c8d]">
        {isSearching ? '🔍 검색 결과가 없습니다' : '레시피가 없습니다'}
      </h3>
      <p className="text-base">
        {isSearching
          ? '다른 키워드로 검색해보세요!'
          : '새로운 레시피를 추가해보세요!'}
      </p>
    </div>
  );
}
