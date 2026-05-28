import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { api } from '../context/AuthContext';
import PropertyCard from '../components/PropertyCard';
import Icon from '../components/icons';
import './Listings.css';

const NEIGHBOURHOODS = ['Boy-Rabe', 'Sica 1', 'Sica 2', 'Lakouanga', 'Galabadja', 'Combattant', 'Centre-ville', 'Miskine'];
const AMENITY_KEYS = ['airConditioning', 'generator', 'waterTank', 'pool', 'parking', 'security', 'fibreInternet', 'equippedKitchen'];

export default function Listings() {
  const { t } = useLang();
  const [params, setParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const intent = params.get('intent') || '';
  const page = parseInt(params.get('page') || '1');
  const sort = params.get('sort') || '-createdAt';

  const [filters, setFilters] = useState({
    type: params.get('type') || '',
    neighbourhood: params.get('neighbourhood') || '',
    minPrice: params.get('minPrice') || '',
    maxPrice: params.get('maxPrice') || '',
    bedrooms: params.get('bedrooms') || '',
    amenities: params.get('amenities') || '',
  });

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (intent) q.set('intent', intent);
      if (sort) q.set('sort', sort);
      q.set('page', page);
      q.set('limit', 12);
      Object.entries(filters).forEach(([k, v]) => { if (v) q.set(k, v); });
      const { data } = await api.get(`/properties?${q}`);
      setProperties(data.properties || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch {}
    setLoading(false);
  }, [intent, page, sort, filters]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const applyFilters = () => {
    const newParams = new URLSearchParams(params);
    Object.entries(filters).forEach(([k, v]) => {
      if (v) newParams.set(k, v); else newParams.delete(k);
    });
    newParams.set('page', '1');
    setParams(newParams);
    setSidebarOpen(false);
  };

  const resetFilters = () => {
    setFilters({ type: '', neighbourhood: '', minPrice: '', maxPrice: '', bedrooms: '', amenities: '' });
    const newParams = new URLSearchParams();
    if (intent) newParams.set('intent', intent);
    setParams(newParams);
  };

  const setSort = (s) => {
    const newParams = new URLSearchParams(params);
    newParams.set('sort', s);
    newParams.set('page', '1');
    setParams(newParams);
  };

  const setPage = (p) => {
    const newParams = new URLSearchParams(params);
    newParams.set('page', p);
    setParams(newParams);
    window.scrollTo(0, 0);
  };

  const toggleAmenity = (key) => {
    const current = filters.amenities ? filters.amenities.split(',') : [];
    const next = current.includes(key) ? current.filter(k => k !== key) : [...current, key];
    setFilters(f => ({ ...f, amenities: next.join(',') }));
  };

  return (
    <main className="listings-page" style={{ paddingTop: 68 }}>
      {/* Top filter bar */}
      <div className="filter-bar container">
        <div className="filter-bar__chips">
          {['', 'rent', 'buy', 'land'].map((i) => (
            <button
              key={i || 'all'}
              className={`chip${intent === i ? ' chip--active' : ''}`}
              onClick={() => { const n = new URLSearchParams(); if (i) n.set('intent', i); setParams(n); }}
            >
              {i ? t.hero.tabs[i] : (t.filters.title)}
            </button>
          ))}
        </div>
        <div className="filter-bar__right">
          <button className="chip chip--filter" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Icon name="filter" size={14} /> {t.filters.title}
          </button>
          <select
            className="sort-select"
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            {Object.entries(t.listings.sortOptions).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="listings-layout container">
        {/* Sidebar */}
        <aside className={`filter-sidebar${sidebarOpen ? ' filter-sidebar--open' : ''}`}>
          <div className="filter-sidebar__header">
            <h3>{t.filters.title}</h3>
            <button onClick={() => setSidebarOpen(false)} className="sidebar-close"><Icon name="x" size={18} /></button>
          </div>

          <div className="filter-group">
            <label className="filter-group__label">{t.filters.propertyType}</label>
            <div className="filter-group__options">
              {Object.entries(t.filters.types).map(([k, v]) => (
                <label key={k} className="checkbox-label">
                  <input type="checkbox" checked={filters.type === k} onChange={() => setFilters(f => ({ ...f, type: f.type === k ? '' : k }))} />
                  {v}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-group__label">{t.filters.neighbourhood}</label>
            <div className="filter-group__options">
              {NEIGHBOURHOODS.map(n => (
                <label key={n} className="checkbox-label">
                  <input type="checkbox" checked={filters.neighbourhood === n} onChange={() => setFilters(f => ({ ...f, neighbourhood: f.neighbourhood === n ? '' : n }))} />
                  {n}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-group__label">{t.filters.budget}</label>
            <div className="price-range">
              <input type="number" placeholder={t.filters.minPrice} value={filters.minPrice} onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))} />
              <span>–</span>
              <input type="number" placeholder={t.filters.maxPrice} value={filters.maxPrice} onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))} />
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-group__label">{t.filters.bedrooms}</label>
            <div className="bed-chips">
              {['1', '2', '3', '4'].map(n => (
                <button key={n} className={`chip${filters.bedrooms === n ? ' chip--active' : ''}`} onClick={() => setFilters(f => ({ ...f, bedrooms: f.bedrooms === n ? '' : n }))}>
                  {n}{n === '4' ? '+' : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-group__label">{t.filters.amenities}</label>
            <div className="filter-group__options">
              {AMENITY_KEYS.map(k => (
                <label key={k} className="checkbox-label">
                  <input type="checkbox" checked={filters.amenities.split(',').includes(k)} onChange={() => toggleAmenity(k)} />
                  {t.filters.amenityList[k]}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-sidebar__actions">
            <button className="btn-ghost" onClick={resetFilters}>{t.filters.reset}</button>
            <button className="btn-primary" onClick={applyFilters}>{t.filters.apply}</button>
          </div>
        </aside>

        {/* Results */}
        <div className="listings-results">
          <div className="results-header">
            <h2>
              {loading ? '...' : `${total} ${t.listings.title(total, intent).split(' ').slice(1).join(' ')}`}
            </h2>
          </div>

          {loading ? (
            <div className="results-grid">
              {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{height: 320, borderRadius: 14}} />)}
            </div>
          ) : properties.length === 0 ? (
            <div className="empty-state">
              <Icon name="search" size={48} color="var(--line)" />
              <h3>{t.listings.empty}</h3>
              <p>{t.listings.emptyHint}</p>
              <Link to="/contact" className="btn-primary">{t.nav.contact}</Link>
            </div>
          ) : (
            <div className="results-grid">
              {properties.map(p => <PropertyCard key={p._id} property={p} />)}
            </div>
          )}

          {pages > 1 && (
            <div className="pagination">
              <button className="page-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <Icon name="chevronLeft" size={16} />
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`page-btn${page === p ? ' page-btn--active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="page-btn" disabled={page >= pages} onClick={() => setPage(page + 1)}>
                <Icon name="chevronRight" size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
