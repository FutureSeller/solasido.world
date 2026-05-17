import { useState } from 'react';
import type { Recipe } from '../types/recipe';
import { resolveImage } from '../lib/imageUtils';
import { PLACEHOLDER } from '../lib/constants';

interface RecipeDetailContentProps {
  recipe: Recipe;
}

function useShareAction(recipe: Recipe) {
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

  return { copied, handleShare };
}

function RecipeHeroImage({
  recipe,
  className,
  overlayTags = false,
}: {
  recipe: Recipe;
  className: string;
  overlayTags?: boolean;
}) {
  const hasTags = overlayTags && recipe.tags.length > 0;

  return (
    <div className={`${className} relative overflow-hidden rounded-[24px] bg-[#eadfce]`}>
      <img
        className="h-full w-full object-cover"
        src={resolveImage(recipe)}
        alt={recipe.name}
        onError={(e) => {
          e.currentTarget.src = PLACEHOLDER;
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(35,22,11,0.18)] via-transparent to-transparent" />

      {hasTags && (
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
          {recipe.tags.slice(0, 4).map((tag, index) => (
            <span
              key={`${recipe.id}-hero-tag-${tag}-${index}`}
              className="rounded-full border border-white/35 bg-[rgba(255,250,244,0.18)] px-3 py-1 text-xs font-medium text-white backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function DetailActions({
  copied,
  hasSourceUrl,
  sourceUrl,
  onShare,
}: {
  copied: boolean;
  hasSourceUrl: boolean;
  sourceUrl: string;
  onShare: () => Promise<void>;
}) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => void onShare()}
        className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/76 px-4 py-2 text-sm font-medium text-[var(--text-base)] transition-all duration-200 hover:-translate-y-px hover:text-[var(--text-strong)]"
      >
        {copied ? '복사됨' : '공유하기'}
      </button>

      {hasSourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="text-accent inline-flex items-center gap-2 text-sm font-medium underline decoration-[rgba(159,79,38,0.28)] underline-offset-4 transition-colors duration-200 hover:text-[var(--text-strong)]"
        >
          원문 보기
          <span aria-hidden="true">↗</span>
        </a>
      )}
    </div>
  );
}

function IngredientsCardGrid({ recipe }: { recipe: Recipe }) {
  return (
    <section className="border-b border-[var(--line)] py-6">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="section-label mb-2">재료</p>
          <h2 className="text-strong m-0 text-[1.1rem] font-semibold tracking-[-0.02em]">
            필요한 재료
          </h2>
        </div>
        <p className="text-soft text-sm">{recipe.ingredients.length}개</p>
      </div>
      <ul className="grid list-none gap-2.5 p-0 sm:grid-cols-2">
        {(recipe.ingredients || []).map((ingredient, index) => (
          <li
            key={`${recipe.id}-${ingredient}-${index}`}
            className="rounded-[16px] border border-[var(--line)] bg-[#fffdfa] px-3.5 py-3 text-sm text-[var(--text-base)]"
          >
            {ingredient}
          </li>
        ))}
      </ul>
    </section>
  );
}

function IngredientsChipList({ recipe }: { recipe: Recipe }) {
  return (
    <section className="border-b border-[var(--line)] py-5">
      <div className="mb-4">
        <p className="section-label mb-2">재료</p>
        <h2 className="text-strong m-0 text-[1.05rem] font-semibold tracking-[-0.02em]">
          필요한 재료
        </h2>
      </div>
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
  );
}

function MethodSection({
  title,
  className,
  recipeText,
}: {
  title: string;
  className: string;
  recipeText: string;
}) {
  return (
    <section className={className}>
      <div className="mb-4">
        <p className="section-label mb-2">조리 방법</p>
        <h2 className="text-strong m-0 text-[1.1rem] font-semibold tracking-[-0.02em]">{title}</h2>
      </div>
      <pre className="text-base m-0 whitespace-pre-wrap rounded-[18px] border border-[var(--line)] bg-[#fbf7f1] px-4 py-4 font-sans text-sm leading-7 sm:px-5 sm:py-5 sm:text-[15px]">
        {recipeText || '상세 내용은 배포 데이터 동기화 후 표시됩니다.'}
      </pre>
    </section>
  );
}

export function RecipeDetailPageContent({ recipe }: RecipeDetailContentProps) {
  const { copied, handleShare } = useShareAction(recipe);
  const hasSourceUrl = recipe.sourceUrl.trim().length > 0;

  return (
    <div className="grid min-h-0 gap-6 sm:gap-7 lg:h-full lg:grid-cols-[minmax(0,1.02fr)_minmax(320px,0.98fr)] lg:gap-8">
      <RecipeHeroImage
        recipe={recipe}
        className="h-[300px] sm:h-[360px] lg:h-full"
        overlayTags={true}
      />

      <div className="flex min-h-0 min-w-0 flex-col">
        <div className="border-b border-[var(--line)] pb-6">
          <h1 className="text-strong m-0 text-[2rem] font-semibold leading-[1.1] tracking-[-0.04em] sm:text-[2.45rem]">
            {recipe.name}
          </h1>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[18px] border border-[var(--line)] bg-[#fffaf4] px-4 py-3">
              <p className="section-label mb-1.5">조리 시간</p>
              <p className="text-strong text-base font-semibold">{recipe.cookTime}</p>
            </div>
            <div className="rounded-[18px] border border-[var(--line)] bg-[#fffaf4] px-4 py-3">
              <p className="section-label mb-1.5">재료 수</p>
              <p className="text-strong text-base font-semibold">{recipe.ingredients.length}개</p>
            </div>
          </div>

          <DetailActions
            copied={copied}
            hasSourceUrl={hasSourceUrl}
            sourceUrl={recipe.sourceUrl}
            onShare={handleShare}
          />
        </div>

        <IngredientsCardGrid recipe={recipe} />
        <MethodSection
          title="순서와 메모"
          className="py-6"
          recipeText={recipe.recipeText}
        />
      </div>
    </div>
  );
}

export function RecipeDetailModalContent({ recipe }: RecipeDetailContentProps) {
  const { copied, handleShare } = useShareAction(recipe);
  const hasSourceUrl = recipe.sourceUrl.trim().length > 0;

  return (
    <div className="flex min-h-0 min-w-0 flex-col gap-5 sm:gap-6">
      <RecipeHeroImage recipe={recipe} className="h-[240px] sm:h-[280px]" />

      <div className="border-b border-[var(--line)] pb-5">
        <h1 className="text-strong m-0 pr-12 text-[1.7rem] font-semibold leading-[1.12] tracking-[-0.04em] sm:text-[2rem]">
          {recipe.name}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <p className="text-base">
            조리 시간 <span className="text-strong ml-1 font-semibold">{recipe.cookTime}</span>
          </p>
          <span className="h-1 w-1 rounded-full bg-[var(--line-strong)]" aria-hidden="true" />
          <p className="text-base">
            재료 <span className="text-strong ml-1 font-semibold">{recipe.ingredients.length}개</span>
          </p>
        </div>

        {recipe.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {recipe.tags.map((tag, index) => (
              <span
                key={`${recipe.id}-modal-tag-${tag}-${index}`}
                className="ingredient-chip rounded-full px-3 py-1.5 text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <DetailActions
          copied={copied}
          hasSourceUrl={hasSourceUrl}
          sourceUrl={recipe.sourceUrl}
          onShare={handleShare}
        />
      </div>

      <div className="lg:min-h-0 lg:overflow-y-auto lg:pr-1">
        <IngredientsChipList recipe={recipe} />
        <MethodSection
          title="만드는 방법"
          className="py-5"
          recipeText={recipe.recipeText}
        />
      </div>
    </div>
  );
}
