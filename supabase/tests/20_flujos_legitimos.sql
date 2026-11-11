-- Flujos legítimos tras el hardening (se ejecuta después de 10_ataques_rls.sql).
\set ON_ERROR_STOP on

-- Ana compra 2 botellas: el total lo calcula la BD (2 × 89.000)
select public.test_login('aaaaaaaa-0000-0000-0000-00000000000a');
set role authenticated;
do $$ declare o public.orders; begin
  select * into o from public.place_order('11111111-0000-0000-0000-000000000001', 2);
  assert o.total_cop = 178000, 'FALLO: total incorrecto';
  assert o.user_id = 'aaaaaaaa-0000-0000-0000-00000000000a', 'FALLO: dueño incorrecto';
  raise notice 'OK  place_order: total calculado en el servidor = %', o.total_cop;
end $$;

do $$ begin
  begin
    perform public.place_order('11111111-0000-0000-0000-000000000001', 9999);
    raise exception 'FALLO: aceptó cantidad absurda';
  exception when invalid_parameter_value then
    raise notice 'OK  place_order rechaza cantidades inválidas';
  end;
end $$;

-- Ana publica una reseña: author_id y author_name los pone el servidor
insert into public.reviews (product_id, rating, body)
values ('11111111-0000-0000-0000-000000000001', 5, '<b>Me encantó</b>');
do $$ declare r record; begin
  select author_name, body into r from public.reviews order by created_at desc limit 1;
  assert r.author_name = 'Ana', 'FALLO: author_name';
  raise notice 'OK  reseña propia publicada con author_name="%" (el HTML se guarda como texto)', r.author_name;
end $$;
reset role;

-- Un admin legítimo (app_metadata.role = admin, asignado desde el servidor) ve todos los pedidos
select public.test_login('dddddddd-0000-0000-0000-00000000000d', 'admin');
set role authenticated;
do $$ declare n int; begin
  select count(*) into n from public.orders;
  assert n >= 2, 'FALLO: admin no ve pedidos';
  raise notice 'OK  admin (app_metadata) ve % pedidos', n;
end $$;
reset role;

-- Mallory intenta ser admin falsificando user_metadata: no cambia nada
select set_config('request.jwt.claims',
  '{"sub":"bbbbbbbb-0000-0000-0000-00000000000b","role":"authenticated","user_metadata":{"role":"admin"},"app_metadata":{"role":"customer"}}', false);
set role authenticated;
do $$ declare n int; begin
  select count(*) into n from public.orders;
  assert n = 0, 'FALLO: user_metadata otorgó privilegios';
  raise notice 'OK  user_metadata.role=admin NO otorga privilegios (ve % pedidos)', n;
end $$;
reset role;

do $$ begin raise notice '=== FLUJOS LEGÍTIMOS OK ==='; end $$;
