export interface Product {
  id: string
  name: string
  description: string
  priceCop: number
  co2SavedKg: number
  category: 'hogar' | 'moda' | 'alimentos' | 'tecnologia'
  imageEmoji: string
}

export interface Review {
  id: string
  productId: string
  authorName: string
  rating: number
  body: string
  createdAt: string
}

export interface Order {
  id: string
  userId: string
  totalCop: number
  status: 'pagado' | 'enviado' | 'entregado'
  createdAt: string
}
