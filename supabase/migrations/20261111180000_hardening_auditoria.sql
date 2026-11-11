-- =============================================================================
-- EcoMart · HARDENING tras la Auditoría de IA
-- Corrige los hallazgos A1–A8 (ver docs/INFORME_AUDITORIA.md).
-- Principios: mínimo privilegio, el cliente nunca decide roles ni precios,
-- y la autorización se basa en datos que el usuario NO puede modificar.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. ¿Es admin?  -> se lee de app_metadata del JWT.
--    app_metadata SOLO se puede escribir con la service_role (servidor);
--    user_metadata, en cambio, lo edita el propio usuario con auth.updateUser().
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql stable
set search_path = ''
as $$
  select coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

-- ---------------------------------------------------------------------------
-- 1. Limpiar políticas permisivas del esquema inicial
-- ---------------------------------------------------------------------------
drop policy if exists "profiles_select" on public.profiles;
drop policy if exists "profiles_update" on public.profiles;
drop policy if exists "products_select" on public.products;
drop policy if exists "orders_select"   on public.orders;
drop policy if exists "orders_insert"   on public.orders;
drop policy if exists "reviews_select"  on public.reviews;
drop policy if exists "reviews_insert"  on public.reviews;

-- ---------------------------------------------------------------------------
-- 2. PROFILES (A2, A4, A8): datos personales solo para su dueño; rol inmutable
-- ---------------------------------------------------------------------------
alter table public.profiles
  add constraint profiles_role_valid check (role in ('customer', 'admin')),
  add constraint profiles_name_len   check (char_length(full_name) <= 100),
  add constraint profiles_phone_len  check (char_length(phone) <= 30),
  add constraint profiles_addr_len   check (char_length(address) <= 300);

revoke all on public.profiles from anon;
revoke insert, update, delete on public.profiles from authenticated;
grant select on public.profiles to authenticated;
-- Privilegios por COLUMNA: el usuario puede editar sus datos, pero NUNCA `role` ni `email`
grant update (full_name, phone, address) on public.profiles to authenticated;

create policy "profiles: el dueño (o un admin) lee el perfil"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id or (select public.is_admin()));

create policy "profiles: el dueño edita su perfil"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- A8: el trigger de registro IGNORA cualquier rol enviado por el cliente
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''          -- evita secuestro de search_path en funciones SECURITY DEFINER
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 100),
    new.email,
    'customer'                 -- siempre; los admins se asignan desde el servidor (app_metadata)
  );
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. PRODUCTS (A1): catálogo público SIN columnas internas
-- ---------------------------------------------------------------------------
revoke all on public.products from anon, authenticated;
grant select (id, name, description, price_cop, co2_saved_kg, category, created_at)
  on public.products to anon, authenticated;

create policy "products: catálogo público"
  on public.products for select to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- 4. ORDERS (A3, A5): cada cliente ve lo suyo; el TOTAL lo calcula el servidor
-- ---------------------------------------------------------------------------
revoke all on public.orders from anon;
revoke insert, update, delete on public.orders from authenticated;
grant select on public.orders to authenticated;

alter table public.orders
  add constraint orders_status_valid check (status in ('pagado', 'enviado', 'entregado')),
  add constraint orders_total_positive check (total_cop > 0);

create policy "orders: el cliente ve sus pedidos (admin ve todos)"
  on public.orders for select to authenticated
  using ((select auth.uid()) = user_id or (select public.is_admin()));

create index if not exists orders_user_id_idx on public.orders (user_id);

-- Único camino para crear pedidos: RPC que toma el precio de la BD, no del cliente.
create or replace function public.place_order(p_product_id uuid, p_quantity integer)
returns public.orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user  uuid := (select auth.uid());
  v_price integer;
  v_order public.orders;
begin
  if v_user is null then
    raise exception 'Debes iniciar sesión' using errcode = '42501';
  end if;
  if p_quantity is null or p_quantity not between 1 and 20 then
    raise exception 'Cantidad inválida' using errcode = '22023';
  end if;
  select price_cop into v_price from public.products where id = p_product_id;
  if v_price is null then
    raise exception 'Producto no encontrado' using errcode = 'P0002';
  end if;
  insert into public.orders (user_id, total_cop, shipping_address)
  select v_user, v_price * p_quantity, p.address from public.profiles p where p.id = v_user
  returning * into v_order;
  return v_order;
end;
$$;
revoke execute on function public.place_order(uuid, integer) from public, anon;
grant execute on function public.place_order(uuid, integer) to authenticated;

-- ---------------------------------------------------------------------------
-- 5. REVIEWS (A6, A7): autor = usuario autenticado; datos validados en la BD
-- ---------------------------------------------------------------------------
alter table public.reviews
  alter column author_id set not null,
  alter column author_id set default auth.uid(),
  add constraint reviews_rating_range check (rating between 1 and 5),
  add constraint reviews_body_len     check (char_length(trim(body)) between 3 and 1000);

revoke all on public.reviews from anon, authenticated;
grant select (id, product_id, author_name, rating, body, created_at) on public.reviews to anon, authenticated;
grant insert (product_id, rating, body) on public.reviews to authenticated;

create policy "reviews: lectura pública"
  on public.reviews for select to anon, authenticated
  using (true);

create policy "reviews: solo en nombre propio"
  on public.reviews for insert to authenticated
  with check ((select auth.uid()) = author_id);

-- El nombre visible lo pone el servidor desde el perfil (no se puede falsificar)
create or replace function public.set_review_author()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.author_id := (select auth.uid());
  select coalesce(nullif(p.full_name, ''), 'Cliente') into new.author_name
  from public.profiles p where p.id = new.author_id;
  return new;
end;
$$;
revoke execute on function public.set_review_author() from public, anon, authenticated;

create trigger reviews_set_author
  before insert on public.reviews
  for each row execute function public.set_review_author();
