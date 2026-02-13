# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router code, including UI pages (`app/page.tsx`), dynamic post routes (`app/posts/[slug]/page.tsx`), and API routes (`app/api/posts/...`).
- `app/components/`: Reusable UI components such as `PostsGrid.tsx`.
- `lib/`: Shared runtime utilities (for example D1 access in `lib/db.ts` and `lib/d1-client.ts`).
- `scripts/`: One-off operational scripts for Notion export and D1 sync (`sync-to-d1-safe.ts`, `split-sql.ts`, `import-batches.sh`, `test-d1-read.ts`).
- `schema.sql`: SQLite/D1 schema source of truth.
- Config roots: `next.config.ts`, `wrangler.toml`, `biome.json`, `tsconfig.json`.

## Build, Test, and Development Commands
- `pnpm dev`: Start local Next.js dev server.
- `pnpm build`: Build production assets.
- `pnpm start`: Serve the built static output (`out/`).
- `pnpm lint`: Run Biome checks across the repo.
- `pnpm lint:fix`: Apply safe lint fixes.
- `pnpm format`: Format code with Biome.
- `pnpm tsx scripts/test-d1-read.ts`: Validate local D1 read + gzip decode path.
- `pnpm wrangler d1 execute blog-db --local --file=schema.sql`: Apply DB schema locally.

## Coding Style & Naming Conventions
- Language: TypeScript (React 19 + Next 16).
- Formatting: 2-space indentation, double quotes, and import organization enforced by Biome.
- File naming: React components in `PascalCase.tsx`; utility and script files in `kebab-case.ts`.
- Keep route files in Next.js conventions: `page.tsx`, `layout.tsx`, `route.ts`.

## Testing Guidelines
- There is no formal unit test suite yet; rely on lint + targeted script checks.
- Before opening a PR, run `pnpm lint` and smoke-test key routes in `pnpm dev`.
- For data pipeline changes, run relevant scripts from `scripts/` and verify outputs (for example generated SQL batches).

## Commit & Pull Request Guidelines
- Match existing commit style: bracketed scope prefix + imperative summary, e.g. `[blog] add notion sync and basic pages` or `chore: remove workflows`.
- Keep commits focused and logically grouped.
- PRs should include:
  - What changed and why.
  - Any schema/env/config updates (`schema.sql`, `.env.local`, `wrangler.toml`).
  - Screenshots for UI changes and reproduction steps for bug fixes.
