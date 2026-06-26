# NELLY GROUP — Premium Pet Lifestyle Store

A luxury, Apple-inspired ecommerce website for NELLY GROUP — a curated premium pet lifestyle store featuring world-class brands.

## Tech Stack

- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Storage)
- Vercel (production hosting)

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without Supabase, the admin panel stores catalog data in the browser (`localStorage`). With Supabase configured, catalog syncs to the cloud.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Required (production) | Purpose |
|----------|----------------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-side DB + storage access |
| `ADMIN_PASSWORD` | Yes | Bootstrap super-admin password |
| `ADMIN_SESSION_SECRET` | Yes | Cookie signing (32+ chars) |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical site URL for SEO |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Reserved for future client features |

Production builds **fail** if required variables are missing or use placeholder values.

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and run, in order:
   - `supabase/schema.sql` — catalog store, media bucket, newsletter table
   - `supabase/schema-admin-users.sql` — admin users + RBAC
3. Copy **Project URL** and **service_role** key from **Settings → API** into `.env.local`
4. Create a public storage bucket `catalog-media` if not created by schema (schema creates it automatically)

## Admin Panel

- URL: `/admin`
- **First login (Supabase):** username `admin`, password = `ADMIN_PASSWORD` from env (auto-created on first login)
- After admin users exist in Supabase, legacy single-password login is disabled — username is required
- Features: products, variants, brands, categories, media, banners, backup/restore, multi-user RBAC

### Admin Roles

| Role | Access |
|------|--------|
| `super_admin` | Full access including user management |
| `catalog_manager` | Products, brands, categories, media, banners |
| `product_editor` | Products only |
| `fulfillment_staff` | Orders (Phase 2) |
| `viewer` | Read-only dashboard |

## Deploy to Vercel

1. Push code to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.example`
4. Deploy — production build validates env automatically
5. After deploy: open `/admin`, sign in, **Settings → Export backup** (optional), verify catalog on `/shop`

### Post-deploy checklist

- [ ] Supabase schemas applied
- [ ] Env vars set on Vercel (especially `ADMIN_SESSION_SECRET`, `ADMIN_PASSWORD`)
- [ ] Admin login works with username + password
- [ ] Catalog restore or seed data visible on `/shop`
- [ ] Brand images load from Supabase storage

## Catalog API

| Endpoint | Auth | Returns |
|----------|------|---------|
| `GET /api/catalog` | Public | Published products only (no drafts) |
| `GET /api/catalog/admin` | Admin session | Full catalog including drafts |
| `PUT /api/catalog` | Admin + `catalog:write` | Save catalog |
| `POST /api/catalog/restore` | Admin | Restore from backup JSON |
| `POST /api/newsletter` | Public | Save email to Supabase |

## Backup & Restore

Admin → **Settings**:

- **Export** — download full catalog JSON
- **Restore** — upload backup JSON (overwrites cloud catalog)
- **Reset** — restore factory defaults (requires typing `RESET`)

Always export before major changes or migrations.

## Project Structure

```
src/
  app/           # Pages and API routes
  components/    # UI, product, admin, shop
  context/       # Cart, catalog, wishlist, auth
  lib/           # Supabase, admin, catalog, variants
supabase/        # SQL schemas
```

## Design

- **Style:** Luxury, minimal, Apple-inspired
- **Colors:** Primary red `#D50000`, white, light gray, black
- **Currency:** THB (฿)

## Phase 2 (not yet implemented)

- Checkout & payments
- Orders & fulfillment UI
- Real customer accounts
- Promaxx stock sync
