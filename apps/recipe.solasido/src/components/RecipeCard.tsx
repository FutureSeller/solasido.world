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
      className={`surface-card group relative overflow-hidden rounded-[28px] border-none text-left transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:shadow-[0_28px_56px_rgba(56,32,16,0.12)] ${
        isList ? 'flex items-stretch gap-0' : 'flex flex-col hover:-translate-y-1'
      }`}
      onClick={() => onOpen(recipe)}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(201,111,59,0),rgba(201,111,59,0.75),rgba(120,146,94,0.45),rgba(201,111,59,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div
        className={`relative overflow-hidden bg-[#e9dfd2] ${
          isList ? 'h-auto w-[120px] shrink-0 self-stretch sm:w-[180px]' : 'h-60 w-full'
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

      <div className={`flex flex-1 flex-col ${isList ? 'p-4 sm:p-5' : 'p-5'}`}>
        <div className={`flex items-start justify-between gap-4 ${isList ? 'mb-3' : 'mb-4'}`}>
          <div>
            <h2
              className={`text-strong break-keep m-0 font-semibold tracking-[-0.03em] ${
                isList ? 'text-[1.08rem] leading-[1.38] sm:text-[1.2rem]' : 'text-[1.3rem] leading-[1.32]'
              }`}
            >
              {recipe.name}
            </h2>
          </div>
          <div
            className={`accent-wash shrink-0 text-right ${isList ? 'rounded-[16px] px-2.5 py-1.5' : 'rounded-[18px] px-3 py-2'}`}
          >
            <p className="text-accent text-sm font-semibold">{recipe.cookTime}</p>
          </div>
        </div>

        <p
          className={`text-base break-keep text-sm ${
            isList ? 'mb-3 line-clamp-2 leading-[1.45] sm:leading-6' : 'mb-4 leading-6'
          }`}
        >
          {previewIngredients.length > 0
            ? `${previewIngredients.join(' · ')}${recipe.ingredients.length > 3 ? ' 외 재료' : ''}`
            : '재료 정보는 상세 화면에서 확인할 수 있습니다.'}
        </p>

        {previewTags.length > 0 && (
          <div className={`flex flex-wrap gap-2 ${isList ? 'mt-auto' : 'mb-4'}`}>
            {previewTags.map((tag, index) => (
              <span
                key={`${recipe.id}-${tag}-${index}`}
                className={`ingredient-chip rounded-full text-xs ${isList ? 'px-2.5 py-1' : 'px-3 py-1.5'}`}
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
