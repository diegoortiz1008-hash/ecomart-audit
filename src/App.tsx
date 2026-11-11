import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { PageSkeleton } from './components/PageSkeleton'
import Catalog from './pages/Catalog'

// Code splitting por ruta: el catálogo (página de entrada) va en el bundle inicial;
// el resto se descarga solo cuando el usuario navega a esa ruta.
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Register = lazy(() => import('./pages/Register'))
const Orders = lazy(() => import('./pages/Orders'))
const Admin = lazy(() => import('./pages/Admin')) // arrastra recharts solo para admins

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Catalog />} />
        <Route path="producto/:id" element={<Suspense fallback={<PageSkeleton />}><ProductDetail /></Suspense>} />
        <Route path="registro" element={<Suspense fallback={<PageSkeleton />}><Register /></Suspense>} />
        <Route path="cuenta/pedidos" element={<Suspense fallback={<PageSkeleton />}><Orders /></Suspense>} />
        <Route path="admin" element={<Suspense fallback={<PageSkeleton />}><Admin /></Suspense>} />
      </Route>
    </Routes>
  )
}
