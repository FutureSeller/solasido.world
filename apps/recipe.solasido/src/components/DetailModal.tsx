import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';
import type { Recipe } from '../types/recipe';
import { RecipeDetailContent } from './RecipeDetailContent';

interface DetailModalProps {
  recipe: Recipe | null;
  onClose: () => void;
}

export function DetailModal({ recipe, onClose }: DetailModalProps) {
  useBodyScrollLock(!!recipe);
  useKeyboardShortcut('Escape', () => {
    if (recipe) {
      onClose();
    }
  });

  if (!recipe) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-[rgba(31,20,11,0.42)] p-0 sm:items-center sm:p-5"
      onClick={onClose}
    >
      <div
        className="surface-card-strong relative flex h-[92vh] w-full overflow-y-auto rounded-t-[28px] px-4 pb-4 pt-4 animate-[panelIn_0.28s_ease-out] sm:max-w-[980px] sm:rounded-[30px] sm:px-6 sm:pb-6 sm:pt-5 lg:h-[780px] lg:overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute right-4 top-4 z-[3] flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-white/90 text-lg font-medium text-[var(--text-base)] shadow-[0_10px_24px_rgba(56,32,16,0.12)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-white hover:text-[var(--text-strong)]"
          onClick={onClose}
          aria-label="닫기"
        >
          ✕
        </button>

        <RecipeDetailContent recipe={recipe} />
      </div>
    </div>
  );
}
