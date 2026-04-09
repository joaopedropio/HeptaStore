import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../wwwroot',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/products': {
        target: 'http://localhost:5229',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:5229',
        changeOrigin: true,
      },
    },
  },
})
