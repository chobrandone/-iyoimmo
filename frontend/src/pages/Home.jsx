import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { api } from '../context/AuthContext';
import PropertyCard from '../components/PropertyCard';
import Icon from '../components/icons';
import './Home.css';

export default function Home() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('rent');
  const [neighbourhood, setNeighbourhood] = useState('');
  const [type, setType] = useState('');
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/properties?featured=true&limit=4')
      .then(r => setFeatured(r.data.properties || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({ intent: activeTab });
    if (neighbourhood) params.set('neighbourhood', neighbourhood);
    if (type) params.set('type', type);
    navigate(`/properties?${params}`);
  };

  return (
    <main className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero__bg" />
        <div className="hero__content">
          <span className="hero__pill">{t.hero.pill}</span>
          <h1 className="hero__title">{t.hero.title}</h1>
          <p className="hero__subtitle">{t.hero.subtitle}</p>

          <div className="search-box">
            <div className="search-box__tabs">
              {['rent', 'buy', 'land'].map((tab) => (
                <button
                  key={tab}
                  className={`search-box__tab${activeTab === tab ? ' active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {t.hero.tabs[tab]}
                </button>
              ))}
            </div>
            <form className="search-box__form" onSubmit={handleSearch}>
              <div className="search-box__field">
                <label>{t.hero.fields.neighbourhood}</label>
                <input
                  value={neighbourhood}
                  onChange={e => setNeighbourhood(e.target.value)}
                  placeholder={t.hero.placeholders.neighbourhood}
                />
              </div>
              <div className="search-box__divider" />
              <div className="search-box__field">
                <label>{t.hero.fields.type}</label>
                <select value={type} onChange={e => setType(e.target.value)}>
                  <option value="">{t.hero.placeholders.type}</option>
                  {Object.entries(t.filters.types).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="search-box__btn">
                <Icon name="search" size={18} /> {t.hero.search}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="section">
        <div className="container">
          <div className="section__header">
            <div>
              <h2>{t.featured.title}</h2>
              <p className="section__sub">{t.featured.subtitle}</p>
            </div>
            <Link to="/properties" className="section__link">{t.featured.viewAll}</Link>
          </div>
          {loading ? (
            <div className="cards-grid">
              {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{height: 300, borderRadius: 14}} />)}
            </div>
          ) : (
            <div className="cards-grid">
              {featured.map(p => <PropertyCard key={p._id} property={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Intent Tiles */}
      <section className="section section--alt">
        <div className="container">
          <h2>{t.intent.title}</h2>
          <p className="section__sub">{t.intent.subtitle}</p>
          <div className="intent-grid">
            {['rent', 'buy', 'land'].map((intent) => (
              <Link key={intent} to={`/properties?intent=${intent}`} className={`intent-tile intent-tile--${intent}`}>
                <div>
                  <h3>{t.intent[intent].title}</h3>
                  <p>{t.intent[intent].desc}</p>
                </div>
                <Icon name="arrowRight" size={22} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why IYO */}
      <section className="section">
        <div className="container">
          <div className="section__header">
            <div>
              <h2>{t.why.title}</h2>
              <p className="section__sub">{t.why.subtitle}</p>
            </div>
          </div>
          <div className="why-grid">
            {t.why.items.map((item, i) => (
              <div key={i} className="why-card">
                <div className="why-card__icon">
                  <Icon name={['home', 'shield', 'globe'][i]} size={24} color="var(--navy)" />
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {t.about.stats.map((s, i) => (
              <div key={i} className="stat-item">
                <div className="stat-item__value">{s.value}</div>
                <div className="stat-item__label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="section section--alt">
        <div className="container">
          <div className="cta-banner">
            <div className="cta-banner__text">
              <h3>{t.cta.title}</h3>
              <p>{t.cta.desc}</p>
            </div>
            <Link to="/list-property" className="cta-banner__btn">
              {t.cta.btn} <Icon name="arrowRight" size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
