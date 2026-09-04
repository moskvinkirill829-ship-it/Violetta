import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'
import dotenv from 'dotenv'
import express from 'express'
import helmet from 'helmet'
import compression from 'compression'
import cors from 'cors'
import { rateLimit } from 'express-rate-limit'
import { leadSchema, looksLikeBot } from './validation.js'
import { storeLead, type StoredLead } from './leads.js'
import { startBot } from './telegram.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// .env лежит рядом с server/ — грузим по абсолютному пути, не завися от cwd
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const PORT = Number(process.env.PORT) || 3001
const isProd = process.env.NODE_ENV === 'production'

const app = express()
app.set('trust proxy', 1)
app.use(helmet({ contentSecurityPolicy: false }))
app.use(compression())
app.use(express.json({ limit: '16kb' }))

if (isProd && process.env.CORS_ORIGIN) {
  app.use(cors({ origin: process.env.CORS_ORIGIN.split(',').map((s) => s.trim()) }))
} else {
  app.use(cors())
}

const leadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 8, // не более 8 заявок с одного IP за 10 минут
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { ok: false, message: 'Слишком много заявок. Попробуйте позже.' },
})

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.post('/api/lead', leadLimiter, async (req, res) => {
  const parsed = leadSchema.safeParse(req.body)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return res.status(400).json({ ok: false, message: first?.message || 'Проверьте поля формы' })
  }

  const lead = parsed.data

  if (looksLikeBot(lead)) {
    // тихо «принимаем», чтобы бот не подбирал обход
    return res.json({ ok: true })
  }

  const stored: StoredLead = {
    ...lead,
    ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || '',
    ua: (req.headers['user-agent'] as string) || '',
    at: new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }),
  }

  try {
    const channels = await storeLead(stored)
    console.log(`[lead] ${stored.name} / ${stored.phone} → csv:${channels.csv} telegram:${channels.telegram}`)
    return res.json({ ok: true })
  } catch (err) {
    console.error('[lead] store failed:', err)
    return res.status(500).json({ ok: false, message: 'Не удалось отправить заявку. Напишите нам в мессенджер.' })
  }
})

// ── Раздача собранного клиента в проде ──
const clientDist = path.resolve(__dirname, '../../client/dist')
if (existsSync(clientDist)) {
  app.use(express.static(clientDist))
  app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')))
} else {
  console.warn('[static] client/dist не найден — запустите `npm run build`. В деве это норма.')
}

app.listen(PORT, () => {
  console.log(`▶ Помогариум API на http://localhost:${PORT}  (${isProd ? 'production' : 'dev'})`)
  startBot()
})
