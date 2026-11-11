import { NavLink, Outlet } from 'react-router-dom'

const link = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-emerald-100 text-emerald-900' : 'text-stone-600 hover:bg-stone-100'}`

export function Layout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-stone-200 bg-white">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
          <NavLink to="/" className="mr-4 text-lg font-bold text-emerald-700">🌿 EcoMart</NavLink>
          <NavLink to="/" end className={link}>Catálogo</NavLink>
          <NavLink to="/cuenta/pedidos" className={link}>Mis pedidos</NavLink>
          <NavLink to="/admin" className={link}>Admin</NavLink>
          <NavLink to="/registro" className={`${link({ isActive: false })} ml-auto bg-emerald-600 !text-white hover:!bg-emerald-700`}>Crear cuenta</NavLink>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
