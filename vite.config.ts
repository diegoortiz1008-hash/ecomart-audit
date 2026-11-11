import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({ filename: 'reports/bundle-antes.html', template: 'treemap', gzipSize: true, brotliSize: true }),
    visualizer({ filename: 'reports/stats-antes.json', template: 'raw-data', gzipSize: true }),
  ],
})
