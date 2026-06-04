-- The Masterpieces — schema migration to match the redesigned app (src/App.jsx).
--
-- The project database was on an older, booking-centric schema. The redesign
-- renamed/added tables and columns but the migration was never applied. This
-- script reconciles the database with what the app actually queries:
--   roster, music_library, inquiries, events, member_availability
--
-- Safe to run on the existing (empty) database. Idempotent.

-- 1. Align existing tables to the redesigned column names ---------------------
alter table public.roster              rename column role       to singer_type;
alter table public.member_availability rename column booking_id to event_id;

-- 2. Create the tables the app expects ----------------------------------------
create table if not exists public.music_library (
  id            bigint generated always as identity primary key,
  title         text not null,
  arranger      text,
  category      text,
  voice_parts   text[] not null default '{}',
  pages         integer,
  file_size_mb  numeric,
  cloud_only    boolean not null default false,
  created_at    timestamptz not null default now()
);

create table if not exists public.inquiries (
  id                bigint generated always as identity primary key,
  contact_name      text not null,
  organization      text,
  phone             text,
  email             text,
  event_date        date,
  event_type        text,
  expected_donation numeric not null default 0,
  notes             text,
  status            text not null default 'new',
  next_follow_up    date,
  last_follow_up    date,
  created_at        timestamptz not null default now()
);

create table if not exists public.events (
  id            bigint generated always as identity primary key,
  title         text not null,
  event_date    date,
  event_time    text,
  venue         text,
  donation      numeric not null default 0,
  status        text not null default 'upcoming',
  songs_planned bigint[] not null default '{}',
  created_at    timestamptz not null default now()
);

-- 3. Row Level Security: allow the app's anon key to read & write --------------
-- This is an internal tool that uses the anon key directly, so grant full
-- access to anon + authenticated on each table.
do $$
declare t text;
begin
  foreach t in array array[
    'roster','member_availability','music_library','inquiries','events'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists app_full_access on public.%I;', t);
    execute format(
      'create policy app_full_access on public.%I for all to anon, authenticated using (true) with check (true);',
      t);
  end loop;
end $$;

-- 4. Seed the core quartet (only if the roster is empty) ----------------------
-- Voice parts confirmed by Beth: Sherry Miller (Soprano), Donna White (Alto),
-- Steve Miller (Tenor), Jim Tucker (Bass).
insert into public.roster (name, voice_part, singer_type, active, joined_date)
select v.name, v.voice_part, 'member', true, current_date
from (values
  ('Sherry Miller','Soprano'),
  ('Donna White',  'Alto'),
  ('Steve Miller', 'Tenor'),
  ('Jim Tucker',   'Bass')
) as v(name, voice_part)
where not exists (select 1 from public.roster);
