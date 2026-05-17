import type { Recipe } from '../types/recipe';
import { resolveImage } from '../lib/imageUtils';
import { PLACEHOLDER } from '../lib/constants';

interface RecipeCardProps {
  recipe: Recipe;
  view: 'grid' | 'list';
  onOpen: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, view, onOpen }: RecipeCardProps) {
  const previewIngredients = recipe.ingredients.slice(0, 3);
  const previewTags = recipe.tags.slice(0, 4);
  const isList = view === 'list';

  return (
    <button
      className={`surface-card group relative overflow-hidden rounded-[24px] border-none text-left transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:shadow-[0_22px_42px_rgba(56,32,16,0.09)] ${
        isList ? 'flex h-[128px] items-stretch gap-0 sm:h-[144px]' : 'flex flex-col hover:-translate-y-0.5'
      }`}
      onClick={() => onOpen(recipe)}
    >
      <div
        className={`relative overflow-hidden bg-[#e9dfd2] ${
          isList ? 'h-full w-[96px] shrink-0 sm:w-[128px]' : 'h-56 w-full'
        }`}
      >
        <img
          src={resolveImage(recipe)}
          alt={`${recipe.name} 썸네일`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER;
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#24170d]/55 to-transparent" />
      </div>

      <div className={`flex flex-1 flex-col ${isList ? 'p-3.5 sm:p-4' : 'p-5'}`}>
        <div className={`flex items-start justify-between gap-4 ${isList ? 'mb-2.5' : 'mb-3.5'}`}>
          <div className="min-w-0">
            <h2
              className={`text-strong break-keep m-0 font-semibold tracking-[-0.03em] ${
                isList ? 'text-[1.02rem] leading-[1.35] sm:text-[1.14rem]' : 'text-[1.22rem] leading-[1.3]'
              }`}
            >
              {recipe.name}
            </h2>
          </div>
          <div
            className={`shrink-0 border border-[var(--line)] bg-white/72 text-right ${isList ? 'rounded-[14px] px-2.5 py-1.5' : 'rounded-[16px] px-3 py-1.5'}`}
          >
            <p className="text-accent text-[13px] font-semibold">{recipe.cookTime}</p>
          </div>
        </div>

        <p
          className={`text-base break-keep text-sm ${
            isList ? 'mb-3 line-clamp-2 leading-[1.45] sm:leading-6' : 'mb-3.5 leading-6'
          }`}
        >
          {previewIngredients.length > 0
            ? `${previewIngredients.join(' · ')}${recipe.ingredients.length > 3 ? ' 외 재료' : ''}`
            : '재료 정보는 상세 화면에서 확인할 수 있습니다.'}
        </p>

        {previewTags.length > 0 && (
          <div className={`flex flex-wrap gap-1.5 ${isList ? 'mt-auto' : 'mb-1'}`}>
            {previewTags.map((tag, index) => (
              <span
                key={`${recipe.id}-${tag}-${index}`}
                className={`ingredient-chip rounded-full text-[11px] ${isList ? 'px-2.5 py-1' : 'px-2.5 py-1'}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}
