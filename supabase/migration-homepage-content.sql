-- Add editable homepage sections (brand story, benefits, testimonials, etc.)
alter table public.catalog_store
  add column if not exists homepage_content jsonb not null default '{}'::jsonb;
