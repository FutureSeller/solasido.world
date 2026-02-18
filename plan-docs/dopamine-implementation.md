# Instagram to SEO Blog Pipeline - Implementation Plan

## Status Update (2026-02-19)

This plan was drafted for a Next.js + OpenNext implementation. The active public app has been implemented as Astro SSG in `apps/dopamine.solasido`.

Implemented baseline in current app:
- Build-time D1 fetch pipeline for published posts
- Static routes: `/`, `/page/[page]`, `/posts/[slug]`
- SEO metadata + structured data
- `sitemap-index.xml` generation and `robots.txt` exposure
- GA4 + Search Console env-driven integration
- Detail-page image carousel controls and Instagram source linking
- Home/list grid/list toggle with persisted preference

If continuing this document, treat all Next.js/OpenNext-specific steps as optional alternatives and align new tasks to Astro + Cloudflare Pages first.

## Context

This project automates the conversion of Instagram carousel posts into SEO-optimized blog content for solasido.world. Currently, Instagram content has limited Google indexing and unstable image URLs that expire. The goal is to create a **standalone pipeline** that:

1. **Collects** Instagram posts via Graph API
2. **Mirrors** carousel images to R2 storage (avoiding URL expiration)
3. **Generates** SEO-friendly blog drafts using Claude API
4. **Enables** human review (80% automation + 20% manual refinement)
5. **Publishes** approved content with proper SEO metadata

**Success Criteria:**
- 95% draft generation success rate
- ≤3 minutes per post processing time
- ≤5 minutes review-to-publish time
- Stable image hosting via R2

## Architecture Overview

**Tech Stack:**
- **Runtime**: Cloudflare Workers (via OpenNext adapter)
- **Frontend**: Next.js 16 with App Router (RSC support)
- **Deployment**: `@opennextjs/cloudflare` adapter
- **Package Manager**: pnpm
- **Styling**: Tailwind CSS
- **Linting**: Biome (replaces ESLint)
- **Database**: D1 (SQLite, serverless)
- **Storage**: R2 for images + incremental cache
- **AI**: Claude Desktop/Code (local) for content generation
- **Source**: Instagram Graph API
- **Publishing**: Local scripts → D1 database → Git commits

**Data Flow:**
```
[Automated - Cloudflare Workers Cron]
Instagram Graph API → Store Metadata (D1) → Download Images → R2 Upload (WebP)

[Local - CLI/Scripts]
Fetch Posts from D1 → Generate Draft (Claude Desktop) → Review →
Publish to D1 → Call Revalidate API → regenerate Static HTML

[Public - Next.js SSG]
Build Time: D1 → Generate Static HTML → R2 Cache
User Request → R2 Cached HTML (instant) → Edge Response
On Publish: revalidatePath() → Regenerate affected page → Update R2 Cache
```

**Architecture Decision: SSG + On-Demand Revalidation**
- Static Site Generation (SSG) for maximum SEO performance
- HTML pre-rendered at build time and cached in R2
- On-demand revalidation via `revalidatePath()` when publishing
- No full rebuild needed - only affected pages regenerate
- CDN-like caching performance on Cloudflare Edge
- Optimal Core Web Vitals scores

**Project Structure:**
```
dopamine.solasido/
├── app/                   # Next.js App Router
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home - list published posts
│   ├── posts/
│   │   └── [slug]/
│   │       └── page.tsx  # Post detail page (RSC)
│   └── api/              # Next.js API routes (alternative to functions/)
│       └── posts/
│           └── route.ts  # GET /api/posts
├── functions/             # Cloudflare Pages Functions (cron jobs)
│   └── cron/
│       └── fetch-instagram.ts
├── migrations/            # D1 database migrations
├── scripts/               # Local CLI utilities
│   ├── fetch-instagram.ts
│   ├── list-posts.ts
│   ├── generate-draft.ts  # Interactive with Claude Desktop
│   ├── list-drafts.ts
│   ├── edit-draft.ts
│   └── publish-draft.ts
├── src/
│   ├── lib/              # Core logic (instagram.ts, r2.ts, db.ts, draft.ts)
│   └── components/       # React components (use "use client" as needed)
├── templates/            # Content generation prompts
├── public/               # Static assets
├── biome.json            # Biome configuration
├── tailwind.config.ts    # Tailwind configuration
├── next.config.ts        # Next.js configuration
└── wrangler.toml         # Cloudflare config
```

## Implementation Plan

### Phase 1: Project Setup & Database (Week 1)

**1.1 Create Project Structure**
- Use Cloudflare CLI to create Next.js project with OpenNext:
  ```bash
  pnpm create cloudflare@latest dopamine.solasido --framework=next --platform=workers
  cd dopamine.solasido
  ```
- This auto-generates:
  - Next.js 16 project structure
  - `open-next.config.ts` with basic OpenNext setup
  - `wrangler.toml` with Workers configuration
  - `package.json` with OpenNext dependencies
- Install additional dependencies:
  ```bash
  pnpm add sharp                                    # Image processing for local scripts
  pnpm add -D @biomejs/biome tailwindcss postcss autoprefixer
  ```
- Initialize Biome:
  ```bash
  pnpm dlx @biomejs/biome init
  # Remove ESLint config if present (using Biome instead)
  rm -f .eslintrc.json eslint.config.mjs
  ```
- Initialize Tailwind:
  ```bash
  pnpm dlx tailwindcss init -p
  ```
- Update `open-next.config.ts` to use R2 incremental cache:
  ```typescript
  import { defineCloudflareConfig } from "@opennextjs/cloudflare"
  import { r2IncrementalCache, doQueue } from "@opennextjs/cloudflare/kvCache"

  export default defineCloudflareConfig({
    incrementalCache: r2IncrementalCache,
    queue: doQueue
  })
  ```
- Update `wrangler.toml` to add:
  - D1 database binding (dopamine_db)
  - R2 bucket bindings:
    - `IMAGES_BUCKET` → dopamine-images
    - `NEXT_INC_CACHE_R2_BUCKET` → dopamine-nextjs-cache
  - Cron triggers for Instagram fetch
  - Secrets: INSTAGRAM_ACCESS_TOKEN, REVALIDATE_SECRET, CACHE_PURGE_*
  - `compatibility_flags = ["nodejs_compat"]`
  - `compatibility_date = "2024-09-23"` (or later)
- Update package.json scripts:
  - `dev`: `next dev` - Local development server
  - `build`: `opennextjs-cloudflare build` - Build for Cloudflare
  - `preview`: `opennextjs-cloudflare build && opennextjs-cloudflare preview` - Local preview
  - `deploy`: `opennextjs-cloudflare build && opennextjs-cloudflare deploy` - Deploy to Cloudflare
  - `lint`: `biome check .` - Run linter
  - `format`: `biome format --write .` - Format code
  - `db:migrate:local`: `wrangler d1 migrations apply dopamine_db --local`
  - `db:migrate:remote`: `wrangler d1 migrations apply dopamine_db --remote`

**1.2 Database Setup**
- Create D1 database: `wrangler d1 create dopamine_db`
- Create R2 buckets:
  - `wrangler r2 bucket create dopamine-images` (Instagram images)
  - `wrangler r2 bucket create dopamine-nextjs-cache` (Next.js incremental cache)
- Write migration `0001_initial_schema.sql` with 3 tables:
  - `posts_source_instagram`: Instagram metadata
  - `assets`: R2 image tracking with SHA-256 deduplication
  - `posts`: Generated content with status workflow
- Apply migrations locally and remotely

**1.3 Environment Configuration**
- Create `.env.example` with required secrets
- Set Cloudflare secrets via `wrangler secret put`:
  - `INSTAGRAM_ACCESS_TOKEN` (long-lived user token)
  - `REVALIDATE_SECRET` (for securing revalidate API endpoint)
  - `CACHE_PURGE_API_TOKEN` (Cloudflare API token with Cache Purge permission)
  - `CACHE_PURGE_ZONE_ID` (Cloudflare Zone ID)
- Configure R2 buckets:
  - Image storage bucket (existing)
  - Incremental cache bucket (new: for Next.js cache)

### Phase 2: M1 - Collection & Mirroring (Week 2-3)

**2.1 Instagram Fetcher (`src/lib/instagram.ts`)**
- Implement Graph API client:
  - Fetch endpoint: `/{user-id}/media?fields=id,caption,permalink,timestamp,media_type,children{media_url}`
  - Handle pagination (25 posts per request)
  - Filter for CAROUSEL_ALBUM and FEED posts only
  - Rate limiting: 200 calls/hour tracking via KV
- Token expiry detection and alert logic
- Store fetched posts in `posts_source_instagram` table

**2.2 Image Processor (`src/lib/r2.ts`)**
- Download images from Instagram media_url (expires in ~2 hours)
- Calculate SHA-256 hash for deduplication
- Convert to WebP (quality: 85)
- Generate R2 key: `instagram/{hash[:2]}/{hash}.webp`
- Upload to R2 bucket with content-type headers
- Store metadata in `assets` table (r2_key, r2_url, width, height, size_bytes)
- Link assets to Instagram media_id with slide_index for carousel ordering

**2.3 Cron Job (`functions/api/cron/fetch-instagram.ts`)**
- Cloudflare Cron Trigger: every 6 hours
- Fetch posts from last 24 hours
- For each post:
  1. Store in database
  2. Process carousel images
- Error handling with retry queue
- Note: Draft generation will be done manually via local scripts

**Verification:**
- Test with 5 recent Instagram posts
- Verify images uploaded to R2 with correct keys
- Check deduplication works (same image from different posts)
- Confirm database records created correctly

### Phase 3: M2 - Draft Generation (Week 4-5)

**3.1 Local Content Generator Script (`scripts/generate-draft.ts`)**
- Create prompt template (`templates/seo-draft.txt`):
  - Input: caption, carousel_count, timestamp, permalink
  - Output JSON: title, meta_description, body (markdown), summary
  - Style: search-friendly but conversational (not stiff)
  - Include internal link placeholders: `{{LINK:slug}}`
- Local execution via Claude Desktop (MCP) or CLI:
  - Use Claude Code or Claude Desktop with project context
  - Process posts one by one or in batch mode
  - Manual review and editing in real-time
- No API integration needed (local LLM interaction)

**3.2 Draft Creation Workflow (Local)**
- Run script: `npm run generate-draft [instagram_post_id]`
- Fetch caption + metadata from D1 database (via wrangler)
- Present prompt to Claude Desktop/Code
- User reviews and edits generated content
- Generate URL slug from title (Korean romanization)
- Insert into `posts` with status='draft' via D1 API
- All editing happens locally before saving to database

**3.3 Testing & Iteration**
- Generate drafts for 10 sample posts locally
- Review quality and edit in real-time
- Iterate on prompt template based on:
  - Title keyword optimization
  - Meta description engagement
  - Body structure and tone
  - Summary clarity

**Verification:**
- Draft generation script works smoothly
- Titles are 40-60 characters
- Meta descriptions are 120-150 characters
- Body is 300-500 words minimum
- Tone matches "search-soft" profile
- Data saved correctly to D1 database

### Phase 4: M3 - Review & Publishing (Week 6-7)

**4.1 Local Review & Edit Workflow**
- Run script: `npm run list-drafts` to see all pending drafts
- Edit draft locally: `npm run edit-draft [draft_id]`
  - Opens draft in your editor
  - Preview markdown rendering
  - View R2 images in terminal or browser
  - Edit title, meta_description, body directly
- Save changes back to D1 database

**4.2 Publishing Workflow (Local with On-Demand Revalidation)**
- Status transitions: `draft` → `review` → `published`
- Run: `npm run publish-draft [draft_id]`
- On publish:
  1. Validates required fields (title, meta_description, body)
  2. Set `published_at` timestamp
  3. Update D1 database (mark as published)
  4. **Call revalidate API** to regenerate static pages:
     - `POST /api/revalidate` with auth token
     - Revalidates `/posts/[slug]` (post page)
     - Revalidates `/` (home page with post list)
  5. Generate OpenGraph/Twitter meta tags
  6. Log publication event
- Published pages are instantly available with fresh content

**4.3 API Endpoints (Read-Only)**
- `GET /api/posts` - List published posts (for blog integration)
- `GET /api/posts/[id]` - Get single published post with images
- Note: No write endpoints needed - all editing done locally via scripts

**Verification:**
- Review 5 drafts end-to-end
- Verify status workflow prevents skipping review
- Test internal link insertion
- Confirm published posts have correct metadata

### Phase 5: Integration & Production (Week 8)

**5.1 Deployment**
- Build and deploy: `npm run deploy`
  - OpenNext builds Next.js app and transforms it to Workers format
  - Deploys to Cloudflare Workers (not Pages)
  - RSC (React Server Components) fully supported
- Set custom domain: `dopamine.solasido.world` via Cloudflare dashboard
- Enable cron triggers in wrangler.toml
- Monitor first 24-hour cycle
- Note: Bundle size must be < 25MB compressed (Workers limit)

**5.2 Blog Frontend (Next.js on Workers)**
- Published posts displayed via Next.js App Router
- **Server Components fetch data directly from D1** (no caching, always fresh)
- Simple architecture: no ISR, no revalidateTag needed
- Deployed to Cloudflare Workers at `dopamine.solasido.world`
- Features:
  - SEO-optimized with Next.js metadata API
  - OpenGraph images for social sharing
  - RSS feed generation
  - Sitemap.xml generation (Next.js built-in)
  - Edge rendering for fast global performance
- D1 query performance is fast enough without caching layer

**5.3 Documentation (`plan-docs/` directory)**
- Create comprehensive documentation:
  - `plan-docs/architecture.md` - System design and data flow
  - `plan-docs/api-reference.md` - Endpoint documentation
  - `plan-docs/operations.md` - Runbook for common tasks
  - `plan-docs/database-schema.md` - Table definitions and relationships
  - `plan-docs/content-guidelines.md` - Review best practices
- Include this implementation plan as `plan-docs/implementation-plan.md`

**5.4 Monitoring Setup**
- Cloudflare Workers Analytics for API metrics
- Log key events: fetch_started, image_uploaded
- Alert on:
  - Instagram token < 14 days to expiry
  - Image processing failures > 5%
  - Retry queue depth > 20
- Note: Draft generation and publishing are manual local processes, no monitoring needed

**Verification:**
- Process 10 backlog Instagram posts end-to-end
- Review published content on blog
- Check sitemap updated correctly
- Monitor for 1 week, verify no errors in logs

## Critical Files to Implement

**Database:**
- `dopamine.solasido/migrations/0001_initial_schema.sql` - Core schema (3 tables with indexes)

**Core Libraries:**
- `dopamine.solasido/src/lib/instagram.ts` - Graph API client, rate limiting, pagination
- `dopamine.solasido/src/lib/r2.ts` - Image download, WebP conversion, SHA-256 dedup, R2 upload
- `dopamine.solasido/src/lib/db.ts` - D1 query helpers and type-safe wrappers
- `dopamine.solasido/src/lib/draft.ts` - Draft management and publishing logic

**API Endpoints:**
- `dopamine.solasido/functions/api/cron/fetch-instagram.ts` - Scheduled pipeline orchestration
- `dopamine.solasido/app/api/revalidate/route.ts` - On-demand revalidation endpoint (secured with token)
- `dopamine.solasido/app/api/posts/route.ts` - List published posts (optional, for external integrations)

**Frontend (Next.js App Router - SSG):**
- `dopamine.solasido/app/layout.tsx` - Root layout with Tailwind
- `dopamine.solasido/app/page.tsx` - List published posts (SSG with revalidation)
- `dopamine.solasido/app/posts/[slug]/page.tsx` - Single post view (SSG with generateStaticParams)
- `dopamine.solasido/app/api/revalidate/route.ts` - Revalidate API endpoint (secured)
- `dopamine.solasido/src/lib/db-client.ts` - D1 binding access via `getRequestContext()`
- `dopamine.solasido/src/lib/queries.ts` - SQL queries for posts/drafts
- `dopamine.solasido/src/components/PostCard.tsx` - Post preview component
- `dopamine.solasido/src/components/PostContent.tsx` - Markdown renderer

**Configuration:**
- `dopamine.solasido/open-next.config.ts` - OpenNext with r2IncrementalCache + doQueue
- `dopamine.solasido/next.config.ts` - Next.js configuration
- `dopamine.solasido/tailwind.config.ts` - Tailwind CSS configuration
- `dopamine.solasido/biome.json` - Biome linting & formatting rules
- `dopamine.solasido/wrangler.toml` - Cloudflare bindings:
  - D1 database (dopamine_db)
  - R2 buckets (images + NEXT_INC_CACHE_R2_BUCKET)
  - Durable Objects (revalidation queue)
  - Cron triggers
  - Secrets (INSTAGRAM_ACCESS_TOKEN, REVALIDATE_SECRET, CACHE_PURGE_*)
- `dopamine.solasido/.env.example` - Environment variable template
- `dopamine.solasido/templates/seo-draft.txt` - Claude prompt template
- `dopamine.solasido/tsconfig.json` - TypeScript configuration

**Scripts (Local Execution):**
- `dopamine.solasido/scripts/fetch-instagram.ts` - Manual fetch for testing
- `dopamine.solasido/scripts/list-posts.ts` - List Instagram posts without drafts
- `dopamine.solasido/scripts/generate-draft.ts` - Interactive draft generation with Claude
- `dopamine.solasido/scripts/list-drafts.ts` - List all drafts by status
- `dopamine.solasido/scripts/edit-draft.ts` - Edit draft locally
- `dopamine.solasido/scripts/publish-draft.ts` - Publish draft to D1 + trigger revalidation
- `dopamine.solasido/scripts/revalidate.ts` - Manual revalidation helper (calls /api/revalidate)
- `dopamine.solasido/scripts/process-carousel.ts` - Backfill image processing

## Error Handling & Edge Cases

**Instagram API:**
- Token expiry: Detect OAuthException code 190, send alert
- Rate limiting: Track via KV, queue requests if limit reached
- Network errors: Retry with exponential backoff (3 attempts)

**Image Processing:**
- Download timeout: 30-second limit, retry once
- Invalid image format: Log error, skip image, continue pipeline
- R2 upload failure: Add to retry_queue

**Local Content Generation:**
- Interactive process - no automated retries needed
- User reviews output in real-time and can regenerate if needed
- Manual validation of JSON structure before saving to database

**Retry Queue:**
- Process every 15 minutes via separate cron job
- Max retries: 3 per operation
- Exponential backoff: 5min, 15min, 45min

## Testing Strategy

**Unit Tests:**
- Instagram API response parsing
- SHA-256 hash generation and R2 key building
- Claude response JSON validation
- Slug generation from Korean titles

**Integration Tests:**
- End-to-end pipeline: Instagram → R2 → Draft
- Status workflow: draft → review → published
- Retry queue processing

**Local Development:**
- Use `wrangler dev` with `--local` flag for D1
- Mock Instagram API responses for testing
- Test cron jobs via manual script invocation

## Timeline

- **Week 1**: Setup (project, database, config)
- **Week 2-3**: M1 Collection & Mirroring
- **Week 4-5**: M2 Draft Generation
- **Week 6-7**: M3 Review & Publishing
- **Week 8**: Integration, docs, monitoring, production

**Total**: 8 weeks to production-ready system

## Open Questions for User

1. **Domain**: Publish to existing dopamine.solasido.world or new subdomain?
2. **Image Retention**: Keep original Instagram images or WebP only?
3. **Cluster Priority**: Which topic clusters first (부부일상툰, 신혼생활, etc.)?
4. **Backlog Processing**: How many historical Instagram posts to process initially?

---

**Next Steps After Approval:**
1. Create project structure and initialize
2. Set up D1 database with migrations
3. Implement Instagram fetcher (M1)
4. Create plan-docs/ directory with detailed documentation
