import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import { api } from '../../context/AuthContext';
import Icon from '../../components/icons';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const ta = t.admin;
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/stats'),
      api.get('/leads?limit=5'),
      api.get('/properties/admin/all?limit=5'),
    ]).then(([s, l, p]) => {
      setStats(s.data);
      setLeads(l.data.leads || []);
      setProperties(p.data.properties || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard">
      <div className="dash-header">
        <div>
          <h1>{ta.greeting(user?.name?.split(' ')[0] || '')}</h1>
          <p>{ta.greetingSub}</p>
        </div>
        <Link to="/admin/properties/new" className="dash-btn">
          <Icon name="plus" size={16} /> {ta.newProperty}
        </Link>
      </div>

      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi__label">{ta.kpi.activeProperties}</div>
          <div className="kpi__value">{loading ? '—' : stats?.totalProperties ?? 0}</div>
          <div className="kpi__delta"><Icon name="home" size={14} /> {ta.kpi.available} : {stats?.availableProperties ?? 0}</div>
        </div>
        <div className="kpi">
          <div className="kpi__label">{ta.kpi.openLeads}</div>
          <div className="kpi__value kpi__value--gold">{loading ? '—' : stats?.newLeads ?? 0}</div>
          <div className="kpi__delta"><Icon name="bell" size={14} /> {ta.kpi.total} : {stats?.totalLeads ?? 0}</div>
        </div>
        <div className="kpi">
          <div className="kpi__label">{ta.kpi.featured}</div>
          <div className="kpi__value">{loading ? '—' : stats?.featuredProperties?.length ?? 0}</div>
          <div className="kpi__delta"><Icon name="starFilled" size={14} color="var(--gold)" /> {ta.kpi.highlighted}</div>
        </div>
        <div className="kpi">
          <div className="kpi__label">{ta.kpi.conversionRate}</div>
          <div className="kpi__value">3.4%</div>
          <div className="kpi__delta kpi__delta--neg"><Icon name="chart" size={14} /> −0.2pt {ta.kpi.thisMonth}</div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="dash-card">
          <div className="dash-card__header">
            <h3>{ta.recentLeads}</h3>
            <Link to="/admin/leads" className="dash-card__link">{ta.viewAll}</Link>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>{ta.table.date}</th>
                <th>{ta.table.from}</th>
                <th>{ta.table.type}</th>
                <th>{ta.table.channel}</th>
                <th>{ta.table.status}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--slate)' }}>{t.common.loading}</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--slate)' }}>{ta.noLeads}</td></tr>
              ) : leads.map(lead => (
                <tr key={lead._id}>
                  <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                  <td><strong>{lead.name}</strong></td>
                  <td><span className="channel-badge">{ta.leadType[lead.type] || lead.type}</span></td>
                  <td><span className="channel-badge">{lead.channel}</span></td>
                  <td>
                    <span className={`pill ${lead.status === 'new' ? 'pill--gold' : lead.status === 'in_progress' ? 'pill--green' : 'pill--slate'}`}>
                      {ta.leadStatus[lead.status]}
                    </span>
                  </td>
                  <td>
                    <button className="table-action" onClick={() => navigate(`/admin/leads?id=${lead._id}`)}>
                      {t.common.edit}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="dash-card">
          <div className="dash-card__header">
            <h3>{ta.recentProperties}</h3>
            <Link to="/admin/properties" className="dash-card__link">{ta.viewAll}</Link>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>{ta.table.property}</th>
                <th>{ta.table.status}</th>
                <th>{ta.table.views}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: 24, color: 'var(--slate)' }}>{t.common.loading}</td></tr>
              ) : properties.map(p => (
                <tr key={p._id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.title?.fr}</div>
                    <div style={{ fontSize: 12, color: 'var(--slate)' }}>{p.neighbourhood}</div>
                  </td>
                  <td>
                    <span className={`pill ${p.status === 'available' ? 'pill--green' : p.status === 'reserved' ? 'pill--gold' : 'pill--slate'}`}>
                      {ta.propertyStatus[p.status]}
                    </span>
                  </td>
                  <td>{p.views}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
