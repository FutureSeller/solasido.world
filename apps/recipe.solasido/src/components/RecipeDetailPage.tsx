import { useNavigate } from 'react-router-dom';
import type { Recipe } from '../types/recipe';
import { RecipeDetailPageContent } from './RecipeDetailContent';

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
          className="rounded-full border border-[var(--line)] bg-white/76 px-4 py-2 text-sm font-medium text-[var(--text-base)] transition-all duration-200 hover:-translate-y-px hover:text-[var(--text-strong)]"
        >
          목록으로
        </button>
      </div>

      <div className="surface-card-strong rounded-[30px] p-4 sm:p-6 lg:p-7">
        <RecipeDetailPageContent recipe={recipe} />
      </div>
    </div>
  );
}
