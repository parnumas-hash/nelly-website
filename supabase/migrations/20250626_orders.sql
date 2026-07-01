-- Phase 2: storefront orders
-- Run in Supabase Dashboard → SQL Editor (or scripts/run-orders-migration.mjs)

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
