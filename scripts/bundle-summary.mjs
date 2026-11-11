// Resume un reporte raw-data de rollup-plugin-visualizer por paquete y por chunk.
// Uso: node scripts/bundle-summary.mjs reports/stats-antes.json
import { readFileSync } from 'node:fs'

const file = process.argv[2]
const stats = JSON.parse(readFileSync(file, 'utf8'))
const kb = (n) => (n / 1024).toFixed(1).padStart(8) + ' KB'

const byPackage = new Map()
const byChunk = new Map()

for (const meta of Object.values(stats.nodeMetas)) {
  const match = meta.id.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/)
  const pkg = match ? match[1] : '(código de la app)'
  for (const [chunk, partUid] of Object.entries(meta.moduleParts)) {
    const part = stats.nodeParts[partUid]
    for (const [map, key] of [[byPackage, pkg], [byChunk, chunk]]) {
      const cur = map.get(key) ?? { rendered: 0, gzip: 0 }
      cur.rendered += part.renderedLength
      cur.gzip += part.gzipLength
      map.set(key, cur)
    }
  }
}

const print = (title, map, limit = 12) => {
  console.log(`\n${title}`)
  console.log('-'.repeat(64))
  ;[...map.entries()]
    .sort((a, b) => b[1].rendered - a[1].rendered)
    .slice(0, limit)
    .forEach(([name, s]) => console.log(`${name.padEnd(34)}${kb(s.rendered)}${kb(s.gzip)} gz`))
}

print('Peso por paquete (código renderizado antes de minificar · gzip)', byPackage)
print('Peso por chunk', byChunk, 30)
