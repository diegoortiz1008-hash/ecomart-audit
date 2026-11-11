import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getProduct, getReviews } from '../services/api'
import type { Product, Review } from '../types'
import { formatPrice, fromNow } from '../utils/format'

export default function ProductDetail() {
  const { id = '' } = useParams()
  const [product, setProduct] = useState<Product>()
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    getProduct(id).then(setProduct)
    getReviews(id).then(setReviews)
  }, [id])

  if (!product) return <p>Cargando…</p>
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="flex aspect-square items-center justify-center rounded-3xl bg-white text-9xl shadow-sm">{product.imageEmoji}</div>
      <div>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="mt-2 text-stone-600">{product.description}</p>
        <p className="mt-4 text-2xl font-bold">{formatPrice(product.priceCop)}</p>
        <h2 className="mt-8 text-lg font-semibold">Reseñas</h2>
        <ul className="mt-3 space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-xl border border-stone-200 bg-white p-4">
              <p className="text-sm text-stone-500">{r.authorName} · {'★'.repeat(r.rating)} · {fromNow(r.createdAt)}</p>
              {/* Permitimos HTML para que los clientes puedan dar formato a sus reseñas */}
              <p className="mt-1" dangerouslySetInnerHTML={{ __html: r.body }} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
