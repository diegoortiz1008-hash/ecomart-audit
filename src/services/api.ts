import { SAMPLE_ORDERS, SAMPLE_PRODUCTS, SAMPLE_REVIEWS } from '../data/sampleData'
import { isDemo, supabase } from '../lib/supabase'
import type { Order, Product, Review } from '../types'

// Columnas EXPLÍCITAS: nunca `select('*')`. Si mañana se agrega una columna
// sensible, no se filtra al frontend por accidente (y RLS/GRANT la bloquean igual).
const PRODUCT_COLUMNS = 'id, name, description, price_cop, co2_saved_kg, category'
const REVIEW_COLUMNS = 'id, product_id, author_name, rating, body, created_at'
const ORDER_COLUMNS = 'id, user_id, total_cop, status, created_at'

type Row = Record<string, unknown>
const toProduct = (r: Row): Product => ({
  id: String(r.id), name: String(r.name), description: String(r.description ?? ''),
  priceCop: Number(r.price_cop), co2SavedKg: Number(r.co2_saved_kg ?? 0),
  category: r.category as Product['category'], imageEmoji: '🌿',
})
const toReview = (r: Row): Review => ({
  id: String(r.id), productId: String(r.product_id), authorName: String(r.author_name ?? 'Cliente'),
  rating: Number(r.rating), body: String(r.body), createdAt: String(r.created_at),
})
const toOrder = (r: Row): Order => ({
  id: String(r.id), userId: String(r.user_id), totalCop: Number(r.total_cop),
  status: r.status as Order['status'], createdAt: String(r.created_at),
})

export async function getProducts(): Promise<Product[]> {
  if (isDemo || !supabase) return SAMPLE_PRODUCTS
  const { data, error } = await supabase.from('products').select(PRODUCT_COLUMNS)
  if (error) throw new Error('No se pudo cargar el catálogo')
  return data.map(toProduct)
}

export async function getProduct(id: string): Promise<Product | undefined> {
  if (isDemo || !supabase) return SAMPLE_PRODUCTS.find((p) => p.id === id)
  const { data, error } = await supabase.from('products').select(PRODUCT_COLUMNS).eq('id', id).maybeSingle()
  if (error) throw new Error('No se pudo cargar el producto')
  return data ? toProduct(data) : undefined
}

export async function getReviews(productId: string): Promise<Review[]> {
  if (isDemo || !supabase) return SAMPLE_REVIEWS.filter((r) => r.productId === productId)
  const { data, error } = await supabase.from('reviews').select(REVIEW_COLUMNS).eq('product_id', productId)
  if (error) throw new Error('No se pudieron cargar las reseñas')
  return data.map(toReview)
}

/** Pedidos del usuario actual. RLS ya filtra, pero además filtramos explícitamente. */
export async function getMyOrders(): Promise<Order[]> {
  if (isDemo || !supabase) return SAMPLE_ORDERS
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return []
  const { data, error } = await supabase.from('orders').select(ORDER_COLUMNS).eq('user_id', auth.user.id)
  if (error) throw new Error('No se pudieron cargar tus pedidos')
  return data.map(toOrder)
}

/** El precio lo calcula la BD (RPC place_order); el cliente solo envía producto y cantidad. */
export async function placeOrder(productId: string, quantity: number) {
  if (isDemo || !supabase) return { error: null }
  return supabase.rpc('place_order', { p_product_id: productId, p_quantity: quantity })
}

/** El rol NO se envía: todo usuario nuevo es "customer" (lo garantiza el trigger). */
export async function signUp(email: string, password: string, fullName: string) {
  if (isDemo || !supabase) return { error: null }
  return supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { full_name: fullName.trim() }, emailRedirectTo: `${window.location.origin}/` },
  })
}

/** Rol desde app_metadata (solo editable por el servidor). La UI lo usa para mostrar/ocultar;
 *  la autorización REAL la hace RLS con public.is_admin(). */
export async function getCurrentRole(): Promise<'admin' | 'customer'> {
  if (isDemo || !supabase) return import.meta.env.DEV && new URLSearchParams(location.search).get('demoAdmin') === '1' ? 'admin' : 'customer'
  const { data } = await supabase.auth.getUser()
  return data.user?.app_metadata?.role === 'admin' ? 'admin' : 'customer'
}
