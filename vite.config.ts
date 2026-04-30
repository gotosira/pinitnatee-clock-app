import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/pinitnatee-clock-app/',
  plugins: [react()],
  server: {
    // Expose dev server on the local network so mobile devices on the same
    // Wi-Fi can hit it for real-device PWA testing.
    host: true,
  },
  build: {
    target: 'es2020',
    sourcemap: true,
  },
})
