create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  icon_url text,
  category text,
  requirement jsonb,
  points integer default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  earned_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(user_id, achievement_id)
);

create table if not exists public.user_streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_active_date date,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.user_streaks enable row level security;

drop policy if exists "Achievements are readable" on public.achievements;
create policy "Achievements are readable"
on public.achievements
for select
to authenticated
using (true);

drop policy if exists "Own user achievements" on public.user_achievements;
create policy "Own user achievements"
on public.user_achievements
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Own user streaks" on public.user_streaks;
create policy "Own user streaks"
on public.user_streaks
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop trigger if exists set_user_streaks_updated_at on public.user_streaks;
create trigger set_user_streaks_updated_at
before update on public.user_streaks
for each row execute function public.set_updated_at();

insert into public.achievements (name, description, icon_url, category, requirement, points)
values
  ('First Meal', 'Log your first meal', '🍽️', 'milestone', '{"type":"food_count","value":1}'::jsonb, 10),
  ('Active Start', 'Log your first activity', '🏃', 'milestone', '{"type":"activity_count","value":1}'::jsonb, 10),
  ('Hydrated', 'Reach your daily water goal', '💧', 'challenge', '{"type":"water_goal","value":1}'::jsonb, 15),
  ('Voice Journal', 'Record your first voice log', '🎤', 'milestone', '{"type":"voice_count","value":1}'::jsonb, 10),
  ('Daily Hero', 'Complete all daily quests in one day', '🎁', 'challenge', '{"type":"all_quests","value":1}'::jsonb, 20),
  ('Three Day Streak', 'Stay active for 3 consecutive days', '🔥', 'streak', '{"type":"streak","value":3}'::jsonb, 25),
  ('Seven Day Streak', 'Stay active for 7 consecutive days', '⚡', 'streak', '{"type":"streak","value":7}'::jsonb, 50)
on conflict do nothing;