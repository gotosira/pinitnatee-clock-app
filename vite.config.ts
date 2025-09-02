import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // For GitHub Pages under /pinitnatee-clock-app/
  base: '/pinitnatee-clock-app/',
  plugins: [react()],
})
