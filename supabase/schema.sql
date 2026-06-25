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
  neighborhood    text,
  property_type   text,
  status          text not null default 'available'
                  check (status in ('available', 'pending', 'sold')),
  price_usd       numeric not null,
  address         text not null,
  city            text not null,
  state           text not null check (state in ('VA', 'NC')),
  sqft            integer not null default 0,
  bedrooms        integer not null default 0,
  bathrooms_full  integer not null default 0,
  bathrooms_half  integer not null default 0,
  year_built      integer,
  garage_spaces   integer,
  lot_sqft        integer,
  image_url       text,
  gallery         text[],
  description     text,
  description_en  text,
  description_es  text,
  features        text[],
  features_en     text[],
  features_es     text[],
  floor_plans     text[],
  detail_pdf_url  text,
  created_at      timestamptz not null default now()
);

-- Migration: add columns that may be missing in existing installations
alter table public.listings
  add column if not exists neighborhood    text,
  add column if not exists property_type  text,
  add column if not exists status         text not null default 'available',
  add column if not exists year_built     integer,
  add column if not exists garage_spaces  integer,
  add column if not exists lot_sqft       integer,
  add column if not exists gallery        text[],
  add column if not exists description    text,
  add column if not exists description_en text,
  add column if not exists description_es text,
  add column if not exists features       text[],
  add column if not exists features_en    text[],
  add column if not exists features_es    text[],
  add column if not exists floor_plans    text[],
  add column if not exists detail_pdf_url text;

alter table public.listings enable row level security;

drop policy if exists "Public read listings" on public.listings;
create policy "Public read listings"
  on public.listings for select
  to anon, authenticated
  using (true);

-- Seed (full data matching src/data/listings.ts seedListings)
insert into public.listings
  (id, name, neighborhood, property_type, status,
   price_usd, address, city, state,
   sqft, bedrooms, bathrooms_full, bathrooms_half,
   year_built, garage_spaces,
   description_en, description_es,
   features_en, features_es)
values
  (
    'oakmont-manor',
    'Oakmont Manor',
    'Norfolk, Granby Street Corridor',
    'Residential · Detached',
    'available',
    370000,
    '3033 Somme Avenue', 'Norfolk', 'VA',
    2092, 4, 2, 1,
    1998, 2,
    'Welcome to Oakmont Manor — a spacious four-bedroom home nestled in one of Norfolk''s most sought-after neighborhoods. This beautifully maintained property features an open-concept main floor with abundant natural light, an updated kitchen with granite countertops, and a generous primary suite with walk-in closet. The backyard offers a private retreat perfect for entertaining, while the two-car garage provides ample storage. Walking distance to top-rated schools, parks, and local dining.',
    'Bienvenido a Oakmont Manor — una espaciosa residencia de cuatro habitaciones en uno de los vecindarios más codiciados de Norfolk. Esta propiedad impecablemente mantenida cuenta con una planta principal de concepto abierto con abundante luz natural, cocina renovada con encimeras de granito y una suite principal generosa con vestidor. El jardín trasero ofrece un retiro privado ideal para reuniones, mientras que el garaje para dos vehículos brinda almacenamiento amplio. A pocos pasos de escuelas destacadas, parques y restaurantes locales.',
    ARRAY[
      'Updated kitchen with granite countertops and stainless appliances',
      'Primary suite with walk-in closet and en-suite bath',
      'Open-concept living and dining area',
      'Hardwood floors throughout main level',
      'Private fenced backyard with patio',
      'Two-car attached garage',
      'Central HVAC (2021)',
      'Zoned for top-rated Norfolk schools'
    ],
    ARRAY[
      'Cocina renovada con encimeras de granito y electrodomésticos de acero inoxidable',
      'Suite principal con vestidor y baño privado',
      'Sala y comedor de concepto abierto',
      'Pisos de madera en toda la planta principal',
      'Jardín trasero privado cercado con patio',
      'Garaje adjunto para dos vehículos',
      'Sistema de climatización central (2021)',
      'Asignado a escuelas de alto rendimiento de Norfolk'
    ]
  ),
  (
    'westfield-house-locust',
    'Westfield House',
    'Norfolk, Ghent / Park Place',
    'Residential · Detached',
    'available',
    299900,
    '3154 Locust Avenue', 'Norfolk', 'VA',
    1206, 4, 2, 0,
    1985, null,
    'A well-priced gem in a charming Norfolk neighborhood. This four-bedroom home offers a functional floor plan ideal for families or investors seeking strong rental potential in the Hampton Roads market. Recent updates include fresh interior paint, new flooring in the main living areas, and a refreshed kitchen. Conveniently located near major employers, military bases, and interstate access.',
    'Una joya bien tasada en un encantador vecindario de Norfolk. Esta residencia de cuatro habitaciones ofrece una distribución funcional ideal para familias o inversionistas que buscan un sólido potencial de renta en el mercado de Hampton Roads. Las mejoras recientes incluyen pintura interior nueva, pisos renovados en las áreas principales y cocina refrescada. Ubicada convenientemente cerca de grandes empleadores, bases militares y acceso a la interestatal.',
    ARRAY[
      'Four bedrooms on one level',
      'Two full bathrooms',
      'Updated flooring in living areas',
      'Refreshed kitchen cabinetry and fixtures',
      'Spacious backyard',
      'Close to military bases and employers',
      'Easy interstate access'
    ],
    ARRAY[
      'Cuatro habitaciones en un solo nivel',
      'Dos baños completos',
      'Pisos actualizados en áreas de estar',
      'Armarios y accesorios de cocina renovados',
      'Amplio jardín trasero',
      'Cerca de bases militares y empleadores',
      'Fácil acceso a la interestatal'
    ]
  ),
  (
    'westfield-house-central',
    'Westfield House',
    'Central Suffolk, Lloyd Place',
    'Residential · Detached',
    'available',
    149900,
    '307 Central Avenue', 'Suffolk', 'VA',
    840, 3, 1, 0,
    1972, null,
    'An affordable entry point into Suffolk''s growing real estate market. This cozy three-bedroom home is ideal for first-time buyers or investors looking to capitalize on the area''s rapid appreciation. The layout is efficient and livable, with a bright living space, eat-in kitchen, and a generous yard. Priced to move — don''t miss this opportunity.',
    'Una entrada asequible al creciente mercado inmobiliario de Suffolk. Esta acogedora residencia de tres habitaciones es ideal para compradores por primera vez o inversionistas que buscan capitalizar la rápida valorización de la zona. La distribución es eficiente y habitable, con una sala luminosa, cocina con comedor y un generoso jardín. Con un precio pensado para venderse pronto — no pierda esta oportunidad.',
    ARRAY[
      'Three bedrooms',
      'Eat-in kitchen',
      'Bright living area with large windows',
      'Generous backyard — ideal for outdoor living',
      'Low-maintenance exterior',
      'Priced below market for quick sale',
      'Near schools, shops, and transit'
    ],
    ARRAY[
      'Tres habitaciones',
      'Cocina con comedor',
      'Sala luminosa con ventanas amplias',
      'Amplio jardín trasero — ideal para vida al aire libre',
      'Exterior de bajo mantenimiento',
      'Precio por debajo del mercado para venta rápida',
      'Cerca de escuelas, tiendas y transporte'
    ]
  )
on conflict (id) do update set
  neighborhood   = excluded.neighborhood,
  property_type  = excluded.property_type,
  status         = excluded.status,
  year_built     = excluded.year_built,
  garage_spaces  = excluded.garage_spaces,
  description_en = excluded.description_en,
  description_es = excluded.description_es,
  features_en    = excluded.features_en,
  features_es    = excluded.features_es;

-- ─────────────────────────────────────────────────────────────────────────────
-- Team
-- Column names match src/lib/team.ts -> mapRow().
-- Bios/taglines live in i18n (messages/*.json, keyed by member first name),
-- so they are NOT stored here; this table only holds structured fields.
create table if not exists public.team (
  slug          text primary key,
  name          text not null,
  role          text not null,
  languages     text[] not null default '{}',
  short_bio     text,
  photo_url     text,
  bio_photo_url text,
  video_url     text,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);

-- Migration: add columns that may be missing in existing installations
alter table public.team
  add column if not exists bio_photo_url text,
  add column if not exists video_url     text;

alter table public.team enable row level security;

drop policy if exists "Public read team" on public.team;
create policy "Public read team"
  on public.team for select
  to anon, authenticated
  using (true);

-- Seed (the 4 current team members)
insert into public.team (slug, name, role, languages, short_bio, sort_order)
values
  ('adriana-melendez', 'Adriana Meléndez', 'Lead Agent', '{es,en}',
   'Trusted Virginia/North Carolina real estate expert and mother of three.', 1),
  ('john-leonard',     'John Leonard',     'Agent',      '{en}',
   'Active duty Navy serviceman who brings discipline and strategic precision.', 2),
  ('viviane-chiu',     'Viviane Chiu',     'Agent',      '{en,es,pt}',
   'Civil engineer and multicultural mom offering analytical, trilingual service.', 3),
  ('melany-valencia',  'Melany Valencia',  'Agent',      '{es,en}',
   'Bilingual new mom bringing fresh energy and understanding of growing families.', 4)
on conflict (slug) do nothing;
