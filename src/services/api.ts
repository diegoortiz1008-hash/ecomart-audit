import { SAMPLE_ORDERS, SAMPLE_PRODUCTS, SAMPLE_REVIEWS } from '../data/sampleData'
import { isDemo, supabase } from '../lib/supabase'
import type { Order, Product, Review } from '../types'

export async function getProducts(): Promise<Product[]> {
  if (isDemo) return SAMPLE_PRODUCTS
  const { data } = await supabase.from('products').select('*') // trae TODAS las columnas
  return (data ?? []) as Product[]
}

export async function getProduct(id: string): Promise<Product | undefined> {
  if (isDemo) return SAMPLE_PRODUCTS.find((p) => p.id === id)
  const { data } = await supabase.from('products').select('*').eq('id', id).single()
  return data as Product
}

export async function getReviews(productId: string): Promise<Review[]> {
  if (isDemo) return SAMPLE_REVIEWS.filter((r) => r.productId === productId)
  const { data } = await supabase.from('reviews').select('*').eq('product_id', productId)
  return (data ?? []) as Review[]
}

export async function getAllOrders(): Promise<Order[]> {
  if (isDemo) return SAMPLE_ORDERS
  // Sin filtro por usuario: confiamos en que la UI solo muestra los propios
  const { data } = await supabase.from('orders').select('*')
  return (data ?? []) as Order[]
}

export async function signUp(email: string, password: string, fullName: string, role: string) {
  if (isDemo) return { error: null }
  return supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, role } } })
}

export async function getCurrentRole(): Promise<string> {
  if (isDemo) return new URLSearchParams(location.search).get('role') ?? 'customer'
  const { data } = await supabase.auth.getUser()
  return (data.user?.user_metadata?.role as string) ?? 'customer' // editable por el propio usuario
}
