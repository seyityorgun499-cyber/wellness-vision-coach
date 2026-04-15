-- Enable pgvector extension for embedding-based retrieval
create extension if not exists vector with schema extensions;

-- Scientific source metadata (parent table for chunks)
create table if not exists public.scientific_sources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  authors text[] default '{}',
  journal text,
  published_year integer,
  doi text,
  abstract text,
  full_text text,
  category text,
  tags text[] default '{}',
  language text default 'tr',
  is_verified boolean default false,
  created_at timestamptz not null default now()
);

-- Chunked content with vector embeddings for RAG retrieval
create table if not exists public.scientific_source_chunks (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.scientific_sources(id) on delete cascade,
  chunk_index integer not null default 0,
  section text,
  content text not null,
  token_count integer,
  embedding extensions.vector(1536),
  keywords text[] default '{}',
  language text default 'tr',
  created_at timestamptz not null default now()
);

-- RAG query logs for observability and tuning
create table if not exists public.rag_query_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  conversation_id uuid references public.chat_conversations(id) on delete set null,
  message_id uuid references public.chat_messages(id) on delete set null,
  query text not null,
  topic text,
  retrieved_chunk_ids uuid[] default '{}',
  similarity_scores numeric[] default '{}',
  context_blocks_used text[] default '{}',
  model text,
  latency_ms integer,
  created_at timestamptz not null default now()
);

-- Indexes for retrieval performance
create index if not exists idx_chunks_source on public.scientific_source_chunks(source_id);
create index if not exists idx_chunks_embedding on public.scientific_source_chunks
  using ivfflat (embedding extensions.vector_cosine_ops) with (lists = 50);
create index if not exists idx_sources_category on public.scientific_sources(category);
create index if not exists idx_sources_verified on public.scientific_sources(is_verified);
create index if not exists idx_rag_logs_user on public.rag_query_logs(user_id);

-- RLS policies
alter table public.scientific_sources enable row level security;
alter table public.scientific_source_chunks enable row level security;
alter table public.rag_query_logs enable row level security;

-- Scientific sources are readable by all authenticated users (shared knowledge base)
drop policy if exists "Scientific sources readable" on public.scientific_sources;
create policy "Scientific sources readable"
on public.scientific_sources
for select
to authenticated
using (true);

-- Chunks are readable by all authenticated users
drop policy if exists "Chunks readable" on public.scientific_source_chunks;
create policy "Chunks readable"
on public.scientific_source_chunks
for select
to authenticated
using (true);

-- RAG logs are owned by each user
drop policy if exists "Own rag logs" on public.rag_query_logs;
create policy "Own rag logs"
on public.rag_query_logs
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- Allow service_role full access for ingestion scripts
drop policy if exists "Service role sources" on public.scientific_sources;
create policy "Service role sources"
on public.scientific_sources
for all
to service_role
using (true)
with check (true);

drop policy if exists "Service role chunks" on public.scientific_source_chunks;
create policy "Service role chunks"
on public.scientific_source_chunks
for all
to service_role
using (true)
with check (true);

-- Match function for vector similarity search (called from edge functions)
create or replace function public.match_source_chunks(
  query_embedding extensions.vector(1536),
  match_threshold float default 0.5,
  match_count int default 8,
  filter_category text default null,
  filter_language text default null,
  filter_verified boolean default null
)
returns table (
  id uuid,
  source_id uuid,
  chunk_index integer,
  section text,
  content text,
  token_count integer,
  similarity float,
  source_title text,
  source_authors text[],
  source_journal text,
  source_year integer,
  source_category text
)
language plpgsql
as $$
begin
  return query
  select
    c.id,
    c.source_id,
    c.chunk_index,
    c.section,
    c.content,
    c.token_count,
    1 - (c.embedding <=> query_embedding) as similarity,
    s.title as source_title,
    s.authors as source_authors,
    s.journal as source_journal,
    s.published_year as source_year,
    s.category as source_category
  from public.scientific_source_chunks c
  join public.scientific_sources s on s.id = c.source_id
  where 1 - (c.embedding <=> query_embedding) > match_threshold
    and (filter_category is null or s.category = filter_category)
    and (filter_language is null or c.language = filter_language)
    and (filter_verified is null or s.is_verified = filter_verified)
  order by c.embedding <=> query_embedding
  limit match_count;
end;
$$;
