import { createClient } from '@supabase/supabase-js'
import { env, isDemo } from './env'

/**
 * Cliente ÚNICO con la anon key. Todas las peticiones viajan con el JWT del
 * usuario y Postgres aplica RLS. La service_role vive solo en el servidor
 * (Edge Functions / backend), nunca en el navegador.
 */
export const supabase = isDemo
  ? null
  : createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' },
    })

export { isDemo }
