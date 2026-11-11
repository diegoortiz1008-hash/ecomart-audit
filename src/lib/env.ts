/**
 * Lectura y validación de variables de entorno públicas.
 * Defensa en profundidad: aunque alguien configure por error la service_role
 * como "anon key", la app se niega a arrancar con ella.
 */
function decodeJwtRole(token: string): string | null {
  try {
    const payload = token.split('.')[1]
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return typeof json.role === 'string' ? json.role : null
  } catch {
    return null
  }
}

const url = import.meta.env.VITE_SUPABASE_URL ?? ''
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

if (anonKey && decodeJwtRole(anonKey) === 'service_role') {
  throw new Error('Configuración insegura: VITE_SUPABASE_ANON_KEY contiene una service_role. Usa la anon key.')
}
if (url && !url.startsWith('https://') && !url.startsWith('http://127.0.0.1') && !url.startsWith('http://localhost')) {
  throw new Error('VITE_SUPABASE_URL debe usar HTTPS')
}

export const env = { supabaseUrl: url, supabaseAnonKey: anonKey } as const
export const isDemo = !(url && anonKey)
