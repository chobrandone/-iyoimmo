import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import Icon from '../../components/icons';
import toast from 'react-hot-toast';
import './AdminProperties.css';

const STATUS_CLASS = { available: 'pill--green', reserved: 'pill--gold', rented: 'pill--slate', sold: 'pill--slate' };

export default function AdminProperties() {
  const navigate = useNavigate();
  const { t } = useLang();
  const ta = t.admin;
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/properties/admin/all?page=${page}&limit=15`);
      setProperties(data.properties || []);
      setTotal(data.total || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchProperties(); }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette propriété ?')) return;
    setDeleting(id);
    try {
      await api.delete(`/properties/${id}`);
      toast.success('Propriété supprimée');
      fetchProperties();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
    setDeleting(null);
  };

  const togglePublished = async (property) => {
    try {
      await api.patch(`/properties/${property._id}`, { isPublished: !property.isPublished });
      fetchProperties();
    } catch {
      toast.error('Erreur');
    }
  };

  const filtered = search
    ? properties.filter(p => p.title?.fr?.toLowerCase().includes(search.toLowerCase()) || p.neighbourhood?.toLowerCase().includes(search.toLowerCase()))
    : properties;

  return (
    <div className="admin-section">
      <div className="admin-section__header">
        <div>
          <h1>{ta.properties}</h1>
          <p>{total} {ta.properties.toLowerCase()}</p>
        </div>
        <Link to="/admin/properties/new" className="dash-btn">
          <Icon name="plus" size={16} /> {ta.newProperty}
        </Link>
      </div>

      <div className="admin-toolbar">
        <div className="search-input">
          <Icon name="search" size={16} />
          <input placeholder={ta.searchPlaceholder} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="admin-card">
        <table className="admin-table full">
          <thead>
            <tr>
              <th>{ta.table.property}</th>
              <th>{ta.table.intent}</th>
              <th>{ta.table.price}</th>
              <th>{ta.table.status}</th>
              <th>{ta.table.views}</th>
              <th>{ta.table.published}</th>
              <th>{ta.table.actions}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="table-loading">Chargement...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="table-loading">{ta.noProperties}</td></tr>
            ) : filtered.map(p => (
              <tr key={p._id}>
                <td>
                  <div className="prop-cell">
                    <div className="prop-thumb">
                      {p.coverImage ? (
                        <img src={`http://localhost:5000${p.coverImage}`} alt="" />
                      ) : (
                        <Icon name="home" size={18} color="var(--slate)" />
                      )}
                    </div>
                    <div>
                      <div className="prop-title">{p.title?.fr}</div>
                      <div className="prop-sub">{p.neighbourhood} · {p.refId}</div>
                    </div>
                  </div>
                </td>
                <td><span className="channel-badge">{ta.intentLabel[p.intent]}</span></td>
                <td style={{ fontWeight: 700 }}>{p.price?.toLocaleString('fr-FR')} XAF</td>
                <td><span className={`pill ${STATUS_CLASS[p.status]}`}>{ta.propertyStatus[p.status]}</span></td>
                <td>{p.views}</td>
                <td>
                  <button
                    className={`toggle-btn${p.isPublished ? ' toggle-btn--on' : ''}`}
                    onClick={() => togglePublished(p)}
                    title={p.isPublished ? 'Dépublier' : 'Publier'}
                  >
                    {p.isPublished ? 'Oui' : 'Non'}
                  </button>
                </td>
                <td>
                  <div className="table-actions">
                    <button className="icon-btn" onClick={() => navigate(`/admin/properties/${p._id}/edit`)} title="Modifier">
                      <Icon name="edit" size={15} />
                    </button>
                    <button className="icon-btn icon-btn--danger" onClick={() => handleDelete(p._id)} disabled={deleting === p._id} title="Supprimer">
                      <Icon name="trash" size={15} />
                    </button>
                    <Link to={`/properties/${p._id}`} target="_blank" className="icon-btn" title="Voir">
                      <Icon name="eye" size={15} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > 15 && (
        <div className="pagination" style={{ marginTop: 20 }}>
          <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            <Icon name="chevronLeft" size={16} />
          </button>
          <span style={{ fontSize: 13, color: 'var(--slate)', padding: '0 12px' }}>Page {page}</span>
          <button className="page-btn" disabled={page * 15 >= total} onClick={() => setPage(p => p + 1)}>
            <Icon name="chevronRight" size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
