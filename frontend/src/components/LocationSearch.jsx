/**
 * LocationSearch — OpenStreetMap Nominatim autocomplete
 * Biased towards Central Africa (CAR, Cameroon, Congo, DRC, Chad, Gabon)
 * Free, no API key required.
 */
import { useState, useEffect, useRef, useCallback } from 'react';

// Country codes for Central Africa
const COUNTRY_CODES = 'cf,cg,cd,cm,ga,td,gq';

// Bangui bounding box for priority results
const VIEWBOX = '15.0,-5.5,28.0,11.0';

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export default function LocationSearch({ value, onChange, onSelect, placeholder = 'Rechercher un lieu...', className = '' }) {
  const [query, setQuery]         = useState(value || '');
  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [open, setOpen]           = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef              = useRef(null);
  const abortRef                  = useRef(null);

  // Sync external value changes (e.g. when editing an existing property)
  useEffect(() => { setQuery(value || ''); }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = useCallback(
    debounce(async (q) => {
      if (!q || q.length < 2) { setResults([]); setOpen(false); return; }

      // Cancel previous request
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      setLoading(true);
      try {
        const params = new URLSearchParams({
          q,
          format:          'json',
          addressdetails:  '1',
          limit:           '8',
          countrycodes:    COUNTRY_CODES,
          viewbox:         VIEWBOX,
          bounded:         '0',   // 0 = prefer viewbox but show outside if needed
        });

        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${params}`,
          {
            signal: abortRef.current.signal,
            headers: { 'Accept-Language': 'fr', 'User-Agent': 'IYOImmo/1.0' },
          }
        );
        const data = await res.json();
        setResults(data);
        setOpen(data.length > 0);
        setHighlighted(-1);
      } catch (err) {
        if (err.name !== 'AbortError') setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350),
    []
  );

  const handleInput = (e) => {
    const q = e.target.value;
    setQuery(q);
    onChange?.(q);
    search(q);
  };

  const handleSelect = (item) => {
    const addr = item.address || {};

    // Build a clean display name
    const parts = [
      addr.road || addr.pedestrian || addr.footway,
      addr.suburb || addr.neighbourhood || addr.quarter,
      addr.city || addr.town || addr.village || addr.county,
      addr.country,
    ].filter(Boolean);

    const displayName = parts.join(', ') || item.display_name;

    // Neighbourhood: suburb > neighbourhood > quarter > city district
    const neighbourhood =
      addr.suburb || addr.neighbourhood || addr.quarter ||
      addr.city_district || addr.borough || addr.district ||
      addr.city || addr.town || addr.village || '';

    // Address: road + house number if available
    const streetAddress = [addr.house_number, addr.road || addr.pedestrian].filter(Boolean).join(' ');

    setQuery(displayName);
    setOpen(false);
    onChange?.(displayName);
    onSelect?.({ displayName, neighbourhood, address: streetAddress, raw: item });
  };

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)); }
    if (e.key === 'Enter' && highlighted >= 0) { e.preventDefault(); handleSelect(results[highlighted]); }
    if (e.key === 'Escape') setOpen(false);
  };

  // Build a shorter label for the dropdown
  const shortLabel = (item) => {
    const addr = item.address || {};
    const main = addr.road || addr.suburb || addr.neighbourhood || addr.quarter || addr.amenity || item.name || '';
    const city = addr.city || addr.town || addr.village || addr.county || '';
    const country = addr.country || '';
    return [main, city, country].filter(Boolean).join(', ');
  };

  const typeIcon = (type) => {
    if (['city', 'town', 'village', 'suburb'].includes(type)) return '🏘';
    if (['road', 'street', 'residential'].includes(type))     return '🛣';
    if (type === 'administrative') return '🗺';
    return '📍';
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={className}
          style={{ width: '100%', paddingRight: 36, boxSizing: 'border-box' }}
        />
        {/* Icon */}
        <span style={{
          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
          pointerEvents: 'none', fontSize: 16,
        }}>
          {loading ? '⏳' : '🔍'}
        </span>
      </div>

      {open && results.length > 0 && (
        <ul style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: 'white', border: '1.5px solid var(--line)', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,.12)', zIndex: 9999,
          listStyle: 'none', margin: 0, padding: '6px 0',
          maxHeight: 280, overflowY: 'auto',
        }}>
          {results.map((item, i) => (
            <li
              key={item.place_id}
              onMouseDown={() => handleSelect(item)}
              style={{
                padding: '9px 14px', cursor: 'pointer', fontSize: 13,
                background: i === highlighted ? 'var(--bg, #f7f8fa)' : 'transparent',
                display: 'flex', alignItems: 'flex-start', gap: 10,
                borderBottom: i < results.length - 1 ? '1px solid var(--line)' : 'none',
              }}
              onMouseEnter={() => setHighlighted(i)}
            >
              <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{typeIcon(item.type)}</span>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--navy)' }}>
                  {(item.address?.road || item.address?.suburb || item.address?.neighbourhood || item.address?.city || item.name || '').slice(0, 60)}
                </div>
                <div style={{ color: 'var(--slate)', fontSize: 11, marginTop: 2 }}>
                  {shortLabel(item).slice(0, 80)}
                </div>
              </div>
            </li>
          ))}
          <li style={{ padding: '6px 14px 4px', fontSize: 10, color: 'var(--slate)', textAlign: 'right' }}>
            © OpenStreetMap contributors
          </li>
        </ul>
      )}
    </div>
  );
}
