import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const { version } = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf8'))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Tailwind CSS v4 Vite plugin — no tailwind.config.js needed
    tailwindcss(),
  ],
  server: {
    // Proxy /api to the local Azure Functions runtime so the browser never
    // makes a cross-origin request (eliminates CORS issues in local dev).
    proxy: {
      '/api': {
        target: 'http://localhost:7071',
        changeOrigin: true,
      },
    },
  },
  define: {
    // Expose the monorepo version from the root package.json at build time.
    // Use APP_VERSION (imported from src/utils/version.js) instead of this global directly.
    __APP_VERSION__: JSON.stringify(version),
  },
  build: {
    // Output to 'build/' instead of the Vite default 'dist/' so that Azure Static
    // Web Apps / Oryx can find the artifacts without extra configuration. Oryx
    // detects this as a React project and expects the compiled output in 'build/'.
    outDir: 'build',
  },
})
