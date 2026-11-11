/**
 * Evita Open Redirect y `javascript:` URLs: solo se permiten rutas internas
 * relativas ("/cuenta/pedidos"). Cualquier otra cosa vuelve al inicio.
 */
export function safeRedirectPath(next: string | null | undefined, fallback = '/'): string {
  if (!next) return fallback
  // Debe empezar por "/" pero no por "//" ni "/\" (URLs protocol-relative)
  if (!/^\/(?![/\\])/.test(next)) return fallback
  try {
    const url = new URL(next, window.location.origin)
    return url.origin === window.location.origin ? url.pathname + url.search + url.hash : fallback
  } catch {
    return fallback
  }
}
