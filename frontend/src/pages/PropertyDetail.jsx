import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { api } from '../context/AuthContext';
import PropertyCard from '../components/PropertyCard';
import MapEmbed from '../components/MapEmbed';
import Icon from '../components/icons';
import { assetUrl } from '../utils/url';
import toast from 'react-hot-toast';
import './PropertyDetail.css';

const AMENITY_ICONS = {
  airConditioning: 'lightning', generator: 'lightning', waterTank: 'faucet',
  pool: 'pool', parking: 'car', security: 'shield', fibreInternet: 'wifi',
  equippedKitchen: 'home', garden: 'tree', furnished: 'layers',
};

export default function PropertyDetail() {
  const { id } = useParams();
  const { t, lang } = useLang();
  const [property, setProperty] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/properties/${id}`),
      api.get(`/properties/${id}/similar`),
    ]).then(([pRes, sRes]) => {
      setProperty(pRes.data);
      setSimilar(sRes.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [id]);

  const handleVisitRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/leads', {
        type: 'visit_request',
        name: form.name,
        phone: form.phone,
        message: form.message,
        property: id,
        channel: 'form',
      });
      toast.success(t.common.save);
      setForm({ name: '', phone: '', message: '' });
    } catch {
      toast.error(t.common.error);
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div style={{ paddingTop: 100, display: 'flex', justifyContent: 'center' }}>
      <div className="loader-spin" />
    </div>
  );
  if (!property) return <div style={{ paddingTop: 100, textAlign: 'center' }}><h2>404</h2></div>;

  const title = property.title?.[lang] || property.title?.fr || '';
  const description = property.description?.[lang] || property.description?.fr || '';
  const price = property.price?.toLocaleString('fr-FR');
  const isRent = property.priceUnit === 'month';
  const agent = property.agent;
  const images = property.images || [];
  const activeAmenities = Object.entries(property.amenities || {}).filter(([, v]) => v);
  const statusColor = { available: 'green', reserved: 'gold', rented: 'slate', sold: 'slate' }[property.status] || 'slate';

  const waMessage = encodeURIComponent(`Bonjour, je suis intéressé(e) par ${title} (${property.refId})`);
  const waUrl = `https://wa.me/23672637171?text=${waMessage}`;

  return (
    <main className="detail-page" style={{ paddingTop: 68 }}>
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Accueil</Link>
          <Icon name="chevronRight" size={12} />
          <Link to={`/properties?intent=${property.intent}`}>{t.hero.tabs[property.intent]}</Link>
          <Icon name="chevronRight" size={12} />
          <span>{property.neighbourhood}</span>
          <Icon name="chevronRight" size={12} />
          <span className="breadcrumb__current">{title}</span>
        </div>

        {/* Gallery */}
        <div className="gallery">
          <div className="gallery__main">
            {images.length > 0 ? (
              <img src={assetUrl(images[activeImg])} alt={title} className="gallery__main-img" />
            ) : (
              <div className="gallery__placeholder">
                <Icon name={property.type === 'land' ? 'tree' : 'home'} size={64} color="rgba(255,255,255,.35)" />
              </div>
            )}
          </div>
          <div className="gallery__thumbs">
            {images.slice(1, 5).map((img, i) => (
              <button key={i} className={`gallery__thumb${activeImg === i + 1 ? ' gallery__thumb--active' : ''}`} onClick={() => setActiveImg(i + 1)}>
                <img src={assetUrl(img)} alt="" />
                {i === 3 && images.length > 5 && (
                  <div className="gallery__more">+{images.length - 5}</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Detail grid */}
        <div className="detail-grid">
          <div className="detail-main">
            <h1>{title}</h1>
            <div className="detail-meta">
              <Icon name="pin" size={14} /> {property.neighbourhood}, Bangui
              {property.refId && <> · {t.property.ref} {property.refId}</>}
            </div>

            <div className="detail-price-row">
              <div className="detail-price">
                {price} <span>XAF{isRent ? ` ${t.property.perMonth}` : ''}</span>
              </div>
              <div className="detail-price-actions">
                <span className={`status-badge status-badge--${statusColor}`}>{t.status[property.status]}</span>
                <button className="icon-action"><Icon name="heart" size={18} /></button>
                <button className="icon-action"><Icon name="share" size={18} /></button>
              </div>
            </div>

            {/* Specs */}
            <div className="specs-row">
              {property.type !== 'land' && (
                <>
                  <div className="spec-item">
                    <Icon name="bed" size={20} color="var(--navy)" />
                    <div className="spec-item__value">{property.specs?.bedrooms}</div>
                    <div className="spec-item__key">{t.property.bedrooms}</div>
                  </div>
                  <div className="spec-item">
                    <Icon name="bath" size={20} color="var(--navy)" />
                    <div className="spec-item__value">{property.specs?.bathrooms}</div>
                    <div className="spec-item__key">{t.property.bathrooms}</div>
                  </div>
                </>
              )}
              {property.specs?.area && (
                <div className="spec-item">
                  <Icon name="ruler" size={20} color="var(--navy)" />
                  <div className="spec-item__value">{property.specs.area}</div>
                  <div className="spec-item__key">{t.property.area}</div>
                </div>
              )}
              {property.specs?.parking > 0 && (
                <div className="spec-item">
                  <Icon name="car" size={20} color="var(--navy)" />
                  <div className="spec-item__value">{property.specs.parking}</div>
                  <div className="spec-item__key">{t.property.parking}</div>
                </div>
              )}
              {property.specs?.yearBuilt && (
                <div className="spec-item">
                  <Icon name="building" size={20} color="var(--navy)" />
                  <div className="spec-item__value">{property.specs.yearBuilt}</div>
                  <div className="spec-item__key">{t.property.year}</div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="desc-block">
              <h3>{t.property.description}</h3>
              <p>{description}</p>
            </div>

            {/* Amenities */}
            {activeAmenities.length > 0 && (
              <div className="desc-block">
                <h3>{t.property.amenities}</h3>
                <div className="amenity-grid">
                  {activeAmenities.map(([key]) => (
                    <div key={key} className="amenity-item">
                      <Icon name={AMENITY_ICONS[key] || 'check'} size={16} color="var(--forest)" />
                      {t.filters.amenityList[key]}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="desc-block">
              <h3>{t.property.location}</h3>
              <MapEmbed
                query={[property.address, property.neighbourhood, 'Bangui'].filter(Boolean).join(', ')}
                height={320}
                zoom={15}
              />
              {property.nearby && (
                <p className="nearby-text" style={{ marginTop: 10 }}>
                  <strong>{t.property.nearby} :</strong> {property.nearby}
                </p>
              )}
            </div>
          </div>

          {/* Agent sticky card */}
          <aside className="agent-card">
            {agent && (
              <div className="agent-header">
                <div className="agent-avatar">
                  {agent.avatar ? (
                    <img src={assetUrl(agent.avatar)} alt={agent.name} />
                  ) : (
                    <span>{agent.name?.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <div className="agent-name">{agent.name}</div>
                  <div className="agent-role">{t.property.yourAgent}</div>
                </div>
              </div>
            )}

            <a href={waUrl} target="_blank" rel="noreferrer" className="wa-btn">
              <Icon name="whatsapp" size={18} /> {t.property.whatsapp}
            </a>

            <div className="agent-quick-btns">
              {agent?.phone && (
                <a href={`tel:${agent.phone}`} className="agent-quick-btn">
                  <Icon name="phone" size={16} /> {t.property.call}
                </a>
              )}
              {agent?.email && (
                <a href={`mailto:${agent.email}`} className="agent-quick-btn">
                  <Icon name="mail" size={16} /> {t.property.email}
                </a>
              )}
            </div>

            <div className="visit-form">
              <h4>{t.property.requestVisit}</h4>
              <form onSubmit={handleVisitRequest}>
                <input required placeholder="Votre nom" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                <input required placeholder="+236 ..." value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                <textarea rows={2} placeholder={t.property.visitQuestion} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? '...' : t.property.sendRequest}
                </button>
              </form>
              <p className="reply-time"><Icon name="checkCircle" size={13} /> {t.property.replyTime}</p>
            </div>
          </aside>
        </div>

        {/* Similar */}
        {similar.length > 0 && (
          <div className="similar-section">
            <h2>{t.property.similar}</h2>
            <div className="similar-grid">
              {similar.map(p => <PropertyCard key={p._id} property={p} />)}
            </div>
          </div>
        )}
      </div>

      {/* Mobile sticky CTA */}
      <div className="mobile-cta">
        <a href={waUrl} target="_blank" rel="noreferrer" className="mobile-cta__btn mobile-cta__btn--wa">
          <Icon name="whatsapp" size={18} /> WhatsApp
        </a>
        {agent?.phone && (
          <a href={`tel:${agent.phone}`} className="mobile-cta__btn mobile-cta__btn--call">
            <Icon name="phone" size={18} /> {t.property.call}
          </a>
        )}
      </div>
    </main>
  );
}
