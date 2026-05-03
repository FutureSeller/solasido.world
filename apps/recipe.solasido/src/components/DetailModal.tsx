import type { Recipe } from '../types/recipe';
import { resolveImage } from '../lib/imageUtils';
import { PLACEHOLDER } from '../lib/constants';

interface DetailModalProps {
  recipe: Recipe | null;
  onClose: () => void;
}

export function DetailModal({ recipe, onClose }: DetailModalProps) {
  if (!recipe) return null;

  const hasSourceUrl = recipe.sourceUrl.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-[rgba(31,20,11,0.42)] p-0 sm:items-center sm:p-5"
      onClick={onClose}
    >
      <div
        className="surface-card-strong relative flex h-[92vh] w-full overflow-hidden rounded-t-[28px] px-4 pb-4 pt-4 animate-[panelIn_0.28s_ease-out] sm:max-w-[980px] sm:rounded-[30px] sm:px-6 sm:pb-6 sm:pt-5 lg:h-[780px]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute right-4 top-4 z-[3] flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-white/90 text-lg font-medium text-[var(--text-base)] shadow-[0_10px_24px_rgba(56,32,16,0.12)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-white hover:text-[var(--text-strong)]"
          onClick={onClose}
          aria-label="닫기"
        >
          ✕
        </button>

        <div className="grid h-full min-h-0 gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
          <div className="h-[280px] overflow-hidden rounded-[24px] bg-[#eadfce] sm:h-[340px] lg:h-full">
            <img
              className="h-full w-full object-cover"
              src={resolveImage(recipe)}
              alt={recipe.name}
              onError={(e) => {
                e.currentTarget.src = PLACEHOLDER;
              }}
            />
          </div>

          <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
            <div className="border-b border-[var(--line)] pb-5">
              <h2 className="text-strong m-0 text-[2rem] font-semibold leading-[1.15] tracking-[-0.04em] sm:text-[2.4rem]">
                {recipe.name}
              </h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="accent-wash rounded-[22px] px-4 py-3">
                  <p className="section-label mb-2">Cook Time</p>
                  <p className="text-accent text-lg font-semibold">{recipe.cookTime}</p>
                </div>
                <div className="rounded-[22px] bg-[var(--surface-muted)] px-4 py-3">
                  <p className="section-label mb-2">Ingredients</p>
                  <p className="text-strong text-lg font-semibold">{recipe.ingredients.length} items</p>
                </div>
              </div>

              {hasSourceUrl && (
                <div className="mt-4 rounded-[22px] border border-[var(--line)] bg-white/72 px-4 py-3">
                  <p className="section-label mb-2">Source</p>
                  <a
                    href={recipe.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent inline-flex items-center gap-2 text-sm font-medium underline decoration-[rgba(159,79,38,0.28)] underline-offset-4 transition-colors duration-200 hover:text-[var(--text-strong)]"
                  >
                    링크 열기
                    <span aria-hidden="true">↗</span>
                  </a>
                </div>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
              <section className="border-b border-[var(--line)] py-5">
                <p className="section-label mb-3">Ingredients</p>
                <ul className="flex list-none flex-wrap gap-2 p-0">
                  {(recipe.ingredients || []).map((ingredient, index) => (
                    <li
                      key={`${recipe.id}-${ingredient}-${index}`}
                      className="ingredient-chip rounded-full px-3 py-1.5 text-sm"
                    >
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="py-5">
                <p className="section-label mb-3">Method</p>
                <pre className="text-base m-0 whitespace-pre-wrap rounded-[24px] bg-[#f8f3eb] p-4 font-sans text-sm leading-7 sm:p-5 sm:text-[15px]">
                  {recipe.recipeText || '상세 내용은 배포 데이터 동기화 후 표시됩니다.'}
                </pre>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
