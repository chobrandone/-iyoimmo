/**
 * MapEmbed — embeds a real OpenStreetMap tile map for a given location.
 * Free, no API key. Geocodes via Nominatim then renders OSM iframe.
 *
 * Props:
 *   query   — search string, e.g. "Boy-Rabe, Bangui"
 *   lat/lon — optional: skip geocoding and show these coords directly
 *   height  — iframe height in px (default 320)
 *   zoom    — map zoom level (default 15)
 */
import { useState, useEffect, useRef } from 'react';

const NOMINATIM = 'https://nominatim.openstreetmap.org/search';

export default function MapEmbed({ query, lat: propLat, lon: propLon, height = 320, zoom = 15 }) {
  const [coords, setCoords] = useState(
    propLat && propLon ? { lat: propLat, lon: propLon } : null
  );
  const [loading, setLoading] = useState(!propLat);
  const [error, setError]     = useState(false);
  const abortRef = useRef(null);

  useEffect(() => {
    // If coords supplied directly, skip geocoding
    if (propLat && propLon) {
      setCoords({ lat: propLat, lon: propLon });
      setLoading(false);
      return;
    }
    if (!query) return;

    setLoading(true);
    setError(false);

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    const params = new URLSearchParams({
      q:           query,
      format:      'json',
      limit:       '1',
      countrycodes: 'cf,cg,cd,cm,ga,td',
    });

    fetch(`${NOMINATIM}?${params}`, {
      signal:  abortRef.current.signal,
      headers: { 'Accept-Language': 'fr', 'User-Agent': 'IYOImmo/1.0' },
    })
      .then(r => r.json())
      .then(data => {
        if (data?.[0]) {
          setCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
        } else {
          // Fall back to Bangui city centre
          setCoords({ lat: 4.3612, lon: 18.5550 });
        }
      })
      .catch(err => { if (err.name !== 'AbortError') setError(true); })
      .finally(() => setLoading(false));
  }, [query, propLat, propLon]);

  // Build the OSM embed URL
  const iframeSrc = coords ? (() => {
    const delta = zoom >= 15 ? 0.008 : zoom >= 13 ? 0.04 : 0.2;
    const bbox = [
      coords.lon - delta,
      coords.lat - delta,
      coords.lon + delta,
      coords.lat + delta,
    ].join(',');
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coords.lat},${coords.lon}`;
  })() : null;

  const containerStyle = {
    width: '100%', height, borderRadius: 12,
    overflow: 'hidden', position: 'relative',
    background: '#e8edf2',
    border: '1.5px solid var(--line)',
  };

  if (loading) return (
    <div style={{ ...containerStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--slate)' }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--line)', borderTopColor: 'var(--navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ fontSize: 13 }}>Chargement de la carte…</span>
    </div>
  );

  if (error) return (
    <div style={{ ...containerStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--slate)' }}>
      <span style={{ fontSize: 28 }}>🗺</span>
      <span style={{ fontSize: 13 }}>Carte indisponible</span>
    </div>
  );

  return (
    <div style={containerStyle}>
      <iframe
        title={`Carte — ${query || 'Bangui'}`}
        src={iframeSrc}
        width="100%"
        height={height}
        style={{ border: 'none', display: 'block' }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      {/* OSM attribution link */}
      <a
        href={`https://www.openstreetmap.org/?mlat=${coords?.lat}&mlon=${coords?.lon}#map=${zoom}/${coords?.lat}/${coords?.lon}`}
        target="_blank"
        rel="noreferrer"
        style={{
          position: 'absolute', bottom: 6, right: 8,
          fontSize: 10, color: '#333',
          background: 'rgba(255,255,255,.85)', padding: '2px 6px', borderRadius: 4,
          textDecoration: 'none',
        }}
      >
        Agrandir ↗
      </a>
    </div>
  );
}
