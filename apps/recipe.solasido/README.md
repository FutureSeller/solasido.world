# Recipe Feed - Cloudflare Edition

레시피 피드 앱을 Cloudflare Pages + D1 + Functions로 마이그레이션한 버전입니다.

## Tech Stack

- **Frontend**: Vite 6 + React 18 + TypeScript + Tailwind CSS 4
- **Backend**: Cloudflare Pages Functions
- **Database**: Cloudflare D1 (SQLite)
- **Search**: FTS5 full-text search (Korean text support)

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

2. Create D1 database:

```bash
cd apps/recipe.solasido
pnpm db:create
```

This will output a database ID. Update `wrangler.toml` with the database ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "recipe_db"
database_id = "YOUR_DATABASE_ID_HERE"
```

3. Run migrations locally:

```bash
pnpm db:migrate:local
```

4. Run migrations in production:

```bash
pnpm db:migrate
```

### Local Development

```bash
# Start Vite dev server
pnpm dev

# Or preview with Cloudflare Pages (recommended for testing API)
pnpm build
pnpm preview
```

The preview command runs Wrangler Pages with local D1 binding, allowing you to test the full stack locally.

## Project Structure

```
recipe.solasido/
├── functions/               # Cloudflare Pages Functions (API endpoints)
│   └── api/
│       └── recipes/
│           ├── index.ts     # GET /api/recipes (list with search & pagination)
│           └── [id].ts      # GET /api/recipes/:id (detail)
├── migrations/              # D1 database migrations
│   ├── 0001_initial_schema.sql
│   └── 0002_seed_data.sql
├── public/                  # Static assets
│   └── images/              # Recipe images
├── src/                     # React frontend
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── vite.config.ts
├── wrangler.toml           # Cloudflare configuration
└── tailwind.config.js
```

## API Endpoints

### `GET /api/recipes`

List recipes with optional search and pagination.

**Query Parameters:**

- `q` (optional): Search query (searches name and ingredients)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12)

**Response:**

```json
{
  "recipes": [
    {
      "id": "...",
      "name": "소고기 마늘쫑 볶음",
      "ingredients": ["마늘쫑", "다진 소고기", ...],
      "cookTime": "약 15분",
      "recipeText": "...",
      "localThumb": "/images/...",
      "thumb": "https://..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "totalPages": 1,
    "totalCount": 1
  }
}
```

### `GET /api/recipes/:id`

Get a single recipe by ID.

**Response:**

```json
{
  "id": "...",
  "name": "소고기 마늘쫑 볶음",
  "ingredients": ["마늘쫑", "다진 소고기", ...],
  "cookTime": "약 15분",
  "recipeText": "...",
  "localThumb": "/images/...",
  "thumb": "https://..."
}
```

## Database Schema

### `recipes` Table

| Column            | Type    | Description                   |
| ----------------- | ------- | ----------------------------- |
| id                | TEXT    | Primary key                   |
| notion_page_id    | TEXT    | Notion page ID (optional)     |
| name              | TEXT    | Recipe name                   |
| ingredients       | TEXT    | JSON array of ingredients     |
| cook_time         | TEXT    | Cooking time                  |
| recipe_text       | TEXT    | Recipe instructions           |
| thumbnail_url     | TEXT    | External thumbnail URL        |
| thumbnail_local   | TEXT    | Local thumbnail path          |
| created_at        | INTEGER | Unix timestamp                |
| updated_at        | INTEGER | Unix timestamp                |

### `recipes_fts` Virtual Table

FTS5 full-text search index on `name` and `ingredients` columns. Supports Korean text search.

## Deployment

### GitHub Actions (Automatic)

Push to `main` branch with changes in `apps/recipe.solasido/**` to trigger automatic deployment.

Required secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

### Manual Deployment

```bash
pnpm build
wrangler pages deploy dist --project-name=recipe-solasido
```

## Environment Variables

No environment variables needed for the app itself. D1 database binding is configured in `wrangler.toml`.

## Performance

- **API Response Time**: < 200ms (cached), < 500ms (D1 query)
- **Cache Strategy**:
  - Recipe list: 5 minutes
  - Recipe detail: 1 hour
- **Target Lighthouse Score**: > 90

## Next Steps

1. ✅ Project initialization and configuration
2. ✅ Database schema and migrations
3. ✅ Data migration from source app
4. ✅ Cloudflare Functions API endpoints
5. ✅ Frontend components with Tailwind CSS
6. ✅ GitHub Actions deployment workflow
7. 🔄 Create D1 database and run migrations
8. 🔄 Deploy to Cloudflare Pages
9. 🔄 Configure custom domain (recipe.solasido.world)
10. 🔄 Test production deployment

## Future Enhancements

- Admin panel for adding recipes (Cloudflare Access protected)
- Cloudflare R2 for image storage
- Recipe tags/categories
- User favorites (localStorage)
- Print-optimized stylesheet
