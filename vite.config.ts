import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'

/**
 * HARDENING: aborta el build si alguna variable VITE_* parece secreta.
 * Todo lo que empieza por VITE_ se incrusta en el JS público.
 */
function forbidSecretEnv(mode: string): Plugin {
  return {
    name: 'forbid-secret-env',
    config() {
      const env = loadEnv(mode, process.cwd(), 'VITE_')
      const leaked = Object.keys(env).filter((k) => /SERVICE|SECRET|PRIVATE|PASSWORD/i.test(k))
      if (leaked.length) {
        throw new Error(`[seguridad] Variables secretas expuestas al cliente: ${leaked.join(', ')}. Muévelas al servidor.`)
      }
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [
    forbidSecretEnv(mode),
    react(),
    tailwindcss(),
    visualizer({ filename: 'reports/bundle-despues.html', template: 'treemap', gzipSize: true, brotliSize: true }),
    visualizer({ filename: 'reports/stats-despues.json', template: 'raw-data', gzipSize: true }),
  ],
  build: {
    sourcemap: false, // no publicar el código fuente original en producción
    rolldownOptions: {
      output: {
        // Vendors estables en chunks propios: el navegador los cachea entre despliegues
        codeSplitting: {
          groups: [
            { name: 'react-vendor', test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/ },
            { name: 'supabase', test: /node_modules[\\/]@supabase[\\/]/ },
          ],
        },
      },
    },
  },
}))
