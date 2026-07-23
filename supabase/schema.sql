-- Disco Río ticketera schema
create extension if not exists "pgcrypto";

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  date_iso timestamptz not null,
  venue text not null,
  price integer not null check (price >= 0),
  capacity integer not null check (capacity > 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id),
  buyer_name text not null,
  buyer_email text not null,
  buyer_phone text,
  quantity integer not null check (quantity > 0),
  total integer not null,
  status text not null check (status in ('pending', 'paid', 'failed')) default 'pending',
  mp_preference_id text,
  mp_payment_id text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists tickets (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  event_id uuid not null references events(id),
  code text unique not null,
  status text not null check (status in ('valid', 'used')) default 'valid',
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists tickets_code_idx on tickets(code);
create index if not exists orders_event_idx on orders(event_id);
create index if not exists tickets_event_idx on tickets(event_id);

insert into events (slug, name, date_iso, venue, price, capacity, active)
values (
  'proxima',
  'Disco Río — Fecha especial',
  '2026-08-15T22:00:00-03:00',
  'El Pontón · Capri Nautic Club, Posadas',
  8000,
  200,
  true
)
on conflict (slug) do nothing;
