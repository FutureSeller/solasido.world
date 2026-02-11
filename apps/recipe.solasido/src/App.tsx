import { useState, useEffect } from 'react';
import { RecipeCard } from './components/RecipeCard';
import { DetailModal } from './components/DetailModal';
import { SearchBar } from './components/SearchBar';
import { Pagination } from './components/Pagination';
import { EmptyState } from './components/EmptyState';
import { LoadingState } from './components/LoadingState';
import { useRecipes } from './hooks/useRecipes';
import { useKeyboardShortcut } from './hooks/useKeyboardShortcut';
import { useBodyScrollLock } from './hooks/useBodyScrollLock';
import { RECIPES_PER_PAGE } from './lib/constants';
import type { Recipe } from './types/recipe';

export default function App() {
  const [query, setQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { recipes, loading, totalPages } = useRecipes(query, currentPage, RECIPES_PER_PAGE);

  useKeyboardShortcut('Escape', () => setSelectedRecipe(null));
  useBodyScrollLock(!!selectedRecipe);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  return (
    <div className="min-h-screen">
      <header className="orange-gradient relative overflow-hidden py-10 px-5 text-center shadow-[0_4px_20px_rgba(0,0,0,0.1)] mb-10">
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
          backgroundImage: "url('data:image/svg+xml,<svg width=\"100\" height=\"100\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"50\" cy=\"50\" r=\"40\" fill=\"rgba(255,255,255,0.05)\"/></svg>')"
        }} />
        <h1 className="text-white font-bold text-5xl m-0 relative z-10 animate-[slideDown_0.6s_ease-out]" style={{
          textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
        }}>
          🍳 여우의 레시피 모음 👩🏻‍🍳
        </h1>
      </header>

      <SearchBar
        query={query}
        resultCount={recipes.length}
        onChange={setQuery}
        onClear={() => setQuery('')}
      />

      <main className="max-w-[1400px] mx-auto px-5">
        {loading ? (
          <LoadingState />
        ) : recipes.length === 0 ? (
          <EmptyState isSearching={query.trim().length > 0} />
        ) : (
          <>
            <div className="grid gap-[30px] mt-[30px] animate-[fadeIn_0.8s_ease-out]" style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))'
            }}>
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} onOpen={setSelectedRecipe} />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onFirst={() => setCurrentPage(1)}
              onPrev={() => setCurrentPage(Math.max(1, currentPage - 1))}
              onNext={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              onLast={() => setCurrentPage(totalPages)}
            />
          </>
        )}
      </main>

      <DetailModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
    </div>
  );
}
