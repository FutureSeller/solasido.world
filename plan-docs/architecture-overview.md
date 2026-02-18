# Instagram to SEO Blog Pipeline - Architecture Overview

## Status Update (2026-02-19)

This document originally described a Next.js + OpenNext architecture. The production `apps/dopamine.solasido` app is now Astro-based and deployed on Cloudflare Pages (static build).

Current public blog baseline:
- Framework: Astro 5 + Tailwind CSS
- Rendering: Static generation (SSG) from D1 at build time
- SEO: JSON-LD, Open Graph/Twitter tags, `@astrojs/sitemap`, `robots.txt`
- Analytics: GA4 via `PUBLIC_GA_MEASUREMENT_ID`
- Search Console: `google-site-verification` meta via `PUBLIC_GSC_VERIFICATION`

Recent UX updates implemented in app:
- Post detail carousel navigation (Embla with icon controls + centered page indicator)
- Post detail Instagram source link now prioritizes Instagram permalink
- Home/list page view toggle (grid/list) with `localStorage` persistence
- Header Instagram profile outlink chip and favicon `.ico` default

Use this section as the source of truth for current runtime/deploy assumptions. Legacy Next.js/OpenNext sections below are historical planning notes.

## System Overview

This system automates the conversion of Instagram carousel posts into SEO-optimized blog content for solasido.world. The architecture is split into **two separate applications** that share a common database.

```
┌─────────────────────────────────────────────────────────────────┐
│                         solasido.world                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  dopamine.solasido.world          studio.solasido.world        │
│  ┌────────────────┐                ┌────────────────┐          │
│  │ Public Blog    │                │ Admin Panel    │          │
│  │ (Next.js SSG)  │                │ (Next.js)      │          │
│  │                │                │ + Google OAuth │          │
│  └────────┬───────┘                └───────┬────────┘          │
│           │                                 │                   │
│           │         ┌──────────────┐       │                   │
│           └────────►│  D1 Database │◄──────┘                   │
│                     │ (dopamine_db)│                           │
│                     └──────┬───────┘                           │
│                            │                                    │
│                     ┌──────▼───────┐                           │
│                     │  R2 Storage  │                           │
│                     │ - Images     │                           │
│                     │ - Cache      │                           │
│                     └──────────────┘                           │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Cloudflare Workers Cron                               │   │
│  │  - Instagram fetch (every 6 hours)                     │   │
│  │  - Image processing & R2 upload                        │   │
│  └────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
solasido.world/
├── dopamine.solasido/          # Public blog (SSG)
│   ├── app/
│   │   ├── page.tsx           # Post list (SSG)
│   │   └── posts/[slug]/      # Post detail (SSG)
│   ├── functions/
│   │   └── cron/
│   │       └── fetch-instagram.ts  # Scheduled Instagram fetch
│   └── wrangler.toml          # Deploy to dopamine.solasido.world
│
├── studio.solasido/            # Admin panel (separate project)
│   ├── app/
│   │   ├── page.tsx           # Dashboard
│   │   ├── instagram/         # Instagram posts management
│   │   ├── drafts/            # Draft editing
│   │   └── posts/             # Published posts management
│   └── wrangler.toml          # Deploy to studio.solasido.world
│
├── plan-docs/                  # Documentation
│   ├── architecture-overview.md     # This file
│   ├── dopamine-implementation.md   # Public blog implementation plan
│   └── studio-implementation.md     # Admin panel implementation plan
│
└── migrations/                 # Shared D1 migrations
    └── 0001_initial_schema.sql
```

## Applications

### 1. dopamine.solasido (Public Blog)

**Domain**: `dopamine.solasido.world`

**Purpose**: SEO-optimized public blog displaying published Instagram content

**Tech Stack**:
- Next.js 16 with App Router (RSC)
- SSG (Static Site Generation) with on-demand revalidation
- Tailwind CSS
- Biome (linting)
- OpenNext Cloudflare adapter

**Features**:
- ✅ Fast static pages (pre-rendered at build time)
- ✅ R2 cached HTML for global edge performance
- ✅ SEO optimized (metadata, OpenGraph, sitemap)
- ✅ On-demand revalidation when new posts published
- ✅ Direct D1 fetching via Server Components

**Access**: Public (no authentication)

**Deployment**: Cloudflare Workers via OpenNext

---

### 2. studio.solasido (Admin Panel)

**Domain**: `studio.solasido.world`

**Purpose**: Content management system for reviewing and publishing blog posts

**Tech Stack**:
- Next.js 16 with App Router
- Tailwind CSS
- Biome (linting)
- OpenNext Cloudflare adapter
- Cloudflare Access (Google OAuth)

**Features**:
- ✅ Instagram posts management (view, select)
- ✅ Draft creation interface (with Claude Desktop integration guidance)
- ✅ Draft editing (title, meta_description, body)
- ✅ Markdown preview
- ✅ Publishing workflow (draft → review → published)
- ✅ Triggers revalidation on dopamine.solasido.world after publish

**Access**: Restricted (Cloudflare Access + Google OAuth)

**Deployment**: Cloudflare Workers via OpenNext

---

## Shared Infrastructure

### D1 Database: `dopamine_db`

**Tables**:
1. `posts_source_instagram` - Instagram metadata
2. `assets` - R2 image tracking
3. `posts` - Blog posts (draft/review/published)

**Access**:
- `dopamine.solasido`: Read-only (published posts)
- `studio.solasido`: Read/Write (all data)

### R2 Storage

**Buckets**:
1. `dopamine-images` - Instagram carousel images (WebP)
2. `dopamine-nextjs-cache` - Next.js incremental cache for SSG

**Access**: Both apps read from R2 (public URLs)

### Cloudflare Workers Cron

**Schedule**: Every 6 hours

**Function**: `functions/cron/fetch-instagram.ts` (in dopamine.solasido project)

**Tasks**:
1. Fetch Instagram posts from Graph API
2. Download carousel images
3. Convert to WebP & calculate SHA-256 hash
4. Upload to R2 (deduplicate by hash)
5. Store metadata in D1

---

## Data Flow

### Content Creation Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Instagram Post Published                                     │
│    ↓                                                             │
│ 2. Cloudflare Cron (6hr)                                        │
│    → Fetch from Instagram Graph API                             │
│    → Download images → R2 upload                                │
│    → Store in posts_source_instagram                            │
│    ↓                                                             │
│ 3. Admin logs into studio.solasido.world                        │
│    → Views Instagram posts without drafts                       │
│    → Clicks "Generate Draft"                                    │
│    ↓                                                             │
│ 4. Local content generation                                     │
│    → Copy prompt from admin UI                                  │
│    → Paste into Claude Desktop                                  │
│    → Generate SEO-optimized content                             │
│    → Paste result back to admin UI                              │
│    ↓                                                             │
│ 5. Review & Edit in admin UI                                    │
│    → Edit title, meta_description, body                         │
│    → Preview markdown                                            │
│    → Save as 'draft' or 'review'                                │
│    ↓                                                             │
│ 6. Publish                                                       │
│    → Click "Publish" in admin UI                                │
│    → Status: draft → published                                  │
│    → Set published_at, canonical_url                            │
│    → Call revalidate API on dopamine.solasido.world            │
│    ↓                                                             │
│ 7. Static page generation                                       │
│    → dopamine.solasido.world receives revalidate request       │
│    → Regenerates /posts/[slug] static page                     │
│    → Updates R2 cache                                           │
│    ↓                                                             │
│ 8. Live on blog                                                  │
│    → Users see new post at dopamine.solasido.world/posts/slug  │
│    → Cached at edge for fast global access                     │
└─────────────────────────────────────────────────────────────────┘
```

### User Visit Flow (Public Blog)

```
User → dopamine.solasido.world/posts/example-post
  ↓
Cloudflare Edge (closest datacenter)
  ↓
R2 Cache Hit?
  ├─ Yes → Serve cached HTML (< 50ms)
  └─ No  → Next.js Server Component
           ↓
           Query D1 (SELECT * FROM posts WHERE slug = ?)
           ↓
           Render HTML
           ↓
           Cache in R2
           ↓
           Return to user
```

---

## Security

### studio.solasido.world (Admin)

**Authentication**: Cloudflare Access with Google OAuth

**Setup**:
1. Cloudflare Dashboard → Zero Trust → Access
2. Create Application:
   - Type: Self-hosted
   - Domain: `studio.solasido.world`
   - Identity Provider: Google OAuth
   - Allowed emails: [your-email@gmail.com]

**Protection**:
- ✅ Entire domain protected (studio.solasido.world/*)
- ✅ Email-based access control
- ✅ No code changes needed (Cloudflare handles auth)

### dopamine.solasido.world (Public Blog)

**Authentication**: None (public access)

**Security**:
- ✅ Read-only D1 access
- ✅ No write operations from public app
- ✅ Revalidate API protected by secret token

### Secrets Management

**Cloudflare Secrets** (encrypted, not in code):
```bash
# dopamine.solasido
wrangler secret put INSTAGRAM_ACCESS_TOKEN
wrangler secret put REVALIDATE_SECRET
wrangler secret put CACHE_PURGE_API_TOKEN
wrangler secret put CACHE_PURGE_ZONE_ID

# studio.solasido
wrangler secret put REVALIDATE_SECRET  # To call dopamine's revalidate API
```

**Never in git**:
- ❌ `.env` files (in .gitignore)
- ❌ Hard-coded tokens
- ❌ API keys in code

---

## Deployment

### Build & Deploy Commands

```bash
# Public blog
cd dopamine.solasido
pnpm run build    # opennextjs-cloudflare build
pnpm run deploy   # Deploy to dopamine.solasido.world

# Admin panel
cd studio.solasido
pnpm run build
pnpm run deploy   # Deploy to studio.solasido.world
```

### DNS Configuration

```
Type    Name      Value
─────────────────────────────────────────
CNAME   dopamine  <cloudflare-workers-url>
CNAME   studio    <cloudflare-workers-url>
```

### Environment Setup

**Development**:
```bash
# dopamine.solasido
pnpm run dev              # localhost:3000

# studio.solasido
pnpm run dev              # localhost:3001

# D1 local
wrangler d1 migrations apply dopamine_db --local
```

**Production**:
```bash
# One-time setup
wrangler d1 create dopamine_db
wrangler r2 bucket create dopamine-images
wrangler r2 bucket create dopamine-nextjs-cache

# Migrations
wrangler d1 migrations apply dopamine_db --remote
```

---

## Monitoring & Maintenance

### Health Checks

**Instagram Cron**:
- Monitor for token expiry (60 day alert)
- Check fetch failures (alert if > 5%)
- Track rate limiting (200 calls/hour)

**Published Posts**:
- Verify revalidation works after publish
- Check R2 cache hit rate
- Monitor page load times

### Logs

**Cloudflare Workers Logs**:
- Cron execution logs
- API errors
- Revalidation requests

**Admin Activity**:
- Draft creations
- Publish events
- User logins (via Cloudflare Access logs)

---

## Future Enhancements

**v2 Features** (not in initial scope):
- [ ] Automated Claude API integration (remove local generation step)
- [ ] Bulk publishing workflow
- [ ] Post scheduling (publish_at future date)
- [ ] Analytics dashboard (page views, popular posts)
- [ ] Image editing in admin UI
- [ ] Revision history for published posts
- [ ] Multi-user support with roles
- [ ] Instagram comments integration
- [ ] Automatic internal linking suggestions

---

## Timeline

**Week 1-2**: dopamine.solasido (Public Blog)
- Project setup, database, Instagram fetcher

**Week 3-4**: studio.solasido (Admin Panel)
- Admin UI, draft management, publishing workflow

**Week 5**: Integration & Testing
- End-to-end workflow testing
- Security review
- Performance optimization

**Week 6**: Deployment & Documentation
- Production deployment
- Monitoring setup
- User documentation

---

## References

- [dopamine-implementation.md](./dopamine-implementation.md) - Public blog implementation details
- [studio-implementation.md](./studio-implementation.md) - Admin panel implementation details
- [OpenNext Cloudflare Documentation](https://opennext.js.org/cloudflare)
- [Cloudflare Access Setup](https://developers.cloudflare.com/cloudflare-one/applications/configure-apps/)
