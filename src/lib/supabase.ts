import { createClient } from '@supabase/supabase-js'

// TODO: usamos la service_role para que el panel admin pueda leer todos los pedidos
const url = import.meta.env.VITE_SUPABASE_URL ?? 'https://demo.supabase.co'
const key = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key'

export const supabase = createClient(url, key)
export const isDemo = !import.meta.env.VITE_SUPABASE_URL
