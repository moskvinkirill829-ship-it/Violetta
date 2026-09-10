import { handleLead } from '../api/_lib/lead.mjs'

/**
 * Дев-плагин Vite: в разработке serverless-функций нет, поэтому
 * POST /api/lead обрабатываем прямо в дев-сервере — той же логикой,
 * что и на Vercel (api/_lib/lead.mjs).
 *
 * @param {Record<string, string>} env  переменные из корневого .env
 * @returns {import('vite').Plugin}
 */
export function devLeadApi(env) {
  return {
    name: 'dev-lead-api',
    apply: 'serve',
    configureServer(server) {
      process.env.TELEGRAM_BOT_TOKEN ||= env.TELEGRAM_BOT_TOKEN
      process.env.TELEGRAM_CHAT_ID ||= env.TELEGRAM_CHAT_ID

      server.middlewares.use((req, res, next) => {
        if ((req.url || '').split('?')[0] !== '/api/lead') return next()
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }

        let raw = ''
        req.on('data', (chunk) => {
          raw += chunk
        })
        req.on('end', async () => {
          let body = {}
          try {
            body = JSON.parse(raw || '{}')
          } catch {
            /* пустое / битое тело — отдадим ошибку валидации */
          }
          const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()
          const { status, body: out } = await handleLead(body, { ip })
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(out))
        })
      })
    },
  }
}
