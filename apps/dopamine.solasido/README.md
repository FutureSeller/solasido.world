# dopamine.solasido

Astro + Tailwind 기반의 정적 블로그 앱입니다.  
기본 배포 모드는 빌드 시점에 D1에서 데이터를 읽어 정적 생성(SSG)합니다.

## 개발 명령어

- `pnpm install`: 의존성 설치
- `pnpm dev`: 로컬 개발 서버 실행 (`http://localhost:4321`)
- `pnpm build`: 프로덕션 빌드 (`dist/`)
- `pnpm run deploy`: 빌드 + Cloudflare 배포
- `pnpm preview`: 빌드 결과 로컬 확인

## 환경 변수

- Cloudflare D1 바인딩
  - 빌드 단계에서 `wrangler d1 execute`를 사용합니다.
  - 기본 DB 이름은 `dopamine_db`이며 `D1_DATABASE_NAME` 환경변수로 변경할 수 있습니다.
  - 기본 모드는 원격 조회이며 `D1_REMOTE=false`로 로컬 조회로 전환할 수 있습니다.

## 주요 디렉토리

- `src/pages`: 라우트 페이지 (`/`, `/page/[page]`, `/posts/[slug]`)
- `src/components`: UI 컴포넌트 (`PostList`, `ThemeToggle`)
- `src/lib`: 데이터/DB/유틸/pagination 로직

## 배포

Cloudflare adapter(`@astrojs/cloudflare`)를 사용합니다.  
배포 설정은 `wrangler.jsonc`를 참고하세요.

Cloudflare Pages의 Git 연동 빌드를 사용할 경우, Pages 프로젝트 환경 변수(Production/Preview)에 아래 값을 설정해야 빌드 시 D1 조회가 가능합니다.

- `CLOUDFLARE_API_TOKEN` (D1 read 권한 포함)
- `CLOUDFLARE_ACCOUNT_ID`
- `D1_DATABASE_NAME` (기본값 `dopamine_db`, 필요 시만 설정)
