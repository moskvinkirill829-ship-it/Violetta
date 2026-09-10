export type Lead = {
  name: string
  phone: string
  contact: string
  page: string
  company: string
  elapsedMs: number
}

export type LeadMeta = { ip?: string }

export function validateLead(body: unknown): { lead: Lead } | { error: string }
export function looksLikeBot(lead: Lead): boolean
export function sendLeadToTelegram(lead: Lead, meta?: LeadMeta): Promise<void>
export function handleLead(
  body: unknown,
  meta?: LeadMeta,
): Promise<{ status: number; body: { ok: boolean; message?: string } }>
