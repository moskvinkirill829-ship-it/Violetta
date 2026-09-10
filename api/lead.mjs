/* ============================================================
   Vercel Serverless Function — POST /api/lead
   Принимает заявку с формы и отправляет её в Telegram-группу.
   Переменные окружения (Vercel → Settings → Environment Variables):
     TELEGRAM_BOT_TOKEN  — токен бота (@BotFather)
     TELEGRAM_CHAT_ID    — id группы, куда падают заявки (отрицательный, -100…)
   ============================================================ */

import { handleLead } from './_lib/lead.mjs'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, message: 'Method Not Allowed' })
  }

  // Vercel сам парсит JSON при Content-Type: application/json,
  // но подстрахуемся на случай строки.
  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      body = {}
    }
  }

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()

  const { status, body: out } = await handleLead(body || {}, { ip })
  return res.status(status).json(out)
}
