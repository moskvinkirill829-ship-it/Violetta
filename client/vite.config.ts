import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Дев-сервер клиента проксирует /api на Node-бэкенд (server/, порт 3001).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
