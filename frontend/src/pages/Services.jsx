import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import Icon from '../components/icons';
import './Services.css';

export default function Services() {
  const { t } = useLang();

  return (
    <main style={{ paddingTop: 68 }}>
      <section className="services-hero">
        <div className="container">
          <h1>{t.services.title}</h1>
          <p>{t.services.subtitle}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="services-grid">
            {t.services.items.map((item, i) => (
              <div key={i} className="service-card">
                <div className="service-card__icon">
                  <Icon name={item.icon} size={28} color="var(--navy)" />
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="cta-banner">
            <div className="cta-banner__text">
              <h3>{t.cta.title}</h3>
              <p>{t.cta.desc}</p>
            </div>
            <Link to="/contact" className="cta-banner__btn">
              {t.nav.contact} <Icon name="arrowRight" size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
