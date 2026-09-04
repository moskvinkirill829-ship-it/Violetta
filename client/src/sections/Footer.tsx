import { Link } from 'react-router-dom'
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
            {/* TODO: заменить на реальные QR-коды */}
            <span className="ftr__qr" title="QR — добавить">QR</span>
            <span className="ftr__qr" title="QR — добавить">QR</span>
          </div>
          <span className="ftr__muted ftr__muted--sm">{footer.qrNote}</span>
        </div>
      </div>
    </footer>
  )
}
