# Recipe Solasido DB 경로 및 스키마

`apps/recipe.solasido`는 자체 D1 스키마를 관리하지 않습니다. 이 앱은 `studio.solasido.world`가 관리하는 shared D1인 `dopamine_db`를 `DB` 바인딩으로 읽습니다.

## 1. DB 식별 정보

기준 파일: [wrangler.toml](./wrangler.toml)

```toml
[[d1_databases]]
binding = "DB"
database_name = "dopamine_db"
database_id = "5769fa3c-4809-423b-ade5-0a5607ad0b0f"
```

- 런타임 바인딩 이름: `DB`
- D1 데이터베이스 이름: `dopamine_db`
- D1 데이터베이스 ID: `5769fa3c-4809-423b-ade5-0a5607ad0b0f`

애플리케이션 코드는 Cloudflare Pages Functions에서 `context.env.DB`로 접근합니다.

참조 파일:
- [functions/api/recipes/types.ts](./functions/api/recipes/types.ts)
- [functions/api/recipes/index.ts](./functions/api/recipes/index.ts)
- [functions/api/recipes/[id].ts](./functions/api/recipes/[id].ts)

## 2. 스키마 source of truth

`recipe.solasido` 안에는 migration을 두지 않습니다. 실제 recipe 스키마 기준은 `studio.solasido.world` 쪽 정의입니다.

참조 경로:
- `/Users/junekim/Workspace/studio.solasido.world/src/shared/db/schema.ts`
- `/Users/junekim/Workspace/studio.solasido.world/src/entities/recipe/model/types.ts`
- `/Users/junekim/Workspace/studio.solasido.world/functions/api/_lib/recipes.ts`

현재 이 앱이 기대하는 recipe 관련 테이블은 아래 세 개입니다.

- `recipes`
- `recipe_tags`
- `recipe_ingredients`

## 3. 로컬 상태

로컬 개발 시 Wrangler 상태 파일은 여전히 아래 경로에 생성될 수 있습니다.

```txt
apps/recipe.solasido/.wrangler/state
```

관련 스크립트:

```json
{
  "db:delete:local": "rm -rf .wrangler/state"
}
```

## 4. 주의사항

- `recipe.solasido`에서 DB migration을 만들거나 적용하지 않습니다.
- shared recipe 스키마 변경은 `studio.solasido.world` 쪽 경로에서 관리해야 합니다.
- 이 앱의 `db:sync-notion` 스크립트도 shared `dopamine_db`를 대상으로 동작합니다.
