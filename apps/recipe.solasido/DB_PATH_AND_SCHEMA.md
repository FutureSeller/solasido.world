# Recipe Solasido DB 경로 및 스키마

`apps/recipe.solasido`는 Cloudflare D1을 `DB` 바인딩으로 사용합니다.

## 1. DB 식별 정보

기준 파일: [wrangler.toml](./wrangler.toml)

```toml
[[d1_databases]]
binding = "DB"
database_name = "recipe_db"
database_id = "9fcfed36-33af-46f8-899f-d0277441acc0"
```

- 런타임 바인딩 이름: `DB`
- D1 데이터베이스 이름: `recipe_db`
- D1 데이터베이스 ID: `9fcfed36-33af-46f8-899f-d0277441acc0`

애플리케이션 코드는 Cloudflare Pages Functions에서 `context.env.DB`로 접근합니다.

참조 파일:
- [functions/api/recipes/types.ts](./functions/api/recipes/types.ts)
- [functions/api/recipes/index.ts](./functions/api/recipes/index.ts)
- [functions/api/recipes/[id].ts](./functions/api/recipes/[id].ts)

## 2. 로컬 DB 경로

로컬 개발 시 Wrangler가 D1 상태 파일을 아래 경로에 생성합니다.

```txt
apps/recipe.solasido/.wrangler/state
```

참조 파일:
- [.gitignore](./.gitignore)
- [package.json](./package.json)

관련 스크립트:

```json
{
  "db:delete:local": "rm -rf .wrangler/state",
  "db:migrate:local": "wrangler d1 migrations apply recipe_db --local",
  "db:migrate": "wrangler d1 migrations apply recipe_db --remote"
}
```

## 3. 실제 스키마 정의 위치

실제 스키마의 기준은 README가 아니라 migration SQL 파일입니다.

기준 파일:
- [migrations/0001_initial_schema.sql](./migrations/0001_initial_schema.sql)
- [migrations/0002_seed_data.sql](./migrations/0002_seed_data.sql)

## 4. 테이블 구조

### `recipes`

```sql
CREATE TABLE recipes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  ingredients TEXT NOT NULL,
  cook_time TEXT,
  recipe_text TEXT,
  thumbnail_url TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);
```

컬럼 설명:

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `TEXT` | Primary key |
| `name` | `TEXT` | 필수 |
| `ingredients` | `TEXT` | JSON 배열을 문자열로 저장 |
| `cook_time` | `TEXT` | nullable |
| `recipe_text` | `TEXT` | nullable |
| `thumbnail_url` | `TEXT` | nullable |
| `created_at` | `INTEGER` | Unix epoch 기본값 |
| `updated_at` | `INTEGER` | Unix epoch 기본값 |

TypeScript에서 기대하는 row 타입도 동일합니다.

참조 파일: [functions/api/recipes/types.ts](./functions/api/recipes/types.ts)

### `recipes_fts`

검색용 FTS5 가상 테이블입니다.

```sql
CREATE VIRTUAL TABLE recipes_fts USING fts5(
  id UNINDEXED,
  name,
  ingredients,
  content=recipes,
  content_rowid=rowid
);
```

- 전체 텍스트 검색 대상: `name`, `ingredients`
- `id`는 `UNINDEXED`
- `recipes` 테이블과 `rowid` 기준으로 연결

## 5. 트리거 및 인덱스

`recipes_fts` 동기화를 위해 아래 트리거가 있습니다.

- `recipes_ai`: `INSERT` 후 FTS row 추가
- `recipes_au`: `UPDATE` 후 FTS row 갱신
- `recipes_ad`: `DELETE` 후 FTS row 삭제

정렬 최적화를 위한 인덱스:

```sql
CREATE INDEX idx_recipes_created_at ON recipes(created_at DESC);
```

## 6. 실제 조회 쿼리에서 사용하는 테이블

목록 조회: [functions/api/recipes/index.ts](./functions/api/recipes/index.ts)

- 검색어가 없으면 `recipes`만 조회
- 검색어가 있으면 `recipes`와 `recipes_fts`를 조인

단건 조회: [functions/api/recipes/[id].ts](./functions/api/recipes/[id].ts)

- `recipes` 테이블에서 `id` 기준 조회

## 7. 주의사항

[README.md](./README.md)에는 `notion_page_id`, `thumbnail_local` 같은 컬럼 설명이 남아 있지만, 현재 실제 migration 스키마에는 존재하지 않습니다.

현재 코드와 DB의 실제 기준은 아래 두 파일입니다.

- [migrations/0001_initial_schema.sql](./migrations/0001_initial_schema.sql)
- [functions/api/recipes/types.ts](./functions/api/recipes/types.ts)
