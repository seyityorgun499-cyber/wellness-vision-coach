create table if not exists public.wearable_devices (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text not null,
  type text not null,
  supported_metrics text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.user_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  device_id uuid not null references public.wearable_devices(id),
  device_name text,
  is_connected boolean not null default true,
  last_sync timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wearable_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  device_id uuid not null references public.wearable_devices(id),
  metric_type text not null,
  value numeric not null,
  unit text not null,
  recorded_at timestamptz not null,
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.wearable_devices enable row level security;
alter table public.user_devices enable row level security;
alter table public.wearable_data enable row level security;

drop trigger if exists set_user_devices_updated_at on public.user_devices;
create trigger set_user_devices_updated_at
before update on public.user_devices
for each row execute function public.set_updated_at();

drop policy if exists "Wearable devices readable" on public.wearable_devices;
create policy "Wearable devices readable"
on public.wearable_devices
for select
to authenticated
using (is_active = true);

drop policy if exists "Own user devices" on public.user_devices;
create policy "Own user devices"
on public.user_devices
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Own wearable data" on public.wearable_data;
create policy "Own wearable data"
on public.wearable_data
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

insert into public.wearable_devices (name, brand, type, supported_metrics, is_active)
select * from (
  values
    ('Apple Watch Series 9', 'Apple', 'watch', '{heart_rate,steps,sleep,spo2,stress}'::text[], true),
    ('Galaxy Watch 6', 'Samsung', 'watch', '{heart_rate,steps,sleep,spo2,stress}'::text[], true),
    ('Fitbit Charge 6', 'Fitbit', 'band', '{heart_rate,steps,sleep,calories}'::text[], true),
    ('Oura Ring Gen 3', 'Oura', 'ring', '{sleep,hrv,stress,heart_rate}'::text[], true)
) as seed(name, brand, type, supported_metrics, is_active)
where not exists (select 1 from public.wearable_devices);