create table if not exists public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  topic text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  role text not null,
  content text not null,
  citations jsonb,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;

drop trigger if exists set_chat_conversations_updated_at on public.chat_conversations;
create trigger set_chat_conversations_updated_at
before update on public.chat_conversations
for each row execute function public.set_updated_at();

drop policy if exists "Own chat conversations" on public.chat_conversations;
create policy "Own chat conversations"
on public.chat_conversations
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Own chat messages via conversation" on public.chat_messages;
create policy "Own chat messages via conversation"
on public.chat_messages
for all
to authenticated
using (
  exists (
    select 1
    from public.chat_conversations c
    where c.id = conversation_id
      and c.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.chat_conversations c
    where c.id = conversation_id
      and c.user_id = (select auth.uid())
  )
);