-- =============================================================================
-- Pruebas de penetración de RLS. Cada ataque imprime:
--   VULNERABLE  -> el ataque tuvo éxito
--   BLOQUEADO   -> la base de datos lo impidió
-- Se ejecuta contra el esquema inicial y contra el esquema endurecido.
-- =============================================================================
\set ON_ERROR_STOP on
set client_min_messages = notice;

-- ---------- Datos: Ana (víctima), Mallory (atacante) ----------
insert into auth.users (id, email, raw_user_meta_data) values
  ('aaaaaaaa-0000-0000-0000-00000000000a', 'ana@ecomart.co', '{"full_name":"Ana"}'),
  ('bbbbbbbb-0000-0000-0000-00000000000b', 'mallory@evil.io', '{"full_name":"Mallory"}');
-- E1 (registro): Mallory se registra enviando role=admin en los metadatos
insert into auth.users (id, email, raw_user_meta_data) values
  ('cccccccc-0000-0000-0000-00000000000c', 'mallory2@evil.io', '{"full_name":"Mallory 2","role":"admin"}');

update public.profiles set phone = '+57 300 000 0000', address = 'Cra 7 #12-34, Bogotá'
  where id = 'aaaaaaaa-0000-0000-0000-00000000000a';
insert into public.products (id, name, price_cop, cost_cop, supplier_email, category) values
  ('11111111-0000-0000-0000-000000000001', 'Botella térmica', 89000, 31000, 'proveedor@fabrica.cn', 'hogar');
insert into public.orders (id, user_id, total_cop, shipping_address) values
  ('22222222-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-00000000000a', 89000, 'Cra 7 #12-34, Bogotá');

create function pg_temp.report(attack text, succeeded boolean) returns void language plpgsql as $$
begin
  raise notice '%  %', rpad(case when succeeded then 'VULNERABLE' else 'BLOQUEADO' end, 11), attack;
end $$;

-- =================== Ataques como ANÓNIMO ===================
select public.test_login(null);
set role anon;

do $$ declare leaked text; begin
  begin
    select supplier_email into leaked from public.products limit 1;
    perform pg_temp.report('A1 · anónimo lee costo y email del proveedor (products.cost_cop/supplier_email)', leaked is not null);
  exception when insufficient_privilege then
    perform pg_temp.report('A1 · anónimo lee costo y email del proveedor (products.cost_cop/supplier_email)', false);
  end;
end $$;

do $$ declare n int; begin
  begin
    select count(*) into n from public.profiles where phone is not null;
    perform pg_temp.report('A2 · anónimo lee teléfonos y direcciones de clientes (profiles)', n > 0);
  exception when insufficient_privilege then
    perform pg_temp.report('A2 · anónimo lee teléfonos y direcciones de clientes (profiles)', false);
  end;
end $$;
reset role;

-- =================== Ataques como MALLORY (autenticada) ===================
select public.test_login('bbbbbbbb-0000-0000-0000-00000000000b');
set role authenticated;

do $$ declare n int; begin
  select count(*) into n from public.orders where user_id <> 'bbbbbbbb-0000-0000-0000-00000000000b';
  perform pg_temp.report('A3 · lee pedidos y direcciones de envío de otros clientes (orders)', n > 0);
end $$;

do $$ declare n int; begin
  begin
    update public.profiles set role = 'admin' where id = 'bbbbbbbb-0000-0000-0000-00000000000b';
    get diagnostics n = row_count;
    perform pg_temp.report('A4 · se auto-asciende a admin (UPDATE profiles.role)', n > 0);
  exception when insufficient_privilege then
    perform pg_temp.report('A4 · se auto-asciende a admin (UPDATE profiles.role)', false);
  end;
end $$;

do $$ begin
  begin
    insert into public.orders (user_id, total_cop) values ('bbbbbbbb-0000-0000-0000-00000000000b', 1);
    perform pg_temp.report('A5 · crea un pedido pagando $1 (precio decidido por el cliente)', true);
  exception when insufficient_privilege then
    perform pg_temp.report('A5 · crea un pedido pagando $1 (precio decidido por el cliente)', false);
  end;
end $$;

do $$ begin
  begin
    insert into public.reviews (product_id, author_id, author_name, rating, body)
    values ('11111111-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-00000000000a', 'Ana', 1, 'Producto pésimo, no compren');
    perform pg_temp.report('A6 · publica una reseña suplantando a Ana (author_id ajeno)', true);
  exception when insufficient_privilege or check_violation then
    perform pg_temp.report('A6 · publica una reseña suplantando a Ana (author_id ajeno)', false);
  end;
end $$;

do $$ begin
  begin
    insert into public.reviews (product_id, author_id, rating, body)
    values ('11111111-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-00000000000b', 500, 'spam');
    perform pg_temp.report('A7 · reseña con rating=500 (sin validación de datos)', true);
  exception when insufficient_privilege or check_violation then
    perform pg_temp.report('A7 · reseña con rating=500 (sin validación de datos)', false);
  end;
end $$;
reset role;

-- =================== Escalada en el registro ===================
do $$ declare r text; begin
  select role into r from public.profiles where id = 'cccccccc-0000-0000-0000-00000000000c';
  perform pg_temp.report('A8 · registro con user_metadata.role=admin crea un ADMIN', r = 'admin');
end $$;

-- =================== Uso legítimo (debe seguir funcionando) ===================
select public.test_login('aaaaaaaa-0000-0000-0000-00000000000a');
set role authenticated;
do $$ declare n int; begin
  select count(*) into n from public.orders where user_id = 'aaaaaaaa-0000-0000-0000-00000000000a';
  assert n = 1, 'FALLO FUNCIONAL: Ana no ve su propio pedido';
  select count(*) into n from public.profiles where id = 'aaaaaaaa-0000-0000-0000-00000000000a' and phone is not null;
  assert n = 1, 'FALLO FUNCIONAL: Ana no ve su propio perfil';
  raise notice 'OK          Funcional: Ana ve su perfil y sus pedidos';
end $$;
reset role;
