import type { Recipe } from '../types/recipe';
import { resolveImage } from '../lib/imageUtils';
import { PLACEHOLDER } from '../lib/constants';

interface DetailModalProps {
  recipe: Recipe | null;
  onClose: () => void;
}

export function DetailModal({ recipe, onClose }: DetailModalProps) {
  if (!recipe) return null;

  return (
    <div
      className="fixed inset-0 bg-black/45 flex justify-center items-center z-[9999] p-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[760px] max-h-[86vh] overflow-auto bg-white rounded-2xl p-4 px-6 pb-[22px] relative shadow-[0_20px_50px_rgba(0,0,0,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 w-9 h-9 border border-black/8 rounded-[18px] bg-white/92 backdrop-blur-[6px] text-[#4b5563] text-lg font-medium cursor-pointer flex items-center justify-center z-[3] shadow-[0_6px_18px_rgba(0,0,0,0.12)] transition-all duration-[180ms] hover:bg-white hover:text-[#111827] hover:-translate-y-[1px] hover:shadow-[0_10px_22px_rgba(0,0,0,0.16)]"
          onClick={onClose}
          aria-label="닫기"
        >
          ✕
        </button>

        <img
          className="w-full max-h-80 object-cover rounded-xl mb-[18px]"
          src={resolveImage(recipe)}
          alt={recipe.name}
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER;
          }}
        />

        <h2 className="m-0 mb-3.5 text-2xl font-bold text-[#2c3e50]">{recipe.name}</h2>

        <p className="m-0 mb-3">
          <strong className="text-orange-main font-semibold">⏱️ 조리 시간:</strong> {recipe.cookTime}
        </p>

        <p className="mt-1 mb-3">
          <strong className="text-orange-main font-semibold">🥘 재료:</strong>
        </p>
        <ul className="list-none p-0 my-2.5 mb-[18px] flex flex-wrap gap-2">
          {(recipe.ingredients || []).map((ing, i) => (
            <li
              key={`${recipe.id}-${i}`}
              className="text-orange-main px-3.5 py-1.5 rounded-[20px] text-[0.85em] font-medium border transition-all duration-200 hover:text-white hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #ff994415 0%, #ff552215 100%)',
                borderColor: '#ff994430'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #ff9944 0%, #ff5522 100%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #ff994415 0%, #ff552215 100%)';
              }}
            >
              {ing}
            </li>
          ))}
        </ul>

        <p className="mt-1 mb-3">
          <strong className="text-orange-main font-semibold">📝 레시피:</strong>
        </p>
        <pre className="bg-[#f8f9fa] border border-[#e9ecef] p-4 rounded-xl whitespace-pre-wrap leading-[1.75] mt-2.5 font-sans text-[#495057]">
          {recipe.recipeText || '상세 내용은 배포 데이터 동기화 후 표시됩니다.'}
        </pre>
      </div>
    </div>
  );
}
