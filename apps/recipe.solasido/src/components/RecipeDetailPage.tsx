import { useNavigate } from 'react-router-dom';
import type { Recipe } from '../types/recipe';
import { RecipeDetailContent } from './RecipeDetailContent';

interface RecipeDetailPageProps {
  recipe: Recipe;
}

export function RecipeDetailPage({ recipe }: RecipeDetailPageProps) {
  const navigate = useNavigate();

  return (
    <div className="page-shell min-h-screen pb-14 pt-5 sm:pt-7">
      <div className="mb-5">
        <button
          onClick={() => navigate('/')}
          className="surface-card rounded-full px-4 py-2 text-sm font-medium text-[var(--text-base)] transition-all duration-200 hover:-translate-y-px hover:text-[var(--text-strong)]"
        >
          목록으로
        </button>
      </div>

      <div className="surface-card-strong rounded-[30px] p-4 sm:p-6 lg:p-7">
        <RecipeDetailContent
          recipe={recipe}
          imageClassName="h-[280px] sm:h-[380px] lg:h-full"
          contentClassName="flex min-h-0 min-w-0 flex-col"
        />
      </div>
    </div>
  );
}
