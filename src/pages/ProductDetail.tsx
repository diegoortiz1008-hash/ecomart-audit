import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getProduct, getReviews } from '../services/api'
import type { Product, Review } from '../types'
import { formatPrice, fromNow } from '../utils/format'

export default function ProductDetail() {
  const { id = '' } = useParams()
  const [product, setProduct] = useState<Product | null>()
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    let active = true
    Promise.all([getProduct(id), getReviews(id)]).then(([p, r]) => {
      if (!active) return
      setProduct(p ?? null)
      setReviews(r)
    })
    return () => {
      active = false
    }
  }, [id])

  if (product === undefined) return <p className="text-stone-500">Cargando…</p>
  if (product === null) return <p className="text-stone-600">Producto no encontrado.</p>

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="flex aspect-square items-center justify-center rounded-3xl bg-white text-9xl shadow-sm" aria-hidden="true">{product.imageEmoji}</div>
      <div>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="mt-2 text-stone-600">{product.description}</p>
        <p className="mt-4 text-2xl font-bold">{formatPrice(product.priceCop)}</p>
        <h2 className="mt-8 text-lg font-semibold">Reseñas</h2>
        <ul className="mt-3 space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-xl border border-stone-200 bg-white p-4">
              <p className="text-sm text-stone-500">
                {r.authorName} · <span aria-label={`${r.rating} de 5 estrellas`}>{'★'.repeat(Math.min(5, Math.max(0, r.rating)))}</span> · {fromNow(r.createdAt)}
              </p>
              {/* React escapa el texto: el HTML de un atacante se muestra, no se ejecuta */}
              <p className="mt-1 whitespace-pre-line break-words">{r.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
