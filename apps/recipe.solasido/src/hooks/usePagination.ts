import { useCallback, useState } from 'react';

interface UsePaginationReturn {
  currentPage: number;
  goToPage: (page: number) => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
}

export function usePagination(totalPages: number): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(1);

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(1, Math.min(totalPages, page)));
    },
    [totalPages]
  );

  const goToFirstPage = useCallback(() => goToPage(1), [goToPage]);
  const goToLastPage = useCallback(() => goToPage(totalPages), [goToPage, totalPages]);
  const goToNextPage = useCallback(() => goToPage(currentPage + 1), [goToPage, currentPage]);
  const goToPrevPage = useCallback(() => goToPage(currentPage - 1), [goToPage, currentPage]);

  return {
    currentPage,
    goToPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPrevPage,
  };
}
