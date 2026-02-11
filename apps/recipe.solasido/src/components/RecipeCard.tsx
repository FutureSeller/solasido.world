import type { Recipe } from '../types/recipe';
import { resolveImage } from '../lib/imageUtils';
import { PLACEHOLDER } from '../lib/constants';

interface RecipeCardProps {
  recipe: Recipe;
  onOpen: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, onOpen }: RecipeCardProps) {
  return (
    <button
      className="group bg-white rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer relative flex flex-col border-none text-left hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] hover:-translate-y-2"
      onClick={() => onOpen(recipe)}
    >
      {/* Orange gradient top border on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 orange-gradient scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

      <div className="w-full h-60 overflow-hidden bg-gray-100">
        <img
          src={resolveImage(recipe)}
          alt={`${recipe.name} 썸네일`}
          className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER;
          }}
        />
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h2 className="text-[1.22em] m-0 mb-2 text-[#2c3e50] font-bold leading-[1.35]">
          {recipe.name}
        </h2>
        <p className="m-0 text-[0.92em] text-[#5a6c7d]">
          <strong className="text-orange-main font-semibold">⏱️ 조리 시간</strong> {recipe.cookTime}
        </p>
      </div>
    </button>
  );
}
