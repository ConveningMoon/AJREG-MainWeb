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
