-- Simulación mínima de Supabase para ejecutar las migraciones en PostgreSQL puro.
create role anon nologin;
create role authenticated nologin;
create schema auth;
grant usage on schema auth to anon, authenticated;

create table auth.users (
  id                  uuid primary key default gen_random_uuid(),
  email               text,
  raw_user_meta_data  jsonb not null default '{}',
  raw_app_meta_data   jsonb not null default '{}'
);

-- Igual que Supabase: leen los claims del JWT de la petición.
create function auth.jwt() returns jsonb language sql stable
  as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
create function auth.uid() returns uuid language sql stable
  as $$ select nullif(auth.jwt() ->> 'sub', '')::uuid $$;

grant usage on schema public to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant execute on functions to anon, authenticated;

-- Helper de pruebas: actuar como un usuario (o como anónimo con NULL)
create function public.test_login(p_user uuid, p_app_role text default null) returns void language sql as $$
  select set_config('request.jwt.claims',
    case when p_user is null then '' else
      jsonb_build_object('sub', p_user, 'role', 'authenticated',
                         'app_metadata', jsonb_build_object('role', coalesce(p_app_role, 'customer')))::text
    end, false);
$$;
