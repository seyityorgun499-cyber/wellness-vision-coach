-- Add URL column to scientific_sources for web-ingested content
alter table public.scientific_sources
  add column if not exists url text;

-- Add unique index on URL to prevent duplicate ingestion
create unique index if not exists idx_scientific_sources_url
  on public.scientific_sources(url)
  where url is not null;
