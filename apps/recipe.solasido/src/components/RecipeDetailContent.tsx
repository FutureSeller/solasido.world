import { useState } from 'react';
import type { Recipe } from '../types/recipe';
import { resolveImage } from '../lib/imageUtils';
import { PLACEHOLDER } from '../lib/constants';

interface RecipeDetailContentProps {
  recipe: Recipe;
  imageClassName?: string;
  contentClassName?: string;
}

export function RecipeDetailContent({
  recipe,
  imageClassName = 'h-[280px] sm:h-[340px] lg:h-full',
  contentClassName = 'flex min-h-0 min-w-0 flex-col pr-1 lg:overflow-y-auto lg:overscroll-contain',
}: RecipeDetailContentProps) {
  const hasSourceUrl = recipe.sourceUrl.trim().length > 0;
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url =
      typeof window !== 'undefined'
        ? window.location.href
        : `https://recipe.solasido.world/recipes/${recipe.id}`;

    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="grid min-h-0 gap-5 sm:gap-6 lg:h-full lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
      <div className={`${imageClassName} overflow-hidden rounded-[24px] bg-[#eadfce]`}>
        <img
          className="h-full w-full object-cover"
          src={resolveImage(recipe)}
          alt={recipe.name}
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER;
          }}
        />
      </div>

      <div className={contentClassName}>
        <div className="border-b border-[var(--line)] pb-5">
          <h1 className="text-strong m-0 text-[2rem] font-semibold leading-[1.15] tracking-[-0.04em] sm:text-[2.4rem]">
            {recipe.name}
          </h1>

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

          <div className="mt-4">
            <button
              type="button"
              onClick={() => void handleShare()}
              className="surface-card inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-[var(--text-base)] transition-all duration-200 hover:-translate-y-px hover:text-[var(--text-strong)]"
            >
              {copied ? '복사됨' : '공유하기'}
            </button>
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
  );
}
