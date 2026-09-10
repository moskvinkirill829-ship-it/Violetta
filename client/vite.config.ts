import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { devLeadApi } from './dev-api-plugin.mjs'

// Прод: Vercel собирает client → client/dist (статика) + функцию api/lead.mjs.
// Дев: форму /api/lead обслуживает плагин devLeadApi (см. dev-api-plugin.mjs).
export default defineConfig(({ mode }) => {
  // '..' — корень монорепо (cwd при запуске = client/); '' — читаем все ключи, не только VITE_*
  const env = loadEnv(mode, '..', '')
  return {
    plugins: [react(), devLeadApi(env)],
    server: { port: 5173 },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  }
})
