export function LoadingState() {
  return (
    <div className="surface-card rounded-[28px] px-5 py-12 text-center">
      <p className="section-label mb-3">Loading</p>
      <span className="text-base inline-block animate-[dots_1.5s_steps(3,end)_infinite] text-base font-medium">
        레시피를 불러오는 중입니다
      </span>
    </div>
  );
}
