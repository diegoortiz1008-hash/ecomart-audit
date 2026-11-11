import { useEffect, useState } from 'react'
import { getMyOrders } from '../services/api'
import type { Order } from '../types'
import { formatDate, formatPrice } from '../utils/format'

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  useEffect(() => {
    let active = true
    getMyOrders().then((o) => active && setOrders(o))
    return () => {
      active = false
    }
  }, [])
  return (
    <div>
      <h1 className="text-2xl font-bold">Mis pedidos</h1>
      <ul className="mt-4 divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
        {orders.map((o) => (
          <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
            <span className="font-mono text-sm">{o.id}</span>
            <span className="text-sm text-stone-500">{formatDate(o.createdAt)}</span>
            <span className="rounded-full bg-stone-100 px-2 py-1 text-xs">{o.status}</span>
            <span className="font-semibold">{formatPrice(o.totalCop)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
