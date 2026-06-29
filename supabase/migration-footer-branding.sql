-- Add footer branding and about section columns
alter table public.catalog_store
  add column if not exists footer jsonb not null default '{}'::jsonb;

alter table public.catalog_store
  add column if not exists about jsonb not null default '{}'::jsonb;
