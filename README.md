# NELLY GROUP — Premium Pet Lifestyle Store

A luxury, Apple-inspired ecommerce website for NELLY GROUP — a curated premium pet lifestyle store featuring world-class brands.

**Production:** https://nelly-website-seven.vercel.app

## Featured Brands

- **AIRBUGGY PET** — Premium pet mobility
- **MANDARINE BROTHERS** — Refined pet fashion
- **RADICA** — Interactive play
- **ROSEWOOD** — Natural living
- **FUKU FUKU PET** — Japanese delicacies
- **HARRYS PET** — Grooming excellence
- **Earth Rated** — Eco-conscious care
- **FuzzYard** — Designer comfort

## Tech Stack

- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS + Framer Motion
- Supabase (catalog storage + media bucket)
- next-themes (dark mode)

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without Supabase env vars, the catalog runs in **browser localStorage** (good for local UI work). With Supabase configured, admin changes sync to the cloud.

## Environment Variables

Copy `.env.example` to `.env.local`:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (optional) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side catalog API (keep secret) |
| `ADMIN_PASSWORD` | Initial admin password |
| `ADMIN_SESSION_SECRET` | Cookie signing secret |

Optional for migration scripts:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Direct Postgres connection string |
| `SUPABASE_DB_PASSWORD` | Database password (script builds pooler URL) |
| `SUPABASE_DB_REGION` | AWS region (default `ap-southeast-1`) |

Sync production env from Vercel:

```bash
npm run env:sync
```

## Supabase Setup

Run these in **Supabase Dashboard → SQL Editor** (in order for a fresh project):

1. **`supabase/schema.sql`** — `catalog_store` table + public `catalog-media` bucket
2. **`supabase/schema-admin-users.sql`** — admin users + roles
3. **`supabase/migration-footer-branding.sql`** — footer, about, home collections columns (if upgrading an older DB)
4. **`supabase/migration-homepage-content.sql`** — homepage CMS column
5. **`supabase/migration-site-pages.sql`** — trust pages CMS column (`site_pages`)

Or run migrations from the CLI (requires `DATABASE_URL` or `SUPABASE_DB_PASSWORD` in `.env.local`):

```bash
npm run migrate:homepage-content
npm run migrate:site-pages
```

### Migration checklist

Use this when deploying or upgrading production:

- [ ] `schema.sql` applied (new project)
- [ ] `schema-admin-users.sql` applied
- [ ] `migration-footer-branding.sql` applied (legacy DBs only)
- [ ] `migration-homepage-content.sql` applied (or `npm run migrate:homepage-content`)
- [ ] `migration-site-pages.sql` applied (or `npm run migrate:site-pages`)
- [ ] Vercel env vars set (`NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_*`)
- [ ] First login at `/admin/login` with username `admin` and `ADMIN_PASSWORD`

## Admin Panel

URL: **`/admin`**

| Area | Path | Permission |
|------|------|------------|
| Dashboard | `/admin` | any authenticated user |
| Products | `/admin/products` | `products:read` |
| Add / edit / delete / import | `/admin/products/*` | `products:write` |
| Brands | `/admin/brands` | `brands:read` / `brands:write` |
| Media | `/admin/media` | `media:read` / `media:write` |
| Site Content | `/admin/site-content` | `banners:read` / `banners:write` |

**Site Content** covers hero banner, brand story, benefits, testimonials, Instagram gallery, store locator, First Adventure (copy + featured products), collection blocks (Travel / Home Living / Eco), footer, about page, and trust pages. Images are cropped to recommended aspect ratios and auto-compressed when over ~5 MB.

| Site Content tab | What it controls |
|------------------|------------------|
| Footer | Tagline, link columns, social links, copyright, legal links |
| Trust Pages | Shipping, Returns, FAQ, How to Shop, Privacy, Terms |
| First Adventure | Section copy + two featured product SKUs |
| New Collection / Best Seller | Section headings, links, and up to 4 featured SKUs each |
| Travel / Home Living / Eco | Section copy, hero image, CTA link, and up to 4 featured SKUs |

### Product bulk import (Phase 1)

Available to users with **`products:write`** only:

1. Open **Products** → **Download Template** (Excel with brands/categories)
2. Fill one row per variant (SKU is the upsert key)
3. **Import Products** → choose file → preview errors/warnings → **Confirm Import**

Modes:

- **Upsert by SKU** — create new products or update existing variants by SKU
- **Create only** — skip rows whose SKU already exists

## Homepage Sections

- Hero banner (editable in Site Content)
- Brand showcase + featured collections
- Brand story, benefits, testimonials
- First Adventure (copy in Site Content; product cards auto from catalog)
- New arrivals, best sellers (editable in Site Content), Instagram gallery
- Store locator + newsletter signup
- Premium footer

Trust pages (shipping, returns, privacy, etc.) are editable in **Site Content → Trust Pages** and stored in Supabase (`site_pages`). Defaults live in `src/lib/admin/site-pages-content.ts`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run env:sync` | Pull Vercel production env |
| `npm run pull:production` | Backup cloud catalog to local file |
| `npm run restore:local` | Restore backup into localStorage dev flow |
| `npm run migrate:homepage-content` | Add `homepage_content` column on Supabase |
| `npm run migrate:site-pages` | Add `site_pages` column on Supabase |

## Design

- **Style:** Luxury, minimal, Apple-inspired
- **Colors:** Primary red `#D50000`, white, light gray, black
- **Typography:** Inter + Playfair Display

## Reusable Components

| Component | Path | Purpose |
|-----------|------|---------|
| `SectionHeader` | `components/ui/` | Consistent section titles |
| `ProductSection` | `components/product/` | Product grid with header |
| `ProductCard` | `components/product/` | Individual product tile |
| `BrandCard` | `components/brand/` | Brand showcase card |
| `FadeIn` | `components/ui/` | Scroll reveal animation |
