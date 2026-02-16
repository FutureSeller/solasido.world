# dopamine.solasido

Astro + Tailwind 기반의 정적 블로그 앱입니다.  
현재는 목데이터(`src/data/mock-posts.ts`)를 기본 사용하고, 이후 D1 연동을 전제로 데이터 레이어가 분리되어 있습니다.

## 개발 명령어

- `pnpm install`: 의존성 설치
- `pnpm dev`: 로컬 개발 서버 실행 (`http://localhost:4321`)
- `pnpm build`: 프로덕션 빌드 (`dist/`)
- `pnpm preview`: 빌드 결과 로컬 확인

## 환경 변수

- `PUBLIC_USE_MOCK_DATA`
  - 기본값: `true` (미설정 시 목데이터 사용)
  - `false`로 설정하면 D1 경로를 사용하도록 전환됩니다.  
    현재 D1 조회 구현은 TODO 상태입니다.

## 주요 디렉토리

- `src/pages`: 라우트 페이지 (`/`, `/page/[page]`, `/posts/[slug]`)
- `src/components`: UI 컴포넌트 (`PostList`, `ThemeToggle`)
- `src/lib`: 데이터/DB/유틸/pagination 로직
- `src/data`: 개발용 목데이터

## 배포

Cloudflare adapter(`@astrojs/cloudflare`)를 사용합니다.  
배포 설정은 `wrangler.jsonc`를 참고하세요.
