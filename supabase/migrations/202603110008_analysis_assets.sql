create table if not exists public.blood_tests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  test_date timestamptz not null,
  lab_name text,
  document_url text,
  ocr_extracted_text text,
  ai_summary text,
  overall_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blood_test_results (
  id uuid primary key default gen_random_uuid(),
  blood_test_id uuid not null references public.blood_tests(id) on delete cascade,
  marker_name text not null,
  value numeric(10,4) not null,
  unit text not null,
  reference_min numeric(10,4),
  reference_max numeric(10,4),
  status text,
  category text,
  ai_interpretation text,
  created_at timestamptz not null default now()
);

create table if not exists public.medical_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  photo_type text not null,
  image_url text not null,
  ai_analysis jsonb,
  confidence numeric(5,2),
  notes text,
  analyzed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.blood_tests enable row level security;
alter table public.blood_test_results enable row level security;
alter table public.medical_photos enable row level security;

drop trigger if exists set_blood_tests_updated_at on public.blood_tests;
create trigger set_blood_tests_updated_at
before update on public.blood_tests
for each row execute function public.set_updated_at();

drop policy if exists "Own blood tests" on public.blood_tests;
create policy "Own blood tests"
on public.blood_tests
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Own blood test results via test" on public.blood_test_results;
create policy "Own blood test results via test"
on public.blood_test_results
for all
to authenticated
using (
  exists (
    select 1 from public.blood_tests bt
    where bt.id = blood_test_id and bt.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.blood_tests bt
    where bt.id = blood_test_id and bt.user_id = (select auth.uid())
  )
);

drop policy if exists "Own medical photos" on public.medical_photos;
create policy "Own medical photos"
on public.medical_photos
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public)
values ('health-uploads', 'health-uploads', true)
on conflict (id) do nothing;

drop policy if exists "Health uploads readable" on storage.objects;
create policy "Health uploads readable"
on storage.objects
for select
to authenticated
using (bucket_id = 'health-uploads');

drop policy if exists "Health uploads writable" on storage.objects;
create policy "Health uploads writable"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'health-uploads'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Health uploads updatable" on storage.objects;
create policy "Health uploads updatable"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'health-uploads'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'health-uploads'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);