-- Add editable trust / legal pages (shipping, returns, faq, etc.)
alter table public.catalog_store
  add column if not exists site_pages jsonb not null default '{}'::jsonb;
