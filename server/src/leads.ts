import { appendFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Lead } from './validation.js'
import { broadcastLead } from './telegram.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.resolve(__dirname, '../data')
const CSV_PATH = path.join(DATA_DIR, 'leads.csv')

export type StoredLead = Lead & { ip: string; ua: string; at: string }

function csvCell(v: string) {
  return `"${String(v).replace(/"/g, '""')}"`
}

/** Резервная копия — заявка всегда дописывается в CSV (открывается в Excel). */
export async function appendCsv(lead: StoredLead): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })
  if (!existsSync(CSV_PATH)) {
    const header = ['Дата', 'Имя', 'Телефон', 'Ник', 'Страница', 'IP', 'User-Agent']
    await appendFile(CSV_PATH, '﻿' + header.map(csvCell).join(';') + '\n', 'utf8')
  }
  const row = [lead.at, lead.name, lead.phone, lead.contact, lead.page, lead.ip, lead.ua]
  await appendFile(CSV_PATH, row.map(csvCell).join(';') + '\n', 'utf8')
}

/**
 * Сохраняет заявку: всегда в CSV + рассылает через Telegram-бота всем подписчикам.
 * Бросает ошибку только если CSV записать не удалось (совсем всё сломано).
 */
export async function storeLead(lead: StoredLead): Promise<{ csv: boolean; telegram: number }> {
  const result = { csv: false, telegram: 0 }

  const [csvRes, tgRes] = await Promise.allSettled([
    appendCsv(lead).then(() => {
      result.csv = true
    }),
    broadcastLead(lead).then((n) => {
      result.telegram = n
    }),
  ])

  if (csvRes.status === 'rejected') console.error('[storeLead] CSV failed:', csvRes.reason)
  if (tgRes.status === 'rejected') console.error('[storeLead] Telegram failed:', tgRes.reason)

  if (!result.csv && result.telegram === 0) {
    throw new Error('Не удалось сохранить заявку ни в один канал')
  }
  return result
}
