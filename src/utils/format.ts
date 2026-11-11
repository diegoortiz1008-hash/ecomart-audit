// Antes: moment (≈28 KB gz, sin tree-shaking) + lodash completo (≈38 KB gz).
// Ahora: APIs nativas Intl (0 KB de JavaScript extra).
const priceFmt = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
const dateFmt = new Intl.DateTimeFormat('es-CO', { dateStyle: 'long' })
const relativeFmt = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
]

export const formatPrice = (cop: number) => priceFmt.format(Math.round(cop))
export const formatDate = (iso: string) => dateFmt.format(new Date(iso))

/** "hace 3 días", "ayer", "en 2 horas" — reemplaza moment().fromNow() */
export function fromNow(iso: string, now = Date.now()): string {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000)
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return relativeFmt.format(Math.round(seconds / size), unit)
  }
  return relativeFmt.format(seconds, 'second')
}

/** Reemplaza _.groupBy */
export function groupBy<T, K extends PropertyKey>(items: T[], key: (item: T) => K): Record<K, T[]> {
  return items.reduce(
    (acc, item) => {
      ;(acc[key(item)] ??= []).push(item)
      return acc
    },
    {} as Record<K, T[]>,
  )
}
