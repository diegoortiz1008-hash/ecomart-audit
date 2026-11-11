import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import Admin from './pages/Admin'
import Catalog from './pages/Catalog'
import Orders from './pages/Orders'
import ProductDetail from './pages/ProductDetail'
import Register from './pages/Register'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Catalog />} />
        <Route path="producto/:id" element={<ProductDetail />} />
        <Route path="registro" element={<Register />} />
        <Route path="cuenta/pedidos" element={<Orders />} />
        <Route path="admin" element={<Admin />} />
      </Route>
    </Routes>
  )
}
