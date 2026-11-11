-- =============================================================================
-- EcoMart · Esquema INICIAL (estado ANTES de la auditoría)
-- ⚠️ Contiene las políticas RLS débiles que detectó la auditoría de IA.
-- =============================================================================
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  email       text,
  phone       text,
  address     text,
  role        text not null default 'customer',
  created_at  timestamptz not null default now()
);

create table public.products (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text,
  price_cop     integer not null,
  cost_cop      integer,          -- costo interno (dato sensible de negocio)
  supplier_email text,            -- dato sensible del proveedor
  co2_saved_kg  numeric(10, 2),
  category      text,
  created_at    timestamptz not null default now()
);

create table public.orders (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id),
  total_cop    integer not null,
  status       text not null default 'pagado',
  shipping_address text,
  created_at   timestamptz not null default now()
);

create table public.reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  author_id   uuid references public.profiles (id),
  author_name text,
  rating      integer,
  body        text,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders   enable row level security;
alter table public.reviews  enable row level security;

-- "Para que el checkout y las reseñas funcionen"
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);
create policy "products_select" on public.products for select using (true);
create policy "orders_select"   on public.orders   for select to authenticated using (true);
create policy "orders_insert"   on public.orders   for insert to authenticated with check (true);
create policy "reviews_select"  on public.reviews  for select using (true);
create policy "reviews_insert"  on public.reviews  for insert with check (true);

-- Trigger de registro: copia el rol que envía el cliente en user_metadata
create function public.handle_new_user() returns trigger
language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email,
          coalesce(new.raw_user_meta_data ->> 'role', 'customer'));
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
