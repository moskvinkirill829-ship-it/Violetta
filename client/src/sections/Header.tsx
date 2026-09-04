import { useEffect, useState } from 'react'
import { contacts, nav } from '../data/site'
import MessengerIcon from '../components/MessengerIcon'
import './Header.css'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <header className={`hdr ${scrolled ? 'hdr--scrolled' : ''}`}>
      <div className="container hdr__inner">
        <a href="#top" className="hdr__logo" onClick={close}>
          <span className="hdr__logo-name">Помогариум</span>
          <span className="hdr__logo-tag">{contacts.brandTagline}</span>
        </a>

        <nav className={`hdr__nav ${open ? 'is-open' : ''}`} aria-label="Основная навигация">
          <ul>
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} onClick={close}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hdr__contact hdr__contact--mobile">
            <a href={contacts.phoneHref} className="hdr__phone">
              {contacts.phone}
            </a>
            <div className="hdr__msgrs">
              <a href={contacts.telegram} aria-label="Telegram" target="_blank" rel="noreferrer"><MessengerIcon name="telegram" /></a>
              <a href={contacts.whatsapp} aria-label="WhatsApp" target="_blank" rel="noreferrer"><MessengerIcon name="whatsapp" /></a>
              <a href={contacts.max} aria-label="MAX" target="_blank" rel="noreferrer"><MessengerIcon name="max" /></a>
            </div>
          </div>
        </nav>

        <div className="hdr__right">
          <div className="hdr__contact">
            <a href={contacts.phoneHref} className="hdr__phone">
              {contacts.phone}
            </a>
            <div className="hdr__msgrs">
              <a href={contacts.telegram} aria-label="Telegram" target="_blank" rel="noreferrer"><MessengerIcon name="telegram" /></a>
              <a href={contacts.whatsapp} aria-label="WhatsApp" target="_blank" rel="noreferrer"><MessengerIcon name="whatsapp" /></a>
              <a href={contacts.max} aria-label="MAX" target="_blank" rel="noreferrer"><MessengerIcon name="max" /></a>
            </div>
          </div>

          <a href="#lead" className="btn btn--primary hdr__cta" onClick={close}>
            Записаться на урок
          </a>

          <button
            type="button"
            className={`hdr__burger ${open ? 'is-open' : ''}`}
            aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
      {open && <button className="hdr__scrim" aria-hidden="true" tabIndex={-1} onClick={close} />}
    </header>
  )
}
