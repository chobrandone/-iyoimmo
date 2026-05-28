import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import Logo from './Logo';
import Icon from './icons';
import './Footer.css';

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="footer">
      <div className="footer__inner container">
        <div className="footer__brand">
          <div className="footer__logo">
            <Logo size="md" dark />
          </div>
          <p className="footer__tagline">{t.footer.tagline}</p>
          <div className="footer__contact">
            <a href="tel:+23672637171" className="footer__contact-item">
              <Icon name="phone" size={14} /> +236 72 63 71 71
            </a>
            <a href="mailto:contact@iyoimmo.com" className="footer__contact-item">
              <Icon name="mail" size={14} /> contact@iyoimmo.com
            </a>
            <a href="https://wa.me/23672637171" target="_blank" rel="noreferrer" className="footer__contact-item footer__contact-item--wa">
              <Icon name="whatsapp" size={14} /> WhatsApp
            </a>
          </div>
        </div>

        <div className="footer__col">
          <h4 className="footer__col-title">{t.footer.explore}</h4>
          <Link to="/properties?intent=rent">{t.nav.rent}</Link>
          <Link to="/properties?intent=buy">{t.nav.buy}</Link>
          <Link to="/properties?intent=land">{t.nav.land}</Link>
          <Link to="/services">{t.nav.services}</Link>
        </div>

        <div className="footer__col">
          <h4 className="footer__col-title">{t.footer.company}</h4>
          <Link to="/about">{t.nav.about}</Link>
          <Link to="/list-property">{t.nav.listProperty}</Link>
          <Link to="/contact">{t.nav.contact}</Link>
        </div>

        <div className="footer__col">
          <h4 className="footer__col-title">{t.footer.contact}</h4>
          <span>+236 72 63 71 71</span>
          <span>contact@iyoimmo.com</span>
          <span>Avenue Boganda, Bangui</span>
          <span>Lun–Ven 8h–17h</span>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container">
          <span>{t.footer.copyright}</span>
          <div className="footer__bottom-links">
            <Link to="/legal">{t.footer.legal}</Link>
            <Link to="/privacy">{t.footer.privacy}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
