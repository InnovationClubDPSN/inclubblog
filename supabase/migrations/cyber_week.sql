-- ============================================================================
-- Cyber Awareness Week -- migration (safe to re-run)
-- Run this whole file once in Supabase: SQL Editor > New query > Run.
-- It only adds Cyber Week pieces and updates three admin functions to know
-- about them. It does not touch any other data.
-- ============================================================================

-- Brochures and posters admins upload (PDF or image), grouped by posted_on day.
create table if not exists public.cyber_week_items (
    id           uuid primary key default gen_random_uuid(),
    title        text not null,
    kind         text not null default 'poster' check (kind in ('brochure', 'poster')),
    file_url     text not null,
    file_type    text not null default 'image' check (file_type in ('pdf', 'image')),
    description  text,
    posted_on    date not null default current_date,
    created_date timestamptz not null default now(),
    updated_date timestamptz not null default now()
);

create index if not exists cyber_week_items_posted_idx on public.cyber_week_items (posted_on desc, created_date desc);

-- Single-row settings: enable/disable switch, official website link, dates.
create table if not exists public.cyber_week_settings (
    singleton    boolean primary key default true check (singleton),
    enabled      boolean not null default true,
    website_url  text not null default 'https://cyberawarenessweek.vercel.app/',
    starts_on    date not null default '2026-10-27',
    ends_on      date not null default '2026-10-30',
    created_date timestamptz not null default now(),
    updated_date timestamptz not null default now()
);

insert into public.cyber_week_settings (singleton) values (true) on conflict (singleton) do nothing;

-- Auto-stamp updated_date on edits (same helper the main schema uses).
drop trigger if exists set_updated_date on public.cyber_week_items;
create trigger set_updated_date before update on public.cyber_week_items
  for each row execute function public.set_updated_date();

drop trigger if exists set_updated_date on public.cyber_week_settings;
create trigger set_updated_date before update on public.cyber_week_settings
  for each row execute function public.set_updated_date();

-- Row Level Security: public read, no direct writes. Writes go through the
-- admin RPCs below, which check the admin session token.
alter table public.cyber_week_items enable row level security;
alter table public.cyber_week_settings enable row level security;

drop policy if exists "cyber_week_items_select_all" on public.cyber_week_items;
create policy "cyber_week_items_select_all" on public.cyber_week_items for select using (true);

drop policy if exists "cyber_week_settings_select_all" on public.cyber_week_settings;
create policy "cyber_week_settings_select_all" on public.cyber_week_settings for select using (true);

-- ----------------------------------------------------------------------------
-- Admin write functions, updated to include cyber_week_items.
-- (Bodies are identical to supabase/schema.sql apart from the whitelists.)
-- ----------------------------------------------------------------------------

create or replace function public.admin_write(p_token text, p_table text, p_id uuid, p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  allowed  text[] := array['posts', 'domains', 'galleries', 'profiles', 'announcements', 'cyber_week_items'];
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

create or replace function public.admin_delete_row(p_token text, p_table text, p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  allowed text[] := array['posts', 'domains', 'galleries', 'profiles', 'comments', 'project_updates', 'announcements', 'cyber_week_items'];
begin
  perform public.admin_resolve_token(p_token);

  if not (p_table = any(allowed)) then
    raise exception 'Table not allowed: %', p_table;
  end if;

  execute format('delete from public.%I where id = $1', p_table) using p_id;
  return true;
end;
$$;

create or replace function public.admin_save_cyber_week(p_token text, p_patch jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  result jsonb;
begin
  perform public.admin_resolve_token(p_token);

  if p_patch is null or p_patch = '{}'::jsonb then
    raise exception 'Empty payload';
  end if;
  if p_patch ? 'website_url' and p_patch->>'website_url' !~* '^https?://' then
    raise exception 'Website must start with http:// or https://';
  end if;

  insert into public.cyber_week_settings (singleton) values (true) on conflict (singleton) do nothing;

  update public.cyber_week_settings t set
    enabled     = coalesce((p_patch->>'enabled')::boolean, t.enabled),
    website_url = coalesce(p_patch->>'website_url', t.website_url),
    starts_on   = coalesce((p_patch->>'starts_on')::date, t.starts_on),
    ends_on     = coalesce((p_patch->>'ends_on')::date, t.ends_on),
    updated_date = now()
  where t.singleton
  returning to_jsonb(t.*) into result;

  return result;
end;
$$;

-- Settings write path (only the keys you pass are changed).
grant execute on function public.admin_save_cyber_week(text, jsonb) to anon, authenticated;
grant execute on function public.admin_write(text, text, uuid, jsonb) to anon, authenticated;
grant execute on function public.admin_delete_row(text, text, uuid) to anon, authenticated;

-- Make the API pick up the new tables and functions straight away.
notify pgrst, 'reload schema';
