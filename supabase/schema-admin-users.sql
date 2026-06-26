-- NELLY GROUP admin users (Phase A — multi-user RBAC)
-- Run in Supabase Dashboard → SQL Editor after schema.sql

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  password_hash text not null,
  display_name text not null,
  roles jsonb not null default '["product_editor"]'::jsonb,
  active boolean not null default true,
  must_change_password boolean not null default true,
  last_login_at timestamptz,
  created_by uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_users_username_unique unique (username),
  constraint admin_users_roles_array check (jsonb_typeof(roles) = 'array')
);

create index if not exists admin_users_username_idx on public.admin_users (username);
create index if not exists admin_users_active_idx on public.admin_users (active);
