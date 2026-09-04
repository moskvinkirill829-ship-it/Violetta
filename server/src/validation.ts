import { z } from 'zod'

export const leadSchema = z.object({
  name: z.string().trim().min(2, 'Укажите имя').max(80),
  phone: z
    .string()
    .trim()
    .min(6, 'Проверьте номер телефона')
    .max(30)
    .refine((v) => (v.replace(/\D/g, '').length >= 6), 'Проверьте номер телефона'),
  contact: z.string().trim().min(2, 'Укажите ник для связи').max(120),
  page: z.string().max(500).optional().default(''),
  // анти-спам
  company: z.string().max(200).optional().default(''), // honeypot: у людей всегда пусто
  elapsedMs: z.number().nonnegative().optional().default(9999),
})

export type Lead = z.infer<typeof leadSchema>

/** true — если заявка похожа на бота (мгновенная отправка или заполнен honeypot). */
export function looksLikeBot(lead: Lead): boolean {
  if (lead.company && lead.company.length > 0) return true
  if (lead.elapsedMs < 1500) return true
  return false
}
