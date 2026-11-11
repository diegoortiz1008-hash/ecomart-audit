import { lazy, Suspense, useEffect, useState } from 'react'
import { getCurrentRole } from '../services/api'

// Doble división: /admin es un chunk pequeño; los gráficos (recharts) solo se
// descargan DESPUÉS de confirmar que el usuario es admin.
const AdminCharts = lazy(() => import('./AdminCharts'))

/** Ocultar el panel es comodidad de UI: la protección real de los datos es RLS (is_admin()). */
export default function Admin() {
  const [role, setRole] = useState<'admin' | 'customer'>()
  useEffect(() => {
    let active = true
    getCurrentRole().then((r) => active && setRole(r))
    return () => {
      active = false
    }
  }, [])
  if (!role) return <p className="text-stone-500">Verificando permisos…</p>
  if (role !== 'admin') return <p className="text-stone-600">Acceso solo para administradores.</p>
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Panel de administración</h1>
      <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl bg-stone-200/70" />}>
        <AdminCharts />
      </Suspense>
    </div>
  )
}
