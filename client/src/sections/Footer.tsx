import { Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { contacts, footer } from '../data/site'
import MessengerIcon from '../components/MessengerIcon'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="ftr" id="contacts">
      <div className="container ftr__inner">
        <div className="ftr__col">
          <span className="ftr__logo">Помогариум</span>
          <p className="ftr__tag">Онлайн-репетиторы по всем школьным предметам</p>
        </div>

        <div className="ftr__col">
          <h4 className="ftr__h">Контакты</h4>
          <a href={contacts.phoneHref} className="ftr__link">{contacts.phone}</a>
          <a href={`mailto:${contacts.email}`} className="ftr__link">{contacts.email}</a>
          <span className="ftr__muted">{footer.address}</span>
          <div className="ftr__msgrs">
            <a href={contacts.telegram} aria-label="Telegram" target="_blank" rel="noreferrer"><MessengerIcon name="telegram" size={18} /></a>
            <a href={contacts.whatsapp} aria-label="WhatsApp" target="_blank" rel="noreferrer"><MessengerIcon name="whatsapp" size={18} /></a>
            <a href={contacts.max} aria-label="MAX" target="_blank" rel="noreferrer"><MessengerIcon name="max" size={18} /></a>
          </div>
        </div>

        <div className="ftr__col">
          <h4 className="ftr__h">Документы</h4>
          <Link to="/privacy" className="ftr__link">Политика конфиденциальности</Link>
          <span className="ftr__muted">© {footer.year} {footer.legalName}</span>
        </div>

        <div className="ftr__col ftr__col--qr">
          <h4 className="ftr__h">Мы в мессенджерах</h4>
          <div className="ftr__qr-row">
            <a
              href={contacts.telegram}
              className="ftr__qr"
              target="_blank"
              rel="noreferrer"
              aria-label="Telegram — QR-код и ссылка"
            >
              <QRCodeSVG value={contacts.telegram} size={76} bgColor="transparent" fgColor="#29217f" level="M" />
              <span>Telegram</span>
            </a>
            <a
              href={contacts.max}
              className="ftr__qr"
              target="_blank"
              rel="noreferrer"
              aria-label="MAX — QR-код и ссылка"
            >
              <QRCodeSVG value={contacts.max} size={76} bgColor="transparent" fgColor="#29217f" level="M" />
              <span>MAX</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
