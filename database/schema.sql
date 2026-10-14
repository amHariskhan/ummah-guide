-- =========================================
-- 1. TABLES
-- =========================================

-- Everyone who signs up
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'user' check (role in ('user', 'scholar', 'admin')),
  created_at timestamptz not null default now()
);

-- Extra details for scholars
create table public.scholar_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  specialty text,
  qualification text,
  experience_years int,
  bio text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

-- Questions from users to scholars
create table public.questions (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  scholar_id uuid not null references public.scholar_profiles(id) on delete cascade,
  title text not null,
  body text not null,
  answer text,
  status text not null default 'pending' check (status in ('pending', 'answered')),
  created_at timestamptz not null default now(),
  answered_at timestamptz
);

-- =========================================
-- 2. HELPER: check if current user is admin
-- =========================================
create function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- =========================================
-- 3. AUTO-CREATE PROFILE WHEN SOMEONE SIGNS UP
-- (role can only be 'user' or 'scholar', never 'admin')
-- =========================================
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    case when new.raw_user_meta_data->>'role' = 'scholar' then 'scholar' else 'user' end
  );

  if new.raw_user_meta_data->>'role' = 'scholar' then
    insert into public.scholar_profiles (id) values (new.id);
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================
-- 4. SECURITY RULES (Row Level Security)
-- =========================================
alter table public.profiles enable row level security;
alter table public.scholar_profiles enable row level security;
alter table public.questions enable row level security;

-- Profiles: you see your own; admin sees all; everyone sees approved scholars' names
create policy "View profiles"
  on public.profiles for select
  using (
    auth.uid() = id
    or public.is_admin()
    or exists (
      select 1 from public.scholar_profiles s
      where s.id = profiles.id and s.status = 'approved'
    )
  );

-- Scholar details: public if approved; scholar sees own; admin sees all
create policy "View scholar profiles"
  on public.scholar_profiles for select
  using (status = 'approved' or auth.uid() = id or public.is_admin());

-- Questions: only the asker, the scholar, and admin can see
create policy "View own questions"
  on public.questions for select
  using (auth.uid() = user_id or auth.uid() = scholar_id or public.is_admin());

-- Questions: logged-in users can ask approved scholars only
create policy "Ask a question"
  on public.questions for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.scholar_profiles s
      where s.id = scholar_id and s.status = 'approved'
    )
  );
  create policy "Users can read own profile"
on profiles
for select
using (auth.uid() = id);
-- Remove old versions first (safe even if they don't exist)
drop policy if exists "Scholars can view own scholar profile" on scholar_profiles;
drop policy if exists "Scholars can create own scholar profile" on scholar_profiles;
drop policy if exists "Scholars can update own scholar profile" on scholar_profiles;

-- 1. Scholar can see their own profile (even when pending)
create policy "Scholars can view own scholar profile"
on scholar_profiles for select
using (auth.uid() = id);

-- 2. Scholar can create their own profile (only as pending)
create policy "Scholars can create own scholar profile"
on scholar_profiles for insert
with check (
  auth.uid() = id
  and status = 'pending'
  and exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.role = 'scholar'
  )
);

-- 3. Scholar can edit their own profile (goes back to pending)
create policy "Scholars can update own scholar profile"
on scholar_profiles for update
using (auth.uid() = id)
with check (auth.uid() = id and status = 'pending');
drop policy if exists "Public can view approved scholar names" on profiles;

create policy "Public can view approved scholar names"
on profiles for select
using (
  exists (
    select 1 from scholar_profiles sp
    where sp.id = profiles.id
      and sp.status = 'approved'
  )
);
-- ===== 1. Extra columns on questions =====
alter table questions add column if not exists created_at timestamptz not null default now();
alter table questions add column if not exists last_message_at timestamptz not null default now();
alter table questions add column if not exists answered_at timestamptz;

-- ===== 2. Messages table =====
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  question_id bigint not null references questions(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 3000),
  created_at timestamptz not null default now()
);

create index if not exists messages_question_created_idx on messages (question_id, created_at);
create index if not exists questions_user_idx on questions (user_id, last_message_at desc);
create index if not exists questions_scholar_idx on questions (scholar_id, last_message_at desc);

alter table messages enable row level security;

-- ===== 3. Helper: is the current user part of this conversation? =====
create or replace function public.is_question_participant(qid bigint)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.questions q
    where q.id = qid
      and (q.user_id = auth.uid() or q.scholar_id = auth.uid())
  );
$$;

-- ===== 4. Message rules =====
drop policy if exists "Participants and admin can read messages" on messages;
create policy "Participants and admin can read messages"
on messages for select
using (public.is_question_participant(question_id) or public.is_admin());

drop policy if exists "Participants can send messages" on messages;
create policy "Participants can send messages"
on messages for insert
with check (
  sender_id = auth.uid()
  and public.is_question_participant(question_id)
);

-- ===== 5. Automations (triggers) =====
create or replace function public.handle_new_question()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.messages (question_id, sender_id, body, created_at)
  values (new.id, new.user_id, new.body, new.created_at);
  return new;
end;
$$;

drop trigger if exists on_question_created on questions;
create trigger on_question_created
after insert on questions
for each row execute function public.handle_new_question();

create or replace function public.handle_new_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.questions
  set last_message_at = new.created_at
  where id = new.question_id;
  return new;
end;
$$;

drop trigger if exists on_message_created on messages;
create trigger on_message_created
after insert on messages
for each row execute function public.handle_new_message();

-- Existing questions get their first message too
insert into messages (question_id, sender_id, body, created_at)
select q.id, q.user_id, q.body, q.created_at
from questions q
where not exists (select 1 from messages m where m.question_id = q.id);

-- ===== 6. Scholar can mark a conversation as answered =====
drop policy if exists "Scholars can answer their questions" on questions;
drop policy if exists "Scholars can update status of their questions" on questions;
create policy "Scholars can update status of their questions"
on questions for update
using (auth.uid() = scholar_id)
with check (auth.uid() = scholar_id and status in ('pending', 'answered'));

revoke update on questions from authenticated;
grant update (status, answered_at) on questions to authenticated;

-- ===== 7. Turn on Realtime (live messages) =====
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
-- ===== 1. Chat partners can see each other's names =====
create or replace function public.shares_conversation_with(other uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.questions q
    where (q.user_id = auth.uid() and q.scholar_id = other)
       or (q.scholar_id = auth.uid() and q.user_id = other)
  );
$$;

drop policy if exists "Chat partners can view each other" on profiles;
create policy "Chat partners can view each other"
on profiles for select
using (public.shares_conversation_with(id));

-- ===== 2. Last message preview on each conversation =====
alter table questions add column if not exists last_message_preview text;
alter table questions add column if not exists last_sender_id uuid;

-- Update the trigger so every new message also saves the preview
create or replace function public.handle_new_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.questions
  set last_message_at = new.created_at,
      last_message_preview = left(new.body, 100),
      last_sender_id = new.sender_id
  where id = new.question_id;
  return new;
end;
$$;

-- Fill the preview for conversations that already exist
update questions q
set last_message_preview = left(m.body, 100),
    last_sender_id = m.sender_id,
    last_message_at = m.created_at
from (
  select distinct on (question_id) question_id, body, sender_id, created_at
  from messages
  order by question_id, created_at desc
) m
where m.question_id = q.id;