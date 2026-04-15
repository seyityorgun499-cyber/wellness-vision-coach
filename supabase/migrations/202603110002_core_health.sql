create extension if not exists pgcrypto;

create table if not exists public.daily_health_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  calories_consumed integer default 0,
  calories_burned integer default 0,
  calories_target integer default 2100,
  protein_grams numeric(6, 2) default 0,
  protein_target numeric(6, 2) default 180,
  carbs_grams numeric(6, 2) default 0,
  fat_grams numeric(6, 2) default 0,
  water_ml integer default 0,
  water_target integer default 2400,
  steps integer default 0,
  steps_target integer default 10000,
  sleep_minutes integer,
  sleep_target integer default 480,
  stress_level integer,
  mood_score integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, date)
);

create table if not exists public.food_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_type text not null,
  food_name text not null,
  calories integer not null,
  protein_grams numeric(6, 2),
  carbs_grams numeric(6, 2),
  fat_grams numeric(6, 2),
  fiber_grams numeric(6, 2),
  serving_size text,
  image_url text,
  barcode text,
  ai_confidence numeric(5, 2),
  source text default 'manual',
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.activity_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null,
  duration_minutes integer not null,
  calories_burned integer,
  intensity text default 'moderate',
  heart_rate_avg integer,
  heart_rate_max integer,
  distance_km numeric(8, 3),
  notes text,
  started_at timestamptz not null,
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.voice_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  audio_url text,
  duration_seconds integer,
  transcription text,
  sentiment text,
  mood text,
  keywords text[] default '{}',
  ai_summary text,
  ai_recommendations jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.health_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  document_type text not null,
  file_url text,
  mime_type text,
  file_size integer,
  ocr_text text,
  ai_analysis text,
  ai_recommendations jsonb,
  tags text[] default '{}',
  status text default 'pending',
  uploaded_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.daily_health_logs enable row level security;
alter table public.food_entries enable row level security;
alter table public.activity_entries enable row level security;
alter table public.voice_entries enable row level security;
alter table public.health_documents enable row level security;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_daily_health_logs_updated_at on public.daily_health_logs;
create trigger set_daily_health_logs_updated_at
before update on public.daily_health_logs
for each row execute function public.set_updated_at();

drop policy if exists "Own daily health logs" on public.daily_health_logs;
create policy "Own daily health logs"
on public.daily_health_logs
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Own food entries" on public.food_entries;
create policy "Own food entries"
on public.food_entries
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Own activity entries" on public.activity_entries;
create policy "Own activity entries"
on public.activity_entries
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Own voice entries" on public.voice_entries;
create policy "Own voice entries"
on public.voice_entries
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Own health documents" on public.health_documents;
create policy "Own health documents"
on public.health_documents
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);