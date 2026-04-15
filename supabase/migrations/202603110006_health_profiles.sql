create table if not exists public.health_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  bmi numeric(5,2),
  bmr integer,
  tdee integer,
  body_fat_estimate numeric(5,2),
  health_score integer,
  risk_factors jsonb,
  strengths jsonb,
  improvement_areas jsonb,
  nutrition_plan jsonb,
  exercise_plan jsonb,
  sleep_recommendation jsonb,
  supplement_recommendations jsonb,
  ai_generated_summary text,
  last_calculated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.health_profiles enable row level security;

drop trigger if exists set_health_profiles_updated_at on public.health_profiles;
create trigger set_health_profiles_updated_at
before update on public.health_profiles
for each row execute function public.set_updated_at();

drop policy if exists "Own health profile" on public.health_profiles;
create policy "Own health profile"
on public.health_profiles
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);