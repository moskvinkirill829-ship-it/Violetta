import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/* ============================================================
   Telegram-бот: рассылает новые заявки всем подписчикам.
   Подписка — команда /start в чате с ботом. Отписка — /stop.
   Работает через long-polling (getUpdates), вебхук не нужен.
   ============================================================ */

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const STORE_PATH = path.resolve(__dirname, '../data/subscribers.json')
const API = (method: string) => `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`

type Subscriber = { name: string; username: string; since: string }
type Store = { offset: number; subscribers: Record<string, Subscriber> }

let store: Store = { offset: 0, subscribers: {} }
let polling = false

async function load() {
  try {
    store = JSON.parse(await readFile(STORE_PATH, 'utf8'))
    if (!store.subscribers) store.subscribers = {}
  } catch {
    store = { offset: 0, subscribers: {} }
  }
}

let saveTimer: NodeJS.Timeout | null = null
async function save() {
  if (saveTimer) return
  saveTimer = setTimeout(async () => {
    saveTimer = null
    try {
      await mkdir(path.dirname(STORE_PATH), { recursive: true })
      await writeFile(STORE_PATH, JSON.stringify(store, null, 2), 'utf8')
    } catch (err) {
      console.error('[telegram] save failed:', (err as Error).message)
    }
  }, 300)
}

async function tg<T = unknown>(method: string, body: Record<string, unknown>): Promise<T | null> {
  try {
    const res = await fetch(API(method), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = (await res.json()) as { ok: boolean; result?: T; error_code?: number; description?: string }
    if (!data.ok) {
      // 403 — бот заблокирован; 400 chat not found — чат удалён
      if (body.chat_id && (data.error_code === 403 || data.error_code === 400)) {
        const id = String(body.chat_id)
        if (store.subscribers[id]) {
          delete store.subscribers[id]
          save()
          console.log(`[telegram] удалён недоступный подписчик ${id} (${data.description})`)
        }
      }
      return null
    }
    return data.result ?? null
  } catch (err) {
    console.error(`[telegram] ${method} failed:`, (err as Error).message)
    return null
  }
}

function subscribersCount() {
  return Object.keys(store.subscribers).length
}

async function handleUpdate(u: TgUpdate) {
  store.offset = Math.max(store.offset, u.update_id + 1)
  const msg = u.message
  if (!msg?.chat || !msg.text) return

  const chatId = String(msg.chat.id)
  const text = msg.text.trim()
  const name = [msg.chat.first_name, msg.chat.last_name].filter(Boolean).join(' ') || msg.chat.title || 'без имени'
  const username = msg.chat.username ? '@' + msg.chat.username : ''

  const code = process.env.TELEGRAM_SUBSCRIBE_CODE?.trim()

  // первое слово — команда, остальное — аргумент (код)
  const [cmd, ...rest] = text.split(/\s+/)
  const cmdLower = cmd.toLowerCase()
  const arg = rest.join(' ').trim()

  const isStart = ['/start', 'старт', 'start', 'начать'].includes(cmdLower)
  const isStop = ['/stop', 'стоп', 'stop', 'отписаться'].includes(cmdLower)

  if (isStart) {
    if (code && arg !== code) {
      await tg('sendMessage', {
        chat_id: chatId,
        text: 'Чтобы получать заявки, отправьте команду с кодом:\n/start КОД\n(код выдаёт администратор)',
      })
      return
    }
    store.subscribers[chatId] = { name, username, since: new Date().toISOString() }
    save()
    await tg('sendMessage', {
      chat_id: chatId,
      text:
        '✅ Готово! Сюда будут приходить все новые заявки с сайта «Помогариум».\n\n' +
        '/stop — отписаться\n/status — проверить подписку',
    })
    console.log(`[telegram] +подписчик ${chatId} (${name} ${username}) — всего ${subscribersCount()}`)
    return
  }

  if (isStop) {
    delete store.subscribers[chatId]
    save()
    await tg('sendMessage', { chat_id: chatId, text: 'Отписал. Заявки больше не приходят.\n/start — подписаться снова.' })
    console.log(`[telegram] -подписчик ${chatId} — всего ${subscribersCount()}`)
    return
  }

  if (['/status', 'статус'].includes(cmdLower)) {
    const on = !!store.subscribers[chatId]
    await tg('sendMessage', {
      chat_id: chatId,
      text: on
        ? `Вы подписаны. Всего получателей заявок: ${subscribersCount()}.`
        : 'Вы не подписаны. Отправьте /start, чтобы получать заявки.',
    })
    return
  }

  await tg('sendMessage', {
    chat_id: chatId,
    text:
      'Я присылаю заявки с сайта «Помогариум».\n\n' +
      'Отправьте «старт» (или /start), чтобы подписаться.\n' +
      '«стоп» (или /stop) — отписаться.\n' +
      '«статус» — проверить подписку.',
  })
}

async function pollLoop() {
  while (polling) {
    const updates = await tg<TgUpdate[]>('getUpdates', { offset: store.offset, timeout: 50 })
    if (updates && updates.length) {
      for (const u of updates) {
        try {
          await handleUpdate(u)
        } catch (err) {
          console.error('[telegram] update error:', (err as Error).message)
        }
      }
      save()
    } else if (updates === null) {
      // ошибка сети/API — небольшая пауза перед повтором
      await new Promise((r) => setTimeout(r, 5000))
    }
  }
}

/** Запуск бота. Ничего не делает, если не задан TELEGRAM_BOT_TOKEN. */
export async function startBot() {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN не задан — бот выключен, заявки только в CSV')
    return
  }
  await load()
  const me = await tg<{ username: string }>('getMe', {})
  if (!me) {
    console.error('[telegram] не удалось подключиться к боту — проверьте токен')
    return
  }
  polling = true
  pollLoop()
  console.log(`[telegram] бот @${me.username} запущен, подписчиков: ${subscribersCount()}`)
}

export function stopBot() {
  polling = false
}

/** Разослать заявку всем подписчикам. */
export async function broadcastLead(lead: {
  name: string
  phone: string
  contact: string
  page: string
  at: string
}): Promise<number> {
  if (!process.env.TELEGRAM_BOT_TOKEN) return 0
  const ids = Object.keys(store.subscribers)
  if (!ids.length) {
    console.warn('[telegram] заявка получена, но подписчиков нет — только CSV')
    return 0
  }

  const text =
    '🆕 Новая заявка — «Помогариум»\n\n' +
    `👤 Имя: ${lead.name}\n` +
    `📞 Телефон: ${lead.phone}\n` +
    `💬 Ник: ${lead.contact}\n\n` +
    `🕒 ${lead.at}\n` +
    `🔗 ${lead.page || '—'}`

  let sent = 0
  for (const id of ids) {
    const ok = await tg('sendMessage', { chat_id: id, text, disable_web_page_preview: true })
    if (ok) sent++
  }
  return sent
}

/* --- типы Telegram (минимально нужное) --- */
type TgChat = {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  title?: string
}
type TgUpdate = {
  update_id: number
  message?: { chat: TgChat; text?: string }
}
