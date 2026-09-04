import { useMemo, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import './LeadForm.css'

const COUNTRY_CODES = [
  { code: '+7', label: '+7', mask: 'RU/KZ' },
  { code: '+375', label: '+375', mask: 'BY' },
  { code: '+996', label: '+996', mask: 'KG' },
  { code: '+998', label: '+998', mask: 'UZ' },
  { code: '+374', label: '+374', mask: 'AM' },
  { code: '+995', label: '+995', mask: 'GE' },
  { code: '+other', label: 'другой', mask: '' },
]

type Status = 'idle' | 'sending' | 'ok' | 'error'

export default function LeadForm() {
  const [dial, setDial] = useState('+7')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverMsg, setServerMsg] = useState('')

  const mountedAt = useRef(Date.now())
  const honeypot = useRef<HTMLInputElement>(null)

  const digits = useMemo(() => phone.replace(/\D/g, ''), [phone])

  function validate() {
    const e: Record<string, string> = {}
    if (digits.length < 6 || digits.length > 15) e.phone = 'Проверьте номер телефона'
    if (name.trim().length < 2) e.name = 'Как к вам обращаться?'
    if (contact.trim().length < 2) e.contact = 'Укажите ник для связи'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault()
    if (status === 'sending') return
    if (honeypot.current?.value) return // бот
    if (!validate()) return

    setStatus('sending')
    setServerMsg('')
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: `${dial === '+other' ? '' : dial} ${phone}`.trim(),
          name: name.trim(),
          contact: contact.trim(),
          page: window.location.href,
          elapsedMs: Date.now() - mountedAt.current,
          company: honeypot.current?.value ?? '',
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) throw new Error(data.message || 'Не удалось отправить заявку')
      setStatus('ok')
      setPhone('')
      setName('')
      setContact('')
    } catch (err) {
      setStatus('error')
      setServerMsg(err instanceof Error ? err.message : 'Ошибка сети')
    }
  }

  return (
    <section className="lead" id="lead">
      <div className="container">
        <Reveal className="lead__card">
          <div className="lead__copy">
            <h2 className="lead__title">Запишитесь на первое занятие</h2>
            <p className="lead__text">
              Это знакомство с преподавателем — поймём, что нужно подтянуть, и подберём формат без спешки.
            </p>
          </div>

          {status === 'ok' ? (
            <div className="lead__done" role="status">
              <div className="lead__done-check" aria-hidden="true">✓</div>
              <h3>Заявка принята!</h3>
              <p>Мы свяжемся с вами в ближайшее время. Спасибо за доверие.</p>
              <button type="button" className="btn btn--ghost" onClick={() => setStatus('idle')}>
                Отправить ещё одну
              </button>
            </div>
          ) : (
            <form className="lead__form" onSubmit={onSubmit} noValidate>
              <div className="lead__row lead__row--phone">
                <label className="lead__field lead__field--code">
                  <span className="lead__label">Код</span>
                  <select value={dial} onChange={(e) => setDial(e.target.value)} aria-label="Код страны">
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                        {c.mask ? ` · ${c.mask}` : ''}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="lead__field">
                  <span className="lead__label">Номер телефона</span>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="Номер телефона"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    aria-invalid={!!errors.phone}
                  />
                  {errors.phone && <span className="lead__err">{errors.phone}</span>}
                </label>
              </div>

              <label className="lead__field">
                <span className="lead__label">Имя</span>
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="Имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={!!errors.name}
                />
                {errors.name && <span className="lead__err">{errors.name}</span>}
              </label>

              <label className="lead__field">
                <span className="lead__label">Ник в Telegram / VK / WhatsApp / MAX</span>
                <input
                  type="text"
                  placeholder="Ник в Telegram / VK / WhatsApp / MAX"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  aria-invalid={!!errors.contact}
                />
                {errors.contact && <span className="lead__err">{errors.contact}</span>}
              </label>

              {/* honeypot — скрыт от людей, ловит ботов */}
              <input
                ref={honeypot}
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                className="lead__hp"
                aria-hidden="true"
              />

              <button type="submit" className="btn lead__submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Отправляем…' : 'Записаться на урок'}
              </button>

              {status === 'error' && (
                <p className="lead__server-err" role="alert">
                  {serverMsg || 'Что-то пошло не так. Попробуйте ещё раз или напишите нам в мессенджер.'}
                </p>
              )}

              <p className="lead__policy">
                Нажимая кнопку, вы соглашаетесь с{' '}
                <Link to="/privacy">политикой конфиденциальности</Link>.
              </p>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  )
}
