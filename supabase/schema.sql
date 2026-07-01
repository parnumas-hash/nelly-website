-- NELLY GROUP catalog (Phase 1)
-- Run in Supabase Dashboard → SQL Editor

create table if not exists public.catalog_store (
  id text primary key default 'main',
  catalog_version integer not null default 4,
  products jsonb not null default '[]'::jsonb,
  brands jsonb not null default '[]'::jsonb,
  categories jsonb not null default '[]'::jsonb,
  media jsonb not null default '[]'::jsonb,
  banner jsonb not null default '{}'::jsonb,
  footer jsonb not null default '{}'::jsonb,
  about jsonb not null default '{}'::jsonb,
  home_collections jsonb not null default '{}'::jsonb,
  homepage_content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.catalog_store (id)
values ('main')
on conflict (id) do nothing;

-- Public read bucket for product / brand images
insert into storage.buckets (id, name, public)
values ('catalog-media', 'catalog-media', true)
on conflict (id) do nothing;

create policy "Public read catalog media"
on storage.objects for select
using (bucket_id = 'catalog-media');
