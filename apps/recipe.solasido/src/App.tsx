import { debounce } from 'es-toolkit';
import { useMemo, useState } from 'react';
import { RecipeCard } from './components/RecipeCard';
import { DetailModal } from './components/DetailModal';
import { SearchBar } from './components/SearchBar';
import { Pagination } from './components/Pagination';
import { EmptyState } from './components/EmptyState';
import { LoadingState } from './components/LoadingState';
import { useRecipes } from './hooks/useRecipes';
import { useKeyboardShortcut } from './hooks/useKeyboardShortcut';
import { useBodyScrollLock } from './hooks/useBodyScrollLock';
import { RECIPES_PER_PAGE, SEARCH_DEBOUNCE_MS } from './lib/constants';
import type { Recipe } from './types/recipe';

export default function App() {
  const [query, setQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const updateDebouncedQuery = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedQuery(value);
      }, SEARCH_DEBOUNCE_MS),
    [],
  );

  const { recipes, loading, error, totalPages, totalCount } = useRecipes(
    debouncedQuery,
    currentPage,
    RECIPES_PER_PAGE,
  );

  useKeyboardShortcut('Escape', () => setSelectedRecipe(null));
  useBodyScrollLock(!!selectedRecipe);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    updateDebouncedQuery(value);
    setCurrentPage(1);
  };

  const isSearching = query.trim().length > 0;

  return (
    <div className="min-h-screen pb-14">
      <div className="page-shell pt-5 sm:pt-7">
        <header className="hero-panel relative overflow-hidden rounded-[32px] px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          <div className="absolute inset-0 pointer-events-none opacity-80">
            <div className="absolute -left-12 top-0 h-32 w-32 rounded-full bg-[#e6c7aa]/40 blur-3xl" />
            <div className="absolute right-0 top-8 h-28 w-28 rounded-full bg-[#b9c79b]/30 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-[#cf7b4c]/20 blur-3xl" />
          </div>

          <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-end">
            <div className="max-w-3xl">
              <p className="section-label mb-3">Recipe Library</p>
              <h1 className="text-strong m-0 max-w-[12ch] text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
                여우의 레시피를
                <br />
                편하게 찾는 화면
              </h1>
              <p className="text-base mt-4 max-w-2xl text-[15px] leading-7 sm:text-base">
                이미지 몇 장만 훑는 리스트 대신, 찾고 싶은 재료와 조리 시간을 기준으로 빠르게
                탐색하는 레시피 라이브러리로 정리했습니다.
              </p>
            </div>

            <div className="surface-card rounded-[28px] p-4 sm:p-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[22px] bg-white/70 px-4 py-3">
                  <p className="section-label mb-2">Total Recipes</p>
                  <p className="text-strong text-2xl font-semibold">{totalCount || '...'}</p>
                </div>
                <div className="rounded-[22px] bg-white/70 px-4 py-3">
                  <p className="section-label mb-2">This Page</p>
                  <p className="text-strong text-2xl font-semibold">{recipes.length}</p>
                </div>
                <div className="rounded-[22px] bg-white/70 px-4 py-3">
                  <p className="section-label mb-2">Browse Mode</p>
                  <p className="text-strong text-lg font-semibold">
                    {isSearching ? 'Search' : 'Latest'}
                  </p>
                </div>
              </div>
              <p className="text-soft mt-3 text-sm leading-6">
                {isSearching
                  ? `현재 "${query}" 기준으로 결과를 정리하고 있습니다.`
                  : '레시피 이름이나 재료를 바로 검색해서 원하는 항목으로 좁힐 수 있습니다.'}
              </p>
            </div>
          </div>
        </header>

        <SearchBar
          query={query}
          isSearching={isSearching}
          totalCount={totalCount}
          currentCount={recipes.length}
          onChange={handleQueryChange}
          onClear={() => handleQueryChange('')}
        />

        <main className="mt-6">
          {error ? (
            <div className="surface-card rounded-[26px] px-5 py-8 text-center">
              <p className="section-label mb-2">Fetch Error</p>
              <h2 className="text-strong text-2xl font-semibold">레시피를 불러오지 못했습니다</h2>
              <p className="text-base mt-3 text-sm sm:text-base">
                잠시 후 다시 시도해주세요. 문제가 계속되면 API 응답 상태를 확인해야 합니다.
              </p>
              <p className="text-soft mt-2 text-sm">{error}</p>
            </div>
          ) : loading ? (
            <LoadingState />
          ) : recipes.length === 0 ? (
            <EmptyState isSearching={isSearching} />
          ) : (
            <>
              <section className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="section-label mb-2">Browse Results</p>
                  <h2 className="text-strong text-[28px] font-semibold tracking-[-0.03em]">
                    {isSearching ? '검색 결과' : '전체 레시피'}
                  </h2>
                </div>
                <p className="text-soft text-sm leading-6 sm:max-w-md sm:text-right">
                  {isSearching
                    ? `${totalCount}개 중 현재 페이지에서 ${recipes.length}개를 보고 있습니다.`
                    : '최근 저장된 레시피를 차분한 카드 밀도로 정리했습니다.'}
                </p>
              </section>

              <div
                className="grid gap-5 animate-[fadeIn_0.55s_ease-out] sm:gap-6 xl:grid-cols-3"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
              >
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
      </div>

      <DetailModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
    </div>
  );
}
