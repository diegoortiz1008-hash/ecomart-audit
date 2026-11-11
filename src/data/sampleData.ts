import type { Order, Product, Review } from '../types'

const ago = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString()

export const SAMPLE_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Botella térmica de bambú', description: 'Acero inoxidable y tapa de bambú. Mantiene el frío 24 h.', priceCop: 89000, co2SavedKg: 12.4, category: 'hogar', imageEmoji: '🧴' },
  { id: 'p2', name: 'Camiseta de algodón orgánico', description: 'Algodón 100% orgánico certificado GOTS.', priceCop: 65000, co2SavedKg: 4.1, category: 'moda', imageEmoji: '👕' },
  { id: 'p3', name: 'Kit de compostaje urbano', description: 'Compostera de 20 L para apartamento con filtro de carbón.', priceCop: 159000, co2SavedKg: 38.7, category: 'hogar', imageEmoji: '🪴' },
  { id: 'p4', name: 'Café de comercio justo', description: 'Café de origen, cultivo bajo sombra, 500 g.', priceCop: 38000, co2SavedKg: 1.9, category: 'alimentos', imageEmoji: '☕' },
  { id: 'p5', name: 'Cargador solar portátil', description: 'Panel plegable de 21 W con dos puertos USB.', priceCop: 215000, co2SavedKg: 54.2, category: 'tecnologia', imageEmoji: '🔋' },
  { id: 'p6', name: 'Bolsas reutilizables x5', description: 'Malla de algodón para frutas y verduras.', priceCop: 24000, co2SavedKg: 3.3, category: 'hogar', imageEmoji: '🛍️' },
]

export const SAMPLE_REVIEWS: Review[] = [
  { id: 'r1', productId: 'p1', authorName: 'Laura', rating: 5, body: 'Excelente, la uso todos los días.', createdAt: ago(3) },
  // Reseña maliciosa almacenada (XSS persistente) para demostrar la vulnerabilidad
  { id: 'r2', productId: 'p1', authorName: 'atacante', rating: 5, body: 'Muy buena <img src=x onerror="document.body.dataset.xss=\'ejecutado\';document.title=\'XSS: \'+document.cookie">', createdAt: ago(1) },
  { id: 'r3', productId: 'p3', authorName: 'Andrés', rating: 4, body: 'Funciona bien, el filtro evita olores.', createdAt: ago(10) },
]

export const SAMPLE_ORDERS: Order[] = [
  { id: 'o-1001', userId: 'demo-user', totalCop: 154000, status: 'entregado', createdAt: ago(40) },
  { id: 'o-1002', userId: 'demo-user', totalCop: 215000, status: 'enviado', createdAt: ago(5) },
  { id: 'o-1003', userId: 'demo-user', totalCop: 38000, status: 'pagado', createdAt: ago(1) },
]

export const SALES_BY_MONTH = [
  { month: 'Jun', ventas: 12_400_000, co2: 410 },
  { month: 'Jul', ventas: 15_900_000, co2: 520 },
  { month: 'Ago', ventas: 14_100_000, co2: 480 },
  { month: 'Sep', ventas: 19_800_000, co2: 690 },
  { month: 'Oct', ventas: 23_500_000, co2: 810 },
  { month: 'Nov', ventas: 27_200_000, co2: 940 },
]
