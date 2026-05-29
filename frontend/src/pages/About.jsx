import { useEffect, useState } from 'react';
import { useLang } from '../context/LanguageContext';
import { api } from '../context/AuthContext';
import Icon from '../components/icons';
import { assetUrl } from '../utils/url';
import './About.css';

export default function About() {
  const { t, lang } = useLang();
  const [team, setTeam] = useState([]);

  useEffect(() => {
    api.get('/team').then(r => setTeam(r.data || [])).catch(() => {});
  }, []);

  return (
    <main style={{ paddingTop: 68 }}>
      {/* Hero */}
      <section className="about-hero">
        <div className="container">
          <div className="about-hero__label">{t.about.hero.label}</div>
          <h1 className="about-hero__title">{t.about.hero.title}</h1>
          <p className="about-hero__subtitle">{t.about.hero.subtitle}</p>
        </div>
      </section>

      {/* Stats */}
      <section className="about-stats">
        <div className="container">
          <div className="about-stats__grid">
            {t.about.stats.map((s, i) => (
              <div key={i} className="about-stat">
                <div className="about-stat__value">{s.value}</div>
                <div className="about-stat__label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="section">
        <div className="container">
          <div className="about-story">
            <div className="about-story__text">
              <h2>{t.about.story.title}</h2>
              <p>{t.about.story.p1}</p>
              <p>{t.about.story.p2}</p>
            </div>
            <div className="about-story__visual">
              <div className="about-story__card">
                <Icon name="home" size={44} color="var(--navy)" />
                <div className="about-story__card-text">
                  {lang === 'fr'
                    ? "L'agence immobilière de confiance à Bangui depuis 2018."
                    : "The trusted real estate agency in Bangui since 2018."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section section--alt">
        <div className="container">
          <h2 className="section-title">{t.about.values.title}</h2>
          <div className="values-grid">
            {t.about.values.items.map((item, i) => (
              <div key={i} className="value-card">
                <div className="value-card__num">{String(i + 1).padStart(2, '0')}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section">
        <div className="container">
          <div className="team-header">
            <h2 className="section-title">{t.about.team}</h2>
            <p className="section-sub">
              {lang === 'fr'
                ? "Des professionnels passionnés au service de votre projet immobilier."
                : "Passionate professionals at the service of your real estate project."}
            </p>
          </div>
          <div className="team-grid">
            {team.map(member => (
              <div key={member._id} className="team-card">
                <div className="team-photo-wrap">
                  {member.photo ? (
                    <img
                      src={assetUrl(member.photo)}
                      alt={member.name}
                      className="team-photo"
                    />
                  ) : (
                    <div className="team-photo-placeholder">
                      <span className="team-photo-initial">{member.name?.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="team-card__info">
                  <div className="team-card__name">{member.name}</div>
                  <div className="team-card__role">{member.role?.fr || member.roleFr}</div>
                  <div className="team-card__contact">
                    {member.phone && (
                      <a href={`tel:${member.phone}`} className="team-card__contact-btn">
                        <Icon name="phone" size={14} />
                      </a>
                    )}
                    {member.email && (
                      <a href={`mailto:${member.email}`} className="team-card__contact-btn">
                        <Icon name="mail" size={14} />
                      </a>
                    )}
                    {member.phone && (
                      <a href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="team-card__contact-btn team-card__contact-btn--wa">
                        <Icon name="whatsapp" size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
