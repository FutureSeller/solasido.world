import { useState, useEffect, useCallback } from 'react';
import type { Recipe, RecipesListResponse } from '../types/recipe';

interface UseRecipesReturn {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  refetch: () => void;
}

export function useRecipes(query: string, page: number, limit: number): UseRecipesReturn {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (query.trim()) {
        params.set('q', query.trim());
      }

      const response = await fetch(`/api/recipes?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }

      const data: RecipesListResponse = await response.json();
      setRecipes(data.recipes);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setRecipes([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [query, page, limit]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  return {
    recipes,
    loading,
    error,
    totalPages,
    refetch: fetchRecipes,
  };
}
