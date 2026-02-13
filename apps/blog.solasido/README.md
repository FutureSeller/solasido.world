# Blog.Solasido

Next.js 블로그 프로젝트 with Markdown/MDX

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Linter/Formatter**: Biome
- **Content**: Markdown/MDX
- **Package Manager**: pnpm

## 시작하기

### 블로그 포스트 작성

`content/posts/` 디렉토리에 `.md` 또는 `.mdx` 파일을 생성하세요.

#### 파일 형식

```markdown
---
title: "포스트 제목"
description: "포스트 설명"
date: 2024-02-13
tags: ["tag1", "tag2"]
---

# 내용 시작

여기에 마크다운 내용을 작성하세요.
```

### 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start
```

### Cloudflare 배포 (OpenNext)

```bash
# Worker 산출물 빌드
pnpm build:worker

# 로컬 Worker 프리뷰
pnpm preview

# Cloudflare 배포
pnpm deploy
```

> 참고
>
> - `@cloudflare/next-on-pages`는 deprecated 상태이며, 이 프로젝트는 `@opennextjs/cloudflare`를 사용합니다.
> - `open-next.config.ts`가 없으면 `pnpm build:worker`가 중단됩니다.
> - OpenNext 산출물 경로:
>   - Worker: `.open-next/worker.js`
>   - Assets: `.open-next/assets`

### Notion 이미지 만료 대응 (R2)

Notion 파일 URL(S3 presigned)은 만료되므로, 동기화 시 이미지를 Cloudflare R2로 업로드해 영구 URL로 치환합니다.

`.env.local`에 아래 값을 설정하세요.

```bash
R2_BUCKET_NAME=solasido-static-assets
R2_PUBLIC_BASE_URL=https://static-images.solasido.world
```

실행:

```bash
pnpm db:sync-notion
```

동작:
- 본문 이미지/커버 이미지를 다운로드 후 R2 업로드
- 키 규칙: `blog/<sha256-prefix>/<sha256>.<ext>` (콘텐츠 해시 기반, 중복/충돌 방지)
- SQL 생성 시 URL을 R2 공개 URL로 치환

### 로컬 DB 재적재 절차

Notion 이미지 만료 URL을 R2 URL로 반영하려면, 로컬 D1 데이터를 다시 적재하세요.

```bash
# 1) Notion -> SQL 생성 (이미지/커버 URL을 R2로 치환)
pnpm db:sync-notion

# 2) 로컬 DB 스키마 적용
pnpm wrangler d1 execute blog-db --local --file=schema.sql

# 3) SQL 배치 파일 생성
pnpm tsx scripts/split-sql.ts

# 4) 로컬 DB에 배치 import
bash scripts/import-batches.sh
```

### Linting & Formatting

```bash
# 린트 검사
pnpm lint

# 린트 자동 수정
pnpm lint:fix

# 코드 포맷팅
pnpm format
```

## 프로젝트 구조

```
blog.solasido/
├── app/
│   ├── posts/[slug]/    # 동적 포스트 페이지
│   ├── layout.tsx       # 루트 레이아웃
│   ├── page.tsx         # 홈 페이지 (포스트 목록)
│   └── globals.css      # 전역 스타일
├── content/
│   └── posts/           # 마크다운 포스트 파일
├── lib/
│   └── mdx.ts           # MDX 유틸리티
├── mdx-components.tsx   # MDX 컴포넌트 커스터마이징
├── biome.json           # Biome 설정
├── next.config.ts       # Next.js 설정
├── postcss.config.mjs   # PostCSS 설정
└── tsconfig.json        # TypeScript 설정
```

## MDX 기능

- GitHub Flavored Markdown 지원 (테이블, 체크리스트 등)
- 자동 헤딩 앵커 링크
- 코드 하이라이팅
- 커스텀 컴포넌트 사용 가능
