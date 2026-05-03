import { useSuspenseQuery } from '@tanstack/react-query';
import type { Recipe } from '../types/recipe';

export function useRecipe(id: string) {
  return useSuspenseQuery({
    queryKey: ['recipe', id],
    queryFn: async ({ signal }) => {
      const response = await fetch(`/api/recipes/${id}`, { signal });

      if (!response.ok) {
        throw new Error('Failed to fetch recipe');
      }

      return response.json() as Promise<Recipe>;
    },
  });
}
