-- A&J Real Estate Group — Supabase schema for public marketing data.
-- Run this in the Supabase SQL editor (or via the MCP) to enable live data.
-- The site reads these tables anonymously (anon key) with read-only RLS.
-- Forms do NOT go here — they POST to the ITMANO CRM.

-- ─────────────────────────────────────────────────────────────────────────────
-- Listings
-- Column names match src/lib/listings.ts -> mapRow().
create table if not exists public.listings (
  id              text primary key,
  name            text not null,
  price_usd       numeric not null,
  address         text not null,
  city            text not null,
  state           text not null check (state in ('VA', 'NC')),
  sqft            integer not null default 0,
  bedrooms        integer not null default 0,
  bathrooms_full  integer not null default 0,
  bathrooms_half  integer not null default 0,
  image_url       text,
  created_at      timestamptz not null default now()
);

alter table public.listings enable row level security;

drop policy if exists "Public read listings" on public.listings;
create policy "Public read listings"
  on public.listings for select
  to anon, authenticated
  using (true);

-- Seed (the 3 properties from the current site — edit freely)
insert into public.listings
  (id, name, price_usd, address, city, state, sqft, bedrooms, bathrooms_full, bathrooms_half)
values
  ('oakmont-manor',           'Oakmont Manor',   370000, '3033 Somme Avenue',  'Norfolk', 'VA', 2092, 4, 2, 1),
  ('westfield-house-locust',  'Westfield House', 299900, '3154 Locust Avenue', 'Norfolk', 'VA', 1206, 4, 2, 0),
  ('westfield-house-central', 'Westfield House', 149900, '307 Central Avenue', 'Suffolk', 'VA',  840, 3, 1, 0)
on conflict (id) do nothing;

-- ─────────────────────────────────────────────────────────────────────────────
-- Team
-- Column names match src/lib/team.ts -> mapRow(). Bios/taglines live in i18n
-- (messages/*.json, keyed by member first name), so they are NOT stored here;
-- this table only holds the structured, language-neutral fields.
create table if not exists public.team (
  slug        text primary key,
  name        text not null,
  role        text not null,
  languages   text[] not null default '{}',  -- subset of {'en','es','pt'}
  short_bio   text,
  photo_url   text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.team enable row level security;

drop policy if exists "Public read team" on public.team;
create policy "Public read team"
  on public.team for select
  to anon, authenticated
  using (true);

-- Seed (the 4 current team members — edit freely)
insert into public.team (slug, name, role, languages, short_bio, sort_order)
values
  ('adriana-melendez', 'Adriana Meléndez', 'Lead Agent', '{es,en}',
   'Trusted Virginia/North Carolina real estate expert and mother of three.', 1),
  ('john-leonard',     'John Leonard',     'Agent',      '{en,es}',
   'Active duty Navy serviceman who brings discipline and strategic precision.', 2),
  ('viviane-chiu',     'Viviane Chiu',     'Agent',      '{en,es,pt}',
   'Civil engineer and multicultural mom offering analytical, trilingual service.', 3),
  ('melany-valencia',  'Melany Valencia',  'Agent',      '{es,en}',
   'Bilingual new mom bringing fresh energy and understanding of growing families.', 4)
on conflict (slug) do nothing;
