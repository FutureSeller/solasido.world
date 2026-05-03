# Recipe Feed - Cloudflare Edition

공개 레시피 탐색 앱입니다. `apps/recipe.solasido`는 자체 D1 스키마를 갖지 않고, `studio.solasido.world`가 관리하는 shared D1 `dopamine_db`를 읽습니다.

## Tech Stack

- **Frontend**: Vite 6 + React 18 + TypeScript + Tailwind CSS 4
- **Backend**: Cloudflare Pages Functions
- **Database**: Cloudflare D1 (`dopamine_db`, managed by `studio.solasido.world`)

## Development

### Prerequisites

- Node.js 20+
- pnpm 9+
- Cloudflare account with Wrangler CLI

### Setup

1. Install dependencies:

```bash
pnpm install
```

2. Confirm the D1 binding in [wrangler.toml](./wrangler.toml):

```toml
[[d1_databases]]
binding = "DB"
database_name = "dopamine_db"
database_id = "5769fa3c-4809-423b-ade5-0a5607ad0b0f"
```

3. If the shared recipe schema changes, manage that from:

- `/Users/junekim/Workspace/studio.solasido.world/src/shared/db/schema.ts`
- `/Users/junekim/Workspace/studio.solasido.world/functions/api/_lib/recipes.ts`

`apps/recipe.solasido` 안에서는 migration을 만들거나 적용하지 않습니다.

### Local Development

```bash
pnpm dev
pnpm build
pnpm preview
```

## Project Structure

```txt
recipe.solasido/
├── functions/               # Cloudflare Pages Functions (public recipe API)
│   └── api/
│       └── recipes/
├── public/                  # Static assets
├── scripts/                 # Optional sync / upload helpers
├── src/                     # React frontend
├── index.html
├── package.json
├── vite.config.ts
└── wrangler.toml
```

## API Endpoints

### `GET /api/recipes`

List recipes with optional search and pagination.

Search is currently resolved against shared `dopamine_db` recipe tables:

- `recipes`
- `recipe_tags`
- `recipe_ingredients`

### `GET /api/recipes/:id`

Get a single recipe by ID.

## DB Notes

- This app reads `context.env.DB`.
- The actual recipe schema source of truth lives in `studio.solasido.world`.
- Do not add local migrations in this app.

Detailed notes: [DB_PATH_AND_SCHEMA.md](./DB_PATH_AND_SCHEMA.md)

## Deployment

```bash
pnpm build
wrangler pages deploy dist --project-name=recipe-solasido
```
