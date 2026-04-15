-- ═══════════════════════════════════════════════════════════════════
-- RLS Audit Fix Migration — 2026-03-20
-- Eksik policy'leri tamamlar, mevcut yapıya dokunmaz.
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. profiles: DELETE policy (hesap silme senaryosu) ──────────
drop policy if exists "Users can delete own profile" on public.profiles;
create policy "Users can delete own profile"
on public.profiles
for delete
to authenticated
using ((select auth.uid()) = id);

-- ─── 2. Storage: health-uploads DELETE policy ────────────────────
-- Kullanıcı sadece kendi klasöründeki dosyaları silebilir
drop policy if exists "Health uploads deletable" on storage.objects;
create policy "Health uploads deletable"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'health-uploads'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

-- ─── 3. user_id NOT NULL doğrulaması ─────────────────────────────
-- Tüm RLS policy'si user_id'ye dayanan tablolarda NOT NULL olmalı.
-- Mevcut migration'larda zaten "not null" tanımlı, bu ALTER'lar
-- idempotent güvenlik katmanı olarak eklenir.
alter table public.daily_health_logs  alter column user_id set not null;
alter table public.food_entries       alter column user_id set not null;
alter table public.activity_entries   alter column user_id set not null;
alter table public.voice_entries      alter column user_id set not null;
alter table public.health_documents   alter column user_id set not null;
alter table public.user_achievements  alter column user_id set not null;
alter table public.user_streaks       alter column user_id set not null;
alter table public.user_goals         alter column user_id set not null;
alter table public.community_posts    alter column user_id set not null;
alter table public.community_comments alter column user_id set not null;
alter table public.community_likes    alter column user_id set not null;
alter table public.family_members     alter column user_id set not null;
alter table public.supplement_recommendations alter column user_id set not null;
alter table public.supplement_orders  alter column user_id set not null;
alter table public.health_profiles    alter column user_id set not null;
alter table public.chat_conversations alter column user_id set not null;
alter table public.blood_tests        alter column user_id set not null;
alter table public.medical_photos     alter column user_id set not null;
alter table public.user_devices       alter column user_id set not null;
alter table public.wearable_data      alter column user_id set not null;
alter table public.fasting_logs       alter column user_id set not null;
alter table public.rag_query_logs     alter column user_id set not null;

-- ─── 4. RLS durumunu doğrulamak için ─────────────────────────────
-- Bu sorgu migration çalıştıktan sonra SQL Editor'da kontrol edilir:
--
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
