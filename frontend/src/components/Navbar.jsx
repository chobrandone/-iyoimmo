import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import Logo from './Logo';
import Icon from './icons';
import './Navbar.css';

export default function Navbar() {
  const { lang, toggle, t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { to: '/properties?intent=rent', label: t.nav.rent },
    { to: '/properties?intent=buy', label: t.nav.buy },
    { to: '/properties?intent=land', label: t.nav.land },
    { to: '/services', label: t.nav.services },
    { to: '/about', label: t.nav.about },
    { to: '/contact', label: t.nav.contact },
  ];

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        <Link to="/" className="navbar__logo">
          <Logo size="md" />
        </Link>

        <nav className="navbar__links">
          {navLinks.map((l) => (
            <NavLink key={l.to} to={l.to} className="navbar__link">{l.label}</NavLink>
          ))}
        </nav>

        <div className="navbar__actions">
          <button className="navbar__lang" onClick={toggle} title="Switch language">
            {lang === 'fr' ? 'EN' : 'FR'}
          </button>
          <Link to="/list-property" className="navbar__btn navbar__btn--primary">
            {t.nav.listProperty}
          </Link>
          <button className="navbar__mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            <Icon name={mobileOpen ? 'x' : 'menu'} size={22} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="navbar__mobile">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>
              {l.label}
            </Link>
          ))}
          <div className="navbar__mobile-footer">
            <button className="navbar__lang" onClick={toggle}>{lang === 'fr' ? 'EN' : 'FR'}</button>
            <Link to="/list-property" className="navbar__btn navbar__btn--primary" onClick={() => setMobileOpen(false)}>
              {t.nav.listProperty}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
