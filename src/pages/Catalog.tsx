import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../services/api'
import type { Product } from '../types'
import { formatPrice, groupBy } from '../utils/format'

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([])
  useEffect(() => {
    let active = true
    getProducts().then((p) => active && setProducts(p))
    return () => {
      active = false
    }
  }, [])
  const groups = useMemo(() => groupBy(products, (p) => p.category), [products])

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Productos sostenibles</h1>
      <p className="mt-1 text-stone-600">Cada compra muestra el CO₂ que ayudas a evitar.</p>
      {Object.entries(groups).map(([category, items]) => (
        <section key={category} className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">{category}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <Link key={p.id} to={`/producto/${p.id}`} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                <div className="text-4xl" aria-hidden="true">{p.imageEmoji}</div>
                <h3 className="mt-3 font-semibold">{p.name}</h3>
                <p className="mt-1 text-sm text-stone-600">{p.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold">{formatPrice(p.priceCop)}</span>
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">−{p.co2SavedKg} kg CO₂</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
