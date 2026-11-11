/// <reference types="vite/client" />

/**
 * SOLO variables públicas. Todo lo que empieza por VITE_ termina dentro del
 * bundle y cualquiera puede leerlo: nunca declarar aquí claves secretas.
 */
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
