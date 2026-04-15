create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  linked_user_id uuid references public.profiles(id),
  name text not null,
  relationship text not null,
  date_of_birth date,
  avatar_url text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.family_medications (
  id uuid primary key default gen_random_uuid(),
  family_member_id uuid not null references public.family_members(id) on delete cascade,
  name text not null,
  dosage text,
  frequency text,
  schedule_time text,
  start_date date,
  end_date date,
  prescribed_by text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.family_medication_logs (
  id uuid primary key default gen_random_uuid(),
  medication_id uuid not null references public.family_medications(id) on delete cascade,
  taken_at timestamptz not null,
  taken boolean not null default true,
  notes text,
  logged_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.supplements (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text,
  category text not null,
  description text,
  dosage_form text,
  serving_size text,
  ingredients jsonb,
  benefits text[] not null default '{}',
  warnings text,
  image_url text,
  price numeric(10,2),
  currency text not null default 'TRY',
  external_url text,
  affiliate_url text,
  rating numeric(3,2),
  review_count integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.supplement_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  supplement_id uuid not null references public.supplements(id) on delete cascade,
  reason text not null,
  priority text not null default 'medium',
  based_on jsonb,
  suggested_dosage text,
  duration text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.supplement_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  supplement_id uuid not null references public.supplements(id) on delete cascade,
  quantity integer not null default 1,
  total_price numeric(10,2),
  currency text not null default 'TRY',
  order_status text not null default 'pending',
  external_order_id text,
  ordered_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.family_members enable row level security;
alter table public.family_medications enable row level security;
alter table public.family_medication_logs enable row level security;
alter table public.supplements enable row level security;
alter table public.supplement_recommendations enable row level security;
alter table public.supplement_orders enable row level security;

drop trigger if exists set_family_members_updated_at on public.family_members;
create trigger set_family_members_updated_at
before update on public.family_members
for each row execute function public.set_updated_at();

drop trigger if exists set_family_medications_updated_at on public.family_medications;
create trigger set_family_medications_updated_at
before update on public.family_medications
for each row execute function public.set_updated_at();

drop trigger if exists set_supplement_recommendations_updated_at on public.supplement_recommendations;
create trigger set_supplement_recommendations_updated_at
before update on public.supplement_recommendations
for each row execute function public.set_updated_at();

drop policy if exists "Own family members" on public.family_members;
create policy "Own family members"
on public.family_members
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Own family medications via member" on public.family_medications;
create policy "Own family medications via member"
on public.family_medications
for all
to authenticated
using (
  exists (
    select 1
    from public.family_members fm
    where fm.id = family_member_id
      and fm.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.family_members fm
    where fm.id = family_member_id
      and fm.user_id = (select auth.uid())
  )
);

drop policy if exists "Own family medication logs via medication" on public.family_medication_logs;
create policy "Own family medication logs via medication"
on public.family_medication_logs
for all
to authenticated
using (
  exists (
    select 1
    from public.family_medications m
    join public.family_members fm on fm.id = m.family_member_id
    where m.id = medication_id
      and fm.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.family_medications m
    join public.family_members fm on fm.id = m.family_member_id
    where m.id = medication_id
      and fm.user_id = (select auth.uid())
  )
);

drop policy if exists "Supplements readable" on public.supplements;
create policy "Supplements readable"
on public.supplements
for select
to authenticated
using (is_active = true);

drop policy if exists "Own supplement recommendations" on public.supplement_recommendations;
create policy "Own supplement recommendations"
on public.supplement_recommendations
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Own supplement orders" on public.supplement_orders;
create policy "Own supplement orders"
on public.supplement_orders
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

insert into public.supplements (
  name,
  brand,
  category,
  description,
  dosage_form,
  serving_size,
  benefits,
  price,
  currency,
  rating,
  review_count,
  is_active
)
select * from (
  values
    ('Vitamin D3', 'Myora Labs', 'vitamin', 'Kemik ve bağışıklık desteği', 'softgel', '1000 IU', '{Kemik sağlığı,Bağışıklık desteği}'::text[], 249.90, 'TRY', 4.8, 124, true),
    ('Omega-3 Fish Oil', 'Myora Labs', 'omega', 'Kalp ve beyin desteği', 'softgel', '1000 mg', '{Kalp sağlığı,Beyin fonksiyonu}'::text[], 389.90, 'TRY', 4.7, 98, true),
    ('Magnesium Glycinate', 'Myora Labs', 'mineral', 'Kas ve uyku desteği', 'capsule', '200 mg', '{Kas fonksiyonu,Rahatlama,Uyku}'::text[], 319.90, 'TRY', 4.9, 76, true),
    ('Whey Protein', 'Myora Labs', 'protein', 'Günlük protein desteği', 'powder', '30 g', '{Kas gelişimi,Toparlanma}'::text[], 899.90, 'TRY', 4.6, 53, true)
) as seed_data(name, brand, category, description, dosage_form, serving_size, benefits, price, currency, rating, review_count, is_active)
where not exists (select 1 from public.supplements);