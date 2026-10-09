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