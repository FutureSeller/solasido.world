import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { debounce } from 'es-toolkit';
import { useQueryClient } from '@tanstack/react-query';
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
  useParams,
  type Location,
} from 'react-router-dom';
import { RecipeCard } from './components/RecipeCard';
import { DetailModal } from './components/DetailModal';
import { RecipeDetailPage } from './components/RecipeDetailPage';
import { SearchBar } from './components/SearchBar';
import { EmptyState } from './components/EmptyState';
import { LoadingState } from './components/LoadingState';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useRecipe } from './hooks/useRecipe';
import { useRecipes } from './hooks/useRecipes';
import { RECIPES_PER_PAGE, SEARCH_DEBOUNCE_MS } from './lib/constants';
import type { Recipe } from './types/recipe';

interface RecipeListSectionProps {
  query: string;
  isSearching: boolean;
}

function RecipeListSection({ query, isSearching }: RecipeListSectionProps) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const { recipes, loadingMore, hasNextPage, loadMore } = useRecipes(query, RECIPES_PER_PAGE);

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '240px 0px' },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasNextPage, loadMore]);

  const handleRecipeOpen = (recipe: Recipe) => {
    queryClient.setQueryData(['recipe', recipe.id], recipe);
    navigate(`/recipes/${recipe.id}`, {
      state: { backgroundLocation: location },
    });
  };

  return (
    <>
      {recipes.length === 0 ? (
        <EmptyState isSearching={isSearching} />
      ) : (
        <>
          <div
            className="grid gap-5 animate-[fadeIn_0.55s_ease-out] sm:gap-6 xl:grid-cols-3"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
          >
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} onOpen={handleRecipeOpen} />
            ))}
          </div>

          {(hasNextPage || loadingMore) && (
            <div
              ref={loadMoreRef}
              className="surface-card mt-8 flex min-h-[88px] items-center justify-center rounded-[26px] px-5 py-6 text-center"
            >
              <p className="text-soft text-sm leading-6">
                {loadingMore
                  ? '다음 레시피를 불러오는 중입니다.'
                  : '아래로 더 내려가면 다음 레시피를 자동으로 불러옵니다.'}
              </p>
            </div>
          )}

          {!hasNextPage && recipes.length > 0 && (
            <div className="mt-8 px-4 py-2 text-center">
              <p className="text-soft text-sm leading-6">모든 레시피를 다 불러왔습니다.</p>
            </div>
          )}
        </>
      )}
    </>
  );
}

function RecipeDetailModalRoute() {
  const navigate = useNavigate();
  const params = useParams();
  const recipeId = params.id as string;

  const { data: recipe } = useRecipe(recipeId);

  return <DetailModal recipe={recipe} onClose={() => navigate(-1)} />;
}

function RecipeDetailPageRoute() {
  const params = useParams();
  const recipeId = params.id as string;

  const { data: recipe } = useRecipe(recipeId);

  return <RecipeDetailPage recipe={recipe} />;
}

function RecipesErrorState({ error }: { error: Error }) {
  return (
    <div className="surface-card rounded-[26px] px-5 py-8 text-center">
      <p className="section-label mb-2">Fetch Error</p>
      <h2 className="text-strong text-2xl font-semibold">레시피를 불러오지 못했습니다</h2>
      <p className="text-base mt-3 text-sm sm:text-base">
        잠시 후 다시 시도해주세요. 문제가 계속되면 API 응답 상태를 확인해야 합니다.
      </p>
      <p className="text-soft mt-2 text-sm">{error.message}</p>
    </div>
  );
}

function RecipeListPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const isSearching = query.trim().length > 0;
  const updateDebouncedQuery = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedQuery(value);
      }, SEARCH_DEBOUNCE_MS),
    [],
  );

  const handleQueryChange = (value: string) => {
    setQuery(value);
    updateDebouncedQuery(value);
  };

  return (
    <div className="min-h-screen pb-14">
      <div className="page-shell pt-5 sm:pt-7">
        <header className="hero-panel relative overflow-hidden rounded-[32px] px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          <div className="absolute inset-0 pointer-events-none opacity-80">
            <div className="absolute -left-12 top-0 h-32 w-32 rounded-full bg-[#e6c7aa]/40 blur-3xl" />
            <div className="absolute right-0 top-8 h-28 w-28 rounded-full bg-[#b9c79b]/30 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-[#cf7b4c]/20 blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-strong m-0 max-w-[12ch] text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
                여우의 레시피
              </h1>
              <p className="text-base mt-4 max-w-2xl text-[15px] leading-7 sm:text-base">
                재료 이름이나 기억나는 단어로 검색해서 필요한 레시피만 차분하게 골라볼 수
                있습니다.
              </p>
            </div>
          </div>
        </header>

        <SearchBar
          query={query}
          isSearching={isSearching}
          onChange={handleQueryChange}
          onClear={() => handleQueryChange('')}
        />

        <main className="mt-6">
          <ErrorBoundary
            resetKey={debouncedQuery.trim()}
            fallback={(error) => <RecipesErrorState error={error} />}
          >
            <Suspense fallback={<LoadingState />}>
              <RecipeListSection
                query={debouncedQuery}
                isSearching={isSearching}
              />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location } | null;
  const backgroundLocation = state?.backgroundLocation;

  return (
    <>
      <Routes location={backgroundLocation || location}>
        <Route path="/" element={<RecipeListPage />} />
        <Route
          path="/recipes/:id"
          element={
            <ErrorBoundary fallback={(error) => <RecipesErrorState error={error} />}>
              <Suspense fallback={<LoadingState />}>
                <RecipeDetailPageRoute />
              </Suspense>
            </ErrorBoundary>
          }
        />
      </Routes>

      {backgroundLocation && (
        <Routes>
          <Route
            path="/recipes/:id"
            element={
              <ErrorBoundary fallback={(error) => <RecipesErrorState error={error} />}>
                <Suspense fallback={<LoadingState />}>
                  <RecipeDetailModalRoute />
                </Suspense>
              </ErrorBoundary>
            }
          />
        </Routes>
      )}
    </>
  );
}
