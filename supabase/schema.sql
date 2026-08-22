-- ============================================================================
-- Innovation Club -- database schema
-- ============================================================================
-- Run this once, in full, in the Supabase SQL Editor (Project > SQL Editor >
-- New query) for a brand-new project. Written to be safe to re-run: every
-- statement uses IF NOT EXISTS / CREATE OR REPLACE / DROP ... IF EXISTS
-- wherever Postgres allows it.
--
-- AUTH MODEL
-- ----------
-- There is no traditional login system for the club itself:
--   * Admins unlock the control panel at /admin with a PIN, checked against
--     a bcrypt hash in `admin_credentials`. A correct PIN issues a random
--     session token (`admin_sessions`), which every admin write must present.
--   * Members log in at /member-login with admission_number + password,
--     checked by `member_login()`. A correct login issues a session token
--     (`member_sessions`) used by the member-portal RPCs below.
-- Neither of the above ever touches Supabase Auth (`auth.users`).
--
-- Supabase Auth IS used for a separate, third path: "Sign in with Google",
-- for site visitors who are not club members (e.g. to answer the Question
-- of the Day). Those sign-ins land in `public.users`, which has no
-- relationship to `public.profiles` at all -- a person can be a member, a
-- Google-authenticated visitor, both, or neither.
--
-- Every table has Row Level Security enabled. Public content (posts,
-- domains, the member directory, etc.) is readable by anyone; all writes to
-- admin-owned tables happen through SECURITY DEFINER functions that check a
-- session token themselves, not through RLS policies keyed on auth.uid().
-- ============================================================================

create extension if not exists "pgcrypto"; -- gen_random_uuid(), crypt(), gen_salt()

-- ============================================================================
-- Core content tables
-- ============================================================================

-- One row per club member.
create table if not exists public.profiles (
    id                uuid primary key default gen_random_uuid(),
    auth_user_id      uuid unique references auth.users (id) on delete set null,
    email             text unique,
    name              text not null,
    admission_number  text unique,
    role              text not null default 'Member' check (role in ('President', 'Core Team', 'Member')),
    is_admin          boolean not null default false,
    domain            text,
    skills            text,
    class             text,
    section           text,
    bio               text,
    avatar            text,
    github            text,
    linkedin          text,
    created_date      timestamptz not null default now(),
    updated_date      timestamptz not null default now()
);

create index if not exists profiles_admission_number_idx on public.profiles (admission_number);
create index if not exists profiles_auth_user_id_idx on public.profiles (auth_user_id);

create table if not exists public.domains (
    id           uuid primary key default gen_random_uuid(),
    name         text not null,
    slug         text not null unique,
    description  text,
    cover_image  text,
    created_date timestamptz not null default now(),
    updated_date timestamptz not null default now()
);

create table if not exists public.posts (
    id               uuid primary key default gen_random_uuid(),
    title            text not null,
    subtitle         text,
    slug             text not null unique,
    body             text not null,
    category         text default 'General',
    tags             text[] default '{}',
    cover_image      text,
    author           text,
    contributors     jsonb default '[]',
    links            text[] default '{}',
    tech_tip         text,
    tech_tip_author  text,
    read_time        numeric,
    featured         boolean not null default false,
    created_date     timestamptz not null default now(),
    updated_date     timestamptz not null default now()
);

create index if not exists posts_category_idx on public.posts (category);
create index if not exists posts_created_date_idx on public.posts (created_date desc);

create table if not exists public.comments (
    id           uuid primary key default gen_random_uuid(),
    post_id      uuid not null references public.posts (id) on delete cascade,
    author_name  text,
    body         text not null,
    created_date timestamptz not null default now()
);

create index if not exists comments_post_id_idx on public.comments (post_id);

create table if not exists public.likes (
    id           uuid primary key default gen_random_uuid(),
    post_id      uuid not null references public.posts (id) on delete cascade,
    anon_id      text not null,
    created_date timestamptz not null default now(),
    unique (post_id, anon_id)
);

create index if not exists likes_post_id_idx on public.likes (post_id);

create table if not exists public.galleries (
    id           uuid primary key default gen_random_uuid(),
    title        text not null,
    description  text,
    images       text[] not null default '{}',
    created_date timestamptz not null default now(),
    updated_date timestamptz not null default now()
);

-- A project's original creator plus any collaborators share equal edit
-- rights over it (see member_save_project() below).
create table if not exists public.projects (
    id                 uuid primary key default gen_random_uuid(),
    title              text not null,
    description        text,
    problem_statement  text,
    github_url         text not null,
    links              text[] default '{}',
    member_id          uuid references public.profiles (id) on delete set null,
    member_name        text,
    collaborator_ids   uuid[] not null default '{}',
    status             text not null default 'active' check (status in ('active', 'completed', 'paused')),
    created_date       timestamptz not null default now(),
    updated_date       timestamptz not null default now()
);

create index if not exists projects_member_id_idx on public.projects (member_id);
create index if not exists projects_collaborator_ids_idx on public.projects using gin (collaborator_ids);

create table if not exists public.project_updates (
    id           uuid primary key default gen_random_uuid(),
    project_id   uuid not null references public.projects (id) on delete cascade,
    body         text not null,
    images       text[] default '{}',
    member_name  text,
    created_date timestamptz not null default now()
);

create index if not exists project_updates_project_id_idx on public.project_updates (project_id);

-- Admin-issued announcements shown at the top of the member portal.
create table if not exists public.announcements (
    id           uuid primary key default gen_random_uuid(),
    title        text not null,
    body         text not null,
    pinned       boolean not null default false,
    expires_at   timestamptz,
    created_date timestamptz not null default now(),
    updated_date timestamptz not null default now()
);

create index if not exists announcements_created_date_idx on public.announcements (created_date desc);

-- ============================================================================
-- updated_date trigger helper
-- ============================================================================
create or replace function public.set_updated_date()
returns trigger language plpgsql as $$
begin
  new.updated_date = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['profiles','domains','posts','galleries','projects','announcements'] loop
    execute format('drop trigger if exists set_updated_date on public.%I;', t);
    execute format('create trigger set_updated_date before update on public.%I for each row execute function public.set_updated_date();', t);
  end loop;
end $$;

-- ============================================================================
-- Admin PIN login
-- ============================================================================
-- Single-row table holding the admin PIN hash. The `singleton` boolean
-- primary key (always `true`) guarantees at most one row ever exists. No RLS
-- policies are defined on purpose -- default-deny for anon/authenticated,
-- reachable only through the SECURITY DEFINER functions below.
create table if not exists public.admin_credentials (
    singleton    boolean primary key default true check (singleton),
    pin_hash     text not null,
    updated_date timestamptz not null default now()
);

alter table public.admin_credentials enable row level security;

create table if not exists public.admin_sessions (
    token        text primary key default encode(extensions.gen_random_bytes(32), 'hex'),
    created_date timestamptz not null default now(),
    expires_at   timestamptz not null default (now() + interval '12 hours')
);

alter table public.admin_sessions enable row level security;

create or replace function public.admin_resolve_token(p_token text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if p_token is null or not exists (
    select 1 from public.admin_sessions
    where token = p_token and expires_at > now()
  ) then
    raise exception 'Admin session expired -- please enter the PIN again';
  end if;
end;
$$;

-- admin_login: the only entry point for the admin console.
--   * No PIN has been set yet -> raises (set one first, see the note at the
--     bottom of this file)
--   * Wrong PIN                -> raises "Incorrect PIN"
--   * Correct PIN              -> returns a fresh session token
create or replace function public.admin_login(p_pin text)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  cred      public.admin_credentials;
  new_token text;
begin
  select * into cred from public.admin_credentials where singleton = true;
  if cred.singleton is null then
    raise exception 'No admin PIN has been set yet';
  end if;

  if p_pin is null or p_pin = '' or cred.pin_hash <> crypt(p_pin, cred.pin_hash) then
    raise exception 'Incorrect PIN';
  end if;

  delete from public.admin_sessions where expires_at <= now();

  insert into public.admin_sessions default values returning token into new_token;
  return new_token;
end;
$$;

create or replace function public.admin_logout(p_token text)
returns void
language sql
security definer
set search_path = public, extensions
as $$
  delete from public.admin_sessions where token = p_token;
$$;

-- admin_write: generic create/update for the admin-only tables, used by
-- src/api/dataClient.js so every admin form goes through one narrow, audited
-- path. p_table is checked against a fixed whitelist and only ever
-- interpolated via quote_ident/format(%I), so it can't be used for SQL
-- injection. p_id = null means insert.
create or replace function public.admin_write(p_token text, p_table text, p_id uuid, p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  allowed  text[] := array['posts', 'domains', 'galleries', 'profiles', 'announcements'];
  col_list text;
  sql      text;
  result   jsonb;
begin
  perform public.admin_resolve_token(p_token);

  if not (p_table = any(allowed)) then
    raise exception 'Table not allowed: %', p_table;
  end if;
  if p_payload is null or p_payload = '{}'::jsonb then
    raise exception 'Empty payload';
  end if;

  select string_agg(quote_ident(k), ', ') into col_list from jsonb_object_keys(p_payload) as k;

  if p_id is null then
    sql := format(
      'insert into public.%I (%s) select %s from jsonb_populate_record(null::public.%I, $1) returning to_jsonb(%I.*)',
      p_table, col_list, col_list, p_table, p_table
    );
    execute sql into result using p_payload;
  else
    sql := format(
      'update public.%I t set (%s) = (select %s from jsonb_populate_record(null::public.%I, $1)) where t.id = $2 returning to_jsonb(t.*)',
      p_table, col_list, col_list, p_table
    );
    execute sql into result using p_payload, p_id;
    if result is null then
      raise exception 'Row not found';
    end if;
  end if;

  return result;
end;
$$;

-- admin_delete_row: generic delete for the write whitelist plus the two
-- tables where only *deletion* (not insert/update) is admin-gated.
create or replace function public.admin_delete_row(p_token text, p_table text, p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  allowed text[] := array['posts', 'domains', 'galleries', 'profiles', 'comments', 'project_updates', 'announcements'];
begin
  perform public.admin_resolve_token(p_token);

  if not (p_table = any(allowed)) then
    raise exception 'Table not allowed: %', p_table;
  end if;

  execute format('delete from public.%I where id = $1', p_table) using p_id;
  return true;
end;
$$;

-- ============================================================================
-- Member portal login (admission number + password)
-- ============================================================================
-- Password hash lives in its own table, not on profiles, so a plain
-- `select('*')` on profiles never risks leaking it. No RLS policies are
-- defined for this table on purpose -- default-deny for anon/authenticated,
-- reachable only through the SECURITY DEFINER functions below.
create table if not exists public.member_credentials (
    profile_id    uuid primary key references public.profiles (id) on delete cascade,
    password_hash text not null,
    updated_date  timestamptz not null default now()
);

alter table public.member_credentials enable row level security;

-- Session tokens, issued on successful login, checked on every member write.
create table if not exists public.member_sessions (
    token        text primary key default encode(extensions.gen_random_bytes(32), 'hex'),
    profile_id   uuid not null references public.profiles (id) on delete cascade,
    created_date timestamptz not null default now(),
    expires_at   timestamptz not null default (now() + interval '30 days')
);

create index if not exists member_sessions_profile_id_idx on public.member_sessions (profile_id);

alter table public.member_sessions enable row level security;

create or replace function public.member_resolve_token(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  pid uuid;
begin
  select profile_id into pid
    from public.member_sessions
    where token = p_token and expires_at > now();
  if pid is null then
    raise exception 'Session expired -- please log in again';
  end if;
  return pid;
end;
$$;

-- member_login: the only entry point for the member portal.
--   * Unknown admission number            -> raises
--   * Known, no password set yet, blank pw -> returns row with needs_password
--     = true and no token (UI shows "set a password" screen)
--   * Known, no password set yet, pw given -> sets that as the password,
--     logs the member in, returns a session token
--   * Known, password set, blank pw       -> raises "Password required"
--   * Known, password set, wrong pw       -> raises "Incorrect password"
--   * Known, password set, correct pw     -> returns a session token
create or replace function public.member_login(p_admission_number text, p_password text)
returns table (
    id                uuid,
    name              text,
    role              text,
    domain            text,
    admission_number  text,
    needs_password    boolean,
    token             text
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  prof     public.profiles;
  cred     public.member_credentials;
  new_token text;
begin
  select * into prof from public.profiles p where p.admission_number = trim(p_admission_number);
  if prof.id is null then
    raise exception 'No member found with that admission number';
  end if;

  select * into cred from public.member_credentials where profile_id = prof.id;

  if cred.profile_id is null then
    if p_password is null or p_password = '' then
      return query select prof.id, prof.name, prof.role, prof.domain, prof.admission_number, true, null::text;
      return;
    end if;

    insert into public.member_credentials (profile_id, password_hash)
    values (prof.id, crypt(p_password, gen_salt('bf')));
  else
    if p_password is null or p_password = '' then
      raise exception 'Password required';
    end if;
    if cred.password_hash <> crypt(p_password, cred.password_hash) then
      raise exception 'Incorrect password';
    end if;
  end if;

  insert into public.member_sessions as ms (profile_id) values (prof.id)
    returning ms.token into new_token;

  return query select prof.id, prof.name, prof.role, prof.domain, prof.admission_number, false, new_token;
end;
$$;

-- member_update_profile: self-service edits from the portal (My Details form).
create or replace function public.member_update_profile(p_token text, p_patch jsonb)
returns setof public.profiles
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  pid uuid;
begin
  pid := public.member_resolve_token(p_token);

  return query
    update public.profiles set
      class    = coalesce(p_patch->>'class', class),
      section  = coalesce(p_patch->>'section', section),
      domain   = coalesce(p_patch->>'domain', domain),
      skills   = coalesce(p_patch->>'skills', skills),
      bio      = coalesce(p_patch->>'bio', bio),
      github   = coalesce(p_patch->>'github', github),
      linkedin = coalesce(p_patch->>'linkedin', linkedin),
      avatar   = coalesce(p_patch->>'avatar', avatar)
    where id = pid
    returning *;
end;
$$;

-- member_save_project: create (p_project_id null) or update a project from
-- the portal's "Active Projects" section. The owner and any collaborator
-- have equal edit rights; only the owner or an existing collaborator may
-- change who the collaborators are (so a non-collaborator can't add
-- themselves).
create or replace function public.member_save_project(
    p_token             text,
    p_project_id        uuid,
    p_title             text,
    p_description       text,
    p_problem_statement text,
    p_github_url        text,
    p_links             text[],
    p_status            text,
    p_collaborator_ids  uuid[] default null
)
returns setof public.projects
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  pid   uuid;
  pname text;
  has_charge boolean;
begin
  pid := public.member_resolve_token(p_token);
  select name into pname from public.profiles where id = pid;

  if p_project_id is not null then
    select exists(
      select 1 from public.projects
      where id = p_project_id and (member_id = pid or pid = any(collaborator_ids))
    ) into has_charge;
    if not has_charge then
      raise exception 'Not authorized to edit this project';
    end if;

    return query
      update public.projects set
        title             = p_title,
        description       = p_description,
        problem_statement = p_problem_statement,
        github_url        = p_github_url,
        links             = coalesce(p_links, links),
        status            = coalesce(p_status, status),
        collaborator_ids  = coalesce(p_collaborator_ids, collaborator_ids)
      where id = p_project_id
      returning *;
  else
    return query
      insert into public.projects (title, description, problem_statement, github_url, links, status, member_id, member_name, collaborator_ids)
      values (p_title, p_description, p_problem_statement, p_github_url, coalesce(p_links, '{}'), coalesce(p_status, 'active'), pid, pname, coalesce(p_collaborator_ids, '{}'))
      returning *;
  end if;
end;
$$;

-- member_create_project_update: post a progress update on a project. Any
-- collaborator can post updates, same as the owner.
create or replace function public.member_create_project_update(
    p_token      text,
    p_project_id uuid,
    p_body       text,
    p_images     text[]
)
returns setof public.project_updates
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  pid   uuid;
  pname text;
  has_charge boolean;
begin
  pid := public.member_resolve_token(p_token);
  select name into pname from public.profiles where id = pid;

  select exists(
    select 1 from public.projects
    where id = p_project_id and (member_id = pid or pid = any(collaborator_ids))
  ) into has_charge;
  if not has_charge then
    raise exception 'Not authorized to post updates on this project';
  end if;

  return query
    insert into public.project_updates (project_id, body, images, member_name)
    values (p_project_id, p_body, coalesce(p_images, '{}'), pname)
    returning *;
end;
$$;

create or replace function public.member_logout(p_token text)
returns void
language sql
security definer
set search_path = public, extensions
as $$
  delete from public.member_sessions where token = p_token;
$$;

-- ============================================================================
-- Google sign-in for non-members
-- ============================================================================
-- A separate, optional path for site visitors who are not club members --
-- e.g. to answer the Question of the Day. Real Supabase Auth (auth.users),
-- but intentionally kept out of public.profiles entirely: a Google sign-in
-- creates a row in public.users only, never public.profiles.
create table if not exists public.users (
    id            uuid primary key references auth.users (id) on delete cascade,
    email         text,
    name          text,
    avatar_url    text,
    provider      text,
    created_date  timestamptz not null default now(),
    last_login    timestamptz not null default now()
);

alter table public.users enable row level security;

drop policy if exists "users_select_own_or_admin" on public.users;
create policy "users_select_own_or_admin" on public.users for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own" on public.users for update
  using (id = auth.uid());

-- On first sign-in (Google or GitHub), create the public.users row. On every
-- sign-in (first or not), bump last_login. Name fallback chain differs by
-- provider: Google gives full_name/name; GitHub often has no public "name"
-- on the account at all, only the user_name (handle) -- tried before finally
-- falling back to the email's local part.
create or replace function public.handle_new_oauth_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, name, avatar_url, provider)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'user_name',
      split_part(new.email, '@', 1)
    ),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    coalesce(new.raw_app_meta_data->>'provider', 'unknown')
  )
  on conflict (id) do update set
    last_login = now(),
    email      = excluded.email,
    name       = coalesce(excluded.name, public.users.name),
    avatar_url = coalesce(excluded.avatar_url, public.users.avatar_url);
  return new;
end;
$$;

drop trigger if exists on_oauth_user_created on auth.users;
create trigger on_oauth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_oauth_user();

-- Supabase re-issues a new auth.users row only on first signup; every
-- subsequent Google login just re-authenticates the existing row and fires
-- no insert trigger. Call this from the client right after getSession() so
-- last_login stays accurate.
create or replace function public.oauth_touch_login()
returns void language sql security definer as $$
  update public.users set last_login = now() where id = auth.uid();
$$;

grant execute on function public.oauth_touch_login() to authenticated;

-- ============================================================================
-- Question of the Day
-- ============================================================================
-- A new question is generated once a day by the generate-qotd Edge Function
-- (see supabase/functions/generate-qotd) using OpenRouter -- setup
-- instructions are in SETUP.md. Anyone can read today's question. Responding
-- requires either a Google sign-in (public.users) or a logged-in member
-- (public.profiles) -- both are supported so members don't need a second
-- account just to answer.
create table if not exists public.qotd (
    id           uuid primary key default gen_random_uuid(),
    qdate        date not null unique,          -- the IST calendar date this question is "for"
    question     text not null,
    category     text,
    fun_fact     text,                          -- optional short answer/context, revealed after responding
    model        text not null default 'openai/gpt-4o-mini',
    created_date timestamptz not null default now()
);

create index if not exists qotd_qdate_idx on public.qotd (qdate desc);

create table if not exists public.qotd_responses (
    id            uuid primary key default gen_random_uuid(),
    qotd_id       uuid not null references public.qotd (id) on delete cascade,
    user_id       uuid references public.users (id) on delete cascade,
    profile_id    uuid references public.profiles (id) on delete cascade,
    display_name  text not null,
    response      text not null,
    created_date  timestamptz not null default now(),
    constraint qotd_response_one_author check (
        (user_id is not null and profile_id is null) or
        (user_id is null and profile_id is not null)
    )
);

create index if not exists qotd_responses_qotd_id_idx on public.qotd_responses (qotd_id);
-- One response per Google-authenticated visitor per question, and one per member per question.
create unique index if not exists qotd_responses_unique_user on public.qotd_responses (qotd_id, user_id) where user_id is not null;
create unique index if not exists qotd_responses_unique_profile on public.qotd_responses (qotd_id, profile_id) where profile_id is not null;

alter table public.qotd enable row level security;
alter table public.qotd_responses enable row level security;

drop policy if exists "qotd_select_all" on public.qotd;
create policy "qotd_select_all" on public.qotd for select using (true);
-- Writes to qotd only ever happen from the generate-qotd Edge Function,
-- which uses the service role key and bypasses RLS entirely -- no
-- insert/update policy is needed (or wanted) for anon/authenticated here.

drop policy if exists "qotd_responses_select_all" on public.qotd_responses;
create policy "qotd_responses_select_all" on public.qotd_responses for select using (true);

-- Google-authenticated visitors: insert only as themselves.
drop policy if exists "qotd_responses_insert_oauth" on public.qotd_responses;
create policy "qotd_responses_insert_oauth" on public.qotd_responses for insert
  to authenticated
  with check (user_id = auth.uid() and profile_id is null);

-- Members don't have a Supabase Auth session, so their inserts go through
-- this SECURITY DEFINER RPC instead, the same pattern as member_login().
create or replace function public.member_submit_qotd_response(
    p_token    text,
    p_qotd_id  uuid,
    p_response text
)
returns setof public.qotd_responses
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  pid   uuid;
  pname text;
begin
  pid := public.member_resolve_token(p_token);
  select name into pname from public.profiles where id = pid;

  return query
    insert into public.qotd_responses (qotd_id, profile_id, display_name, response)
    values (p_qotd_id, pid, pname, p_response)
    on conflict (qotd_id, profile_id) do update set response = excluded.response
    returning *;
end;
$$;

grant execute on function public.member_submit_qotd_response(text, uuid, text) to anon, authenticated;

-- ============================================================================
-- Shared helpers used by RLS policies below
-- ============================================================================
create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.profiles
    where auth_user_id = auth.uid() and is_admin = true
  );
$$;

create or replace function public.current_profile_id()
returns uuid language sql stable security definer as $$
  select id from public.profiles where auth_user_id = auth.uid();
$$;

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.domains enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.galleries enable row level security;
alter table public.projects enable row level security;
alter table public.project_updates enable row level security;
alter table public.announcements enable row level security;

-- profiles: publicly readable (member directory). All writes go through the
-- admin_write()/admin_delete_row() RPCs above, so no direct write policy is
-- granted here.
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles for select using (true);

-- domains: public read.
drop policy if exists "domains_select_all" on public.domains;
create policy "domains_select_all" on public.domains for select using (true);

-- posts: public read.
drop policy if exists "posts_select_all" on public.posts;
create policy "posts_select_all" on public.posts for select using (true);

-- comments: public read + public insert (no login needed to comment),
-- deletion goes through admin_delete_row().
drop policy if exists "comments_select_all" on public.comments;
create policy "comments_select_all" on public.comments for select using (true);
drop policy if exists "comments_insert_all" on public.comments;
create policy "comments_insert_all" on public.comments for insert with check (true);

-- likes: public read + public insert/delete (anonymous like-toggling).
drop policy if exists "likes_select_all" on public.likes;
create policy "likes_select_all" on public.likes for select using (true);
drop policy if exists "likes_insert_all" on public.likes;
create policy "likes_insert_all" on public.likes for insert with check (true);
drop policy if exists "likes_delete_all" on public.likes;
create policy "likes_delete_all" on public.likes for delete using (true);

-- galleries: public read.
drop policy if exists "galleries_select_all" on public.galleries;
create policy "galleries_select_all" on public.galleries for select using (true);

-- projects: public read. Member writes go through member_save_project(),
-- which checks ownership/collaborator status itself and bypasses RLS
-- (SECURITY DEFINER) -- no direct write policy is needed for the normal
-- member flow.
drop policy if exists "projects_select_all" on public.projects;
create policy "projects_select_all" on public.projects for select using (true);

-- project_updates: public read. Member writes go through
-- member_create_project_update(), same pattern as projects above.
drop policy if exists "project_updates_select_all" on public.project_updates;
create policy "project_updates_select_all" on public.project_updates for select using (true);

-- announcements: public read (only ever surfaced inside the member portal
-- UI). Writes go through admin_write()/admin_delete_row().
drop policy if exists "announcements_select_all" on public.announcements;
create policy "announcements_select_all" on public.announcements for select using (true);

-- ============================================================================
-- Storage bucket for uploads (gallery images, avatars, post covers, project
-- update images, etc.)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

drop policy if exists "uploads_public_read" on storage.objects;
create policy "uploads_public_read" on storage.objects for select
  using (bucket_id = 'uploads');

-- No per-row ownership model for uploaded files in this app (admin and
-- members both upload through the same bucket), so writes are open at the
-- bucket level rather than gated on a Supabase Auth session that most
-- writers (admin PIN, member password) never have.
drop policy if exists "uploads_write" on storage.objects;
create policy "uploads_write" on storage.objects for insert
  with check (bucket_id = 'uploads');

drop policy if exists "uploads_update" on storage.objects;
create policy "uploads_update" on storage.objects for update
  using (bucket_id = 'uploads');

drop policy if exists "uploads_delete" on storage.objects;
create policy "uploads_delete" on storage.objects for delete
  using (bucket_id = 'uploads');

-- ============================================================================
-- Grants
-- ============================================================================
-- A fresh Supabase project grants these by default, but if a lockdown
-- script (`revoke all on schema public from public`, etc.) has ever been run
-- against this project, anon/authenticated/service_role lose the ability to
-- even reach the `public` schema -- which breaks everything above regardless
-- of the function-level grants below. Re-asserting these here costs nothing
-- on a project where they're already in place.
grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
alter default privileges in schema public grant select, insert, update, delete on tables to anon, authenticated;
alter default privileges in schema public grant usage, select on sequences to anon, authenticated;

grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all functions in schema public to service_role;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant all on functions to service_role;

revoke all on public.admin_credentials from anon, authenticated;
revoke all on public.admin_sessions from anon, authenticated;
revoke all on public.member_credentials from anon, authenticated;
revoke all on public.member_sessions from anon, authenticated;

grant execute on function public.admin_login(text) to anon, authenticated;
grant execute on function public.admin_logout(text) to anon, authenticated;
grant execute on function public.admin_write(text, text, uuid, jsonb) to anon, authenticated;
grant execute on function public.admin_delete_row(text, text, uuid) to anon, authenticated;

grant execute on function public.member_login(text, text) to anon, authenticated;
grant execute on function public.member_update_profile(text, jsonb) to anon, authenticated;
grant execute on function public.member_save_project(text, uuid, text, text, text, text, text[], text, uuid[]) to anon, authenticated;
grant execute on function public.member_create_project_update(text, uuid, text, text[]) to anon, authenticated;
grant execute on function public.member_logout(text) to anon, authenticated;

notify pgrst, 'reload schema';

-- ============================================================================
-- ONE-TIME SETUP: set the admin PIN
-- ------------------------------------------------------------------------
-- Nothing above sets an initial PIN on purpose. Pick one and run this once,
-- replacing YOUR-PIN-HERE, then never run it again with the same PIN in it:
--
--   insert into public.admin_credentials (singleton, pin_hash)
--   values (true, crypt('YOUR-PIN-HERE', gen_salt('bf')))
--   on conflict (singleton) do update set pin_hash = excluded.pin_hash,
--     updated_date = now();
--
-- To change the PIN later, re-run the same statement with a new value.
-- ============================================================================
