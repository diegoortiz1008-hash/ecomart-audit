// Quita rutas absolutas de la máquina local de los reportes del analizador de bundle
// (no publicar nombres de usuario ni estructura de carpetas del equipo).
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const PROJECT = 'ecomart-audit'
// C:/Users/.../ecomart-audit  ó  C:\\Users\\...\\ecomart-audit (escapado en JSON)
const ABSOLUTE = new RegExp(String.raw`[A-Za-z]:(?:[\\/]{1,4}[^"'<>\s\\/]+)*?[\\/]{1,4}` + PROJECT, 'g')

let changed = 0
for (const file of readdirSync('reports')) {
  if (!/\.(html|json|txt)$/.test(file)) continue
  const path = join('reports', file)
  const before = readFileSync(path, 'utf8')
  const after = before.replace(ABSOLUTE, PROJECT)
  if (after !== before) {
    writeFileSync(path, after)
    changed++
  }
}
console.log(`Reportes saneados: ${changed}`)
