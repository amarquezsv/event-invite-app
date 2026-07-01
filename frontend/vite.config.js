import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Tailwind CSS v4 Vite plugin — no tailwind.config.js needed
    tailwindcss(),
  ],
  build: {
    // Output to 'build/' instead of the Vite default 'dist/' so that Azure Static
    // Web Apps / Oryx can find the artifacts without extra configuration. Oryx
    // detects this as a React project and expects the compiled output in 'build/'.
    outDir: 'build',
  },
})
