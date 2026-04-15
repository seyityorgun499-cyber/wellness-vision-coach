create table if not exists public.user_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_type text not null,
  title text not null,
  description text,
  target_value numeric(10, 2),
  current_value numeric(10, 2),
  unit text,
  start_date date,
  target_date date,
  status text default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  content text not null,
  category text,
  image_url text,
  like_count integer default 0,
  comment_count integer default 0,
  is_published boolean default true,
  is_pinned boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.community_comments(id) on delete cascade,
  content text not null,
  like_count integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid references public.community_posts(id) on delete cascade,
  comment_id uuid references public.community_comments(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint community_likes_target_check check (
    (post_id is not null and comment_id is null) or
    (post_id is null and comment_id is not null)
  ),
  unique(user_id, post_id),
  unique(user_id, comment_id)
);

alter table public.user_goals enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;
alter table public.community_likes enable row level security;

drop trigger if exists set_user_goals_updated_at on public.user_goals;
create trigger set_user_goals_updated_at
before update on public.user_goals
for each row execute function public.set_updated_at();

drop trigger if exists set_community_posts_updated_at on public.community_posts;
create trigger set_community_posts_updated_at
before update on public.community_posts
for each row execute function public.set_updated_at();

drop trigger if exists set_community_comments_updated_at on public.community_comments;
create trigger set_community_comments_updated_at
before update on public.community_comments
for each row execute function public.set_updated_at();

drop policy if exists "Own goals" on public.user_goals;
create policy "Own goals"
on public.user_goals
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Published community posts are readable" on public.community_posts;
create policy "Published community posts are readable"
on public.community_posts
for select
to authenticated
using (is_published = true);

drop policy if exists "Users can create own posts" on public.community_posts;
create policy "Users can create own posts"
on public.community_posts
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own posts" on public.community_posts;
create policy "Users can update own posts"
on public.community_posts
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own posts" on public.community_posts;
create policy "Users can delete own posts"
on public.community_posts
for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Community comments are readable" on public.community_comments;
create policy "Community comments are readable"
on public.community_comments
for select
to authenticated
using (true);

drop policy if exists "Users can create own comments" on public.community_comments;
create policy "Users can create own comments"
on public.community_comments
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own comments" on public.community_comments;
create policy "Users can update own comments"
on public.community_comments
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own comments" on public.community_comments;
create policy "Users can delete own comments"
on public.community_comments
for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can manage own likes" on public.community_likes;
create policy "Users can manage own likes"
on public.community_likes
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);