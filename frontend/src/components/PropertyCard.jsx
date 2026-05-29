import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import Icon from './icons';
import { assetUrl } from '../utils/url';
import './PropertyCard.css';

const STATUS_COLORS = { available: 'green', reserved: 'gold', rented: 'slate', sold: 'slate' };

const AptPlaceholder = ({ type }) => {
  const icons = { land: '🌿', apartment: '🏢', commercial: '🏪' };
  const emoji = icons[type] || '🏡';
  return (
    <div className="pcard__placeholder">
      <div className="pcard__placeholder-building">
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="pcard__placeholder-svg">
          {type === 'land' ? (
            <>
              <rect x="0" y="100" width="200" height="60" fill="rgba(255,255,255,0.08)"/>
              <path d="M0 100 Q50 75 100 95 Q150 115 200 90 L200 160 L0 160Z" fill="rgba(255,255,255,0.12)"/>
              <circle cx="40" cy="85" r="18" fill="rgba(255,255,255,0.1)"/>
              <circle cx="160" cy="90" r="14" fill="rgba(255,255,255,0.1)"/>
            </>
          ) : type === 'apartment' ? (
            <>
              <rect x="55" y="30" width="90" height="130" rx="3" fill="rgba(255,255,255,0.12)"/>
              <rect x="65" y="42" width="18" height="18" rx="2" fill="rgba(255,255,255,0.2)"/>
              <rect x="90" y="42" width="18" height="18" rx="2" fill="rgba(255,255,255,0.2)"/>
              <rect x="115" y="42" width="18" height="18" rx="2" fill="rgba(255,255,255,0.2)"/>
              <rect x="65" y="70" width="18" height="18" rx="2" fill="rgba(255,255,255,0.2)"/>
              <rect x="90" y="70" width="18" height="18" rx="2" fill="rgba(255,255,255,0.35)"/>
              <rect x="115" y="70" width="18" height="18" rx="2" fill="rgba(255,255,255,0.2)"/>
              <rect x="65" y="98" width="18" height="18" rx="2" fill="rgba(255,255,255,0.2)"/>
              <rect x="90" y="98" width="18" height="18" rx="2" fill="rgba(255,255,255,0.2)"/>
              <rect x="115" y="98" width="18" height="18" rx="2" fill="rgba(255,255,255,0.2)"/>
              <rect x="84" y="128" width="32" height="32" rx="2" fill="rgba(255,255,255,0.18)"/>
            </>
          ) : (
            <>
              <rect x="30" y="80" width="140" height="80" rx="2" fill="rgba(255,255,255,0.1)"/>
              <polygon points="20,80 100,28 180,80" fill="rgba(255,255,255,0.15)"/>
              <rect x="48" y="95" width="22" height="22" rx="2" fill="rgba(255,255,255,0.22)"/>
              <rect x="89" y="95" width="22" height="22" rx="2" fill="rgba(255,255,255,0.22)"/>
              <rect x="130" y="95" width="22" height="22" rx="2" fill="rgba(255,255,255,0.22)"/>
              <rect x="82" y="125" width="36" height="35" rx="2" fill="rgba(255,255,255,0.18)"/>
              <circle cx="100" cy="56" r="6" fill="rgba(217,165,33,0.7)"/>
            </>
          )}
        </svg>
      </div>
    </div>
  );
};

export default function PropertyCard({ property, compact = false }) {
  const { t, lang } = useLang();
  if (!property) return null;

  const title = property.title?.[lang] || property.title?.fr || '';
  const status = property.status || 'available';
  const statusLabel = t.status[status] || status;
  const statusColor = STATUS_COLORS[status] || 'slate';
  const price = property.price?.toLocaleString('fr-FR');
  const isRent = property.priceUnit === 'month';
  const cover = property.coverImage
    ? assetUrl(property.coverImage)
    : (property.images?.[0] ? assetUrl(property.images[0]) : null);

  return (
    <Link to={`/properties/${property._id}`} className={`pcard${compact ? ' pcard--compact' : ''}`}>
      <div className="pcard__cover">
        {cover ? (
          <img src={cover} alt={title} className="pcard__img" loading="lazy" />
        ) : (
          <AptPlaceholder type={property.type} />
        )}
        <span className={`pcard__badge pcard__badge--${statusColor}`}>{statusLabel}</span>
        <button className="pcard__heart" onClick={(e) => e.preventDefault()} aria-label="Save">
          <Icon name="heart" size={15} />
        </button>
        {property.isFeatured && (
          <span className="pcard__featured-badge">
            <Icon name="starFilled" size={10} /> {t.status.featured}
          </span>
        )}
      </div>

      <div className="pcard__body">
        <div className="pcard__price">
          {price} <span className="pcard__price-unit">XAF{isRent ? ` ${t.property.perMonth}` : ''}</span>
        </div>
        <div className="pcard__title">{title}</div>
        <div className="pcard__loc">
          <Icon name="pin" size={12} /> {property.neighbourhood}, Bangui
        </div>
        {!compact && (
          <div className="pcard__specs">
            {property.type !== 'land' && property.specs?.bedrooms > 0 && (
              <span><Icon name="bed" size={13} /> {property.specs.bedrooms}</span>
            )}
            {property.type !== 'land' && property.specs?.bathrooms > 0 && (
              <span><Icon name="bath" size={13} /> {property.specs.bathrooms}</span>
            )}
            {property.specs?.area && (
              <span><Icon name="ruler" size={13} /> {property.specs.area} m²</span>
            )}
            {property.specs?.parking > 0 && (
              <span><Icon name="car" size={13} /> {property.specs.parking}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
