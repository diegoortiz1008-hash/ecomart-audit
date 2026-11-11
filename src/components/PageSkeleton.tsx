export function PageSkeleton() {
  return (
    <div role="status" aria-live="polite" className="animate-pulse space-y-4">
      <span className="sr-only">Cargando página…</span>
      <div className="h-8 w-1/3 rounded bg-stone-200" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-48 rounded-2xl bg-stone-200/70" />
        ))}
      </div>
    </div>
  )
}
