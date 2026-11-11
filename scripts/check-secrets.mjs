// Escanea el bundle generado (dist/) buscando secretos que NUNCA deben llegar al navegador.
// Uso: npm run audit:secrets  (se ejecuta después de cada build)
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const files = []
const walk = (dir) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) walk(p)
    else files.push(p)
  }
}
walk('dist')

const decode = (jwt) => {
  try {
    return JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString())
  } catch {
    return null
  }
}

const findings = []
for (const file of files.filter((f) => /\.(js|html|css|map)$/.test(f))) {
  const text = readFileSync(file, 'utf8')
  for (const jwt of text.match(/eyJ[\w-]+\.eyJ[\w-]+\.[\w-]+/g) ?? []) {
    if (decode(jwt)?.role === 'service_role') findings.push(`${file}: JWT con role=service_role`)
  }
  if (/sb_secret_[\w-]{10,}/.test(text)) findings.push(`${file}: clave secreta de Supabase (sb_secret_…)`)
  if (/SUPABASE_SERVICE_ROLE_KEY/.test(text)) findings.push(`${file}: referencia a SUPABASE_SERVICE_ROLE_KEY`)
  if (/-----BEGIN (RSA |EC )?PRIVATE KEY-----/.test(text)) findings.push(`${file}: clave privada PEM`)
  if (file.endsWith('.map')) findings.push(`${file}: source map publicado`)
}

if (findings.length) {
  console.error('❌ Secretos o artefactos sensibles en dist/:\n - ' + findings.join('\n - '))
  process.exit(1)
}
console.log(`✅ ${files.length} archivos revisados en dist/: sin service_role, claves secretas ni source maps.`)
