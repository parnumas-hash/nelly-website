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
  site_pages jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Phase 2 orders
create table if not exists public.orders (
  id text primary key,
  order_number text not null unique,
  status text not null default 'pending',
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address text not null,
  notes text,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric not null,
  shipping_fee numeric not null,
  total numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

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
