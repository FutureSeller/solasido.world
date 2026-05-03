import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import type { Recipe, RecipesListResponse } from '../types/recipe';

interface UseRecipesReturn {
  recipes: Recipe[];
  loadingMore: boolean;
  totalCount: number;
  hasNextPage: boolean;
  loadMore: () => void;
  refetch: () => void;
}

export function useRecipes(query: string, limit: number): UseRecipesReturn {
  const normalizedQuery = query.trim();
  const result = useSuspenseInfiniteQuery({
    queryKey: ['recipes', normalizedQuery, limit],
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        limit: String(limit),
      });

      if (normalizedQuery) {
        params.set('q', normalizedQuery);
      }

      const response = await fetch(`/api/recipes?${params.toString()}`, { signal });

      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }

      return response.json() as Promise<RecipesListResponse>;
    },
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });

  const recipes = result.data.pages.flatMap((page) => page.recipes);
  const totalCount = result.data.pages[0]?.pagination.totalCount ?? 0;

  return {
    recipes,
    loadingMore: result.isFetchingNextPage,
    totalCount,
    hasNextPage: !!result.hasNextPage,
    loadMore: () => {
      void result.fetchNextPage();
    },
    refetch: () => {
      void result.refetch();
    },
  };
}
