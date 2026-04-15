create table if not exists public.fasting_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  fasting_plan text not null,
  started_at timestamptz not null,
  target_end_at timestamptz not null,
  actual_end_at timestamptz,
  completed boolean not null default false,
  notes text,
  mood_before integer,
  mood_after integer,
  created_at timestamptz not null default now()
);

alter table public.fasting_logs enable row level security;

drop policy if exists "Own fasting logs" on public.fasting_logs;
create policy "Own fasting logs"
on public.fasting_logs
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);