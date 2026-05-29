import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import Icon from '../../components/icons';
import { assetUrl } from '../../utils/url';
import toast from 'react-hot-toast';
import './AdminProperties.css';
import './AdminLeads.css';

export default function AdminLeads() {
  const { t, lang } = useLang();
  const ta = t.admin;
  const [searchParams] = useSearchParams();
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [approving, setApproving] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (typeFilter) params.set('type', typeFilter);
      params.set('limit', 30);
      const { data } = await api.get(`/leads?${params}`);
      setLeads(data.leads || []);
      setTotal(data.total || 0);

      // Auto-select lead from URL param
      const idParam = searchParams.get('id');
      if (idParam) {
        const found = (data.leads || []).find(l => l._id === idParam);
        if (found) setSelected(found);
      }
    } catch {}
    setLoading(false);
  }, [statusFilter, typeFilter, searchParams]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const updateStatus = async (id, status) => {
    try {
      const updated = await api.patch(`/leads/${id}`, { status });
      setLeads(ls => ls.map(l => l._id === id ? { ...l, status } : l));
      if (selected?._id === id) setSelected(s => ({ ...s, status }));
      toast.success(ta.leadStatus[status]);
    } catch { toast.error(t.common.error); }
  };

  const handleApprove = async (lead) => {
    if (!window.confirm(ta.approveConfirm)) return;
    setApproving(true);
    try {
      await api.post(`/leads/${lead._id}/approve`);
      toast.success(ta.approveSuccess);
      await fetchLeads();
      setSelected(null);
    } catch (err) {
      toast.error(err.response?.data?.message || ta.approveError);
    }
    setApproving(false);
  };

  const sub = selected?.submissionData || {};
  const subImages = Array.isArray(sub.images) ? sub.images : [];
  const isSubmission = selected?.type === 'property_submission';
  const isAlreadyApproved = selected?.approvedPropertyId;

  return (
    <div className="admin-section">
      <div className="admin-section__header">
        <div>
          <h1>{ta.leads}</h1>
          <p>{total} {ta.leads.toLowerCase()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-toolbar" style={{ flexWrap: 'wrap', gap: 8 }}>
        {/* Status */}
        <div style={{ display: 'flex', gap: 6 }}>
          {['', 'new', 'in_progress', 'closed'].map(s => (
            <button
              key={s}
              className={`chip${statusFilter === s ? ' chip--active' : ''}`}
              onClick={() => { setStatusFilter(s); setSelected(null); }}
            >
              {s ? ta.leadStatus[s] : ta.filterAll}
            </button>
          ))}
        </div>
        {/* Type */}
        <div style={{ display: 'flex', gap: 6 }}>
          {['', 'inquiry', 'visit_request', 'property_submission', 'contact'].map(tp => (
            <button
              key={tp}
              className={`chip${typeFilter === tp ? ' chip--active' : ''}`}
              onClick={() => { setTypeFilter(tp); setSelected(null); }}
            >
              {tp ? ta.leadType[tp] : ta.filterAll}
            </button>
          ))}
        </div>
      </div>

      <div className={`leads-layout${selected ? ' leads-layout--split' : ''}`}>
        {/* Table */}
        <div className="admin-card leads-table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{ta.table.date}</th>
                <th>{ta.table.name}</th>
                <th>{ta.table.type}</th>
                <th>{ta.table.channel}</th>
                <th>{ta.table.status}</th>
                <th>{ta.table.actions}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="table-loading">{t.common.loading}</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={6} className="table-loading">{ta.noLeads}</td></tr>
              ) : leads.map(lead => (
                <tr
                  key={lead._id}
                  className={`lead-row${selected?._id === lead._id ? ' lead-row--active' : ''}${lead.type === 'property_submission' ? ' lead-row--submission' : ''}`}
                  onClick={() => setSelected(selected?._id === lead._id ? null : lead)}
                >
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div>{new Date(lead.createdAt).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB')}</div>
                    <div style={{ fontSize: 11, color: 'var(--slate)' }}>
                      {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{lead.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--slate)' }}>{lead.phone || lead.email}</div>
                  </td>
                  <td>
                    <span className={`type-badge${lead.type === 'property_submission' ? ' type-badge--sub' : ''}`}>
                      {lead.type === 'property_submission' && <Icon name="home" size={11} />}
                      {ta.leadType[lead.type] || lead.type}
                    </span>
                  </td>
                  <td><span className="channel-badge">{lead.channel}</span></td>
                  <td>
                    <span className={`pill ${lead.status === 'new' ? 'pill--gold' : lead.status === 'in_progress' ? 'pill--green' : 'pill--slate'}`}>
                      {ta.leadStatus[lead.status]}
                    </span>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="table-actions">
                      {lead.phone && (
                        <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="icon-btn" title="WhatsApp">
                          <Icon name="whatsapp" size={14} />
                        </a>
                      )}
                      {lead.status === 'new' && (
                        <button className="icon-btn" onClick={() => updateStatus(lead._id, 'in_progress')} title={ta.markInProgress}>
                          <Icon name="refresh" size={14} />
                        </button>
                      )}
                      {lead.status !== 'closed' && (
                        <button className="icon-btn" onClick={() => updateStatus(lead._id, 'closed')} title={ta.markClosed}>
                          <Icon name="check" size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="lead-detail-panel">
            <div className="lead-detail-header">
              <h3>{ta.detail.title}</h3>
              <button className="icon-btn" onClick={() => setSelected(null)}><Icon name="x" size={16} /></button>
            </div>

            <div className="lead-detail-body">
              {/* Status + quick actions */}
              <div className="lead-status-bar">
                <span className={`pill pill--lg ${selected.status === 'new' ? 'pill--gold' : selected.status === 'in_progress' ? 'pill--green' : 'pill--slate'}`}>
                  {ta.leadStatus[selected.status]}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {selected.status === 'new' && (
                    <button className="action-chip" onClick={() => updateStatus(selected._id, 'in_progress')}>
                      <Icon name="refresh" size={13} /> {ta.markInProgress}
                    </button>
                  )}
                  {selected.status !== 'closed' && (
                    <button className="action-chip" onClick={() => updateStatus(selected._id, 'closed')}>
                      <Icon name="check" size={13} /> {ta.markClosed}
                    </button>
                  )}
                </div>
              </div>

              {/* Contact info */}
              <div className="detail-section">
                <div className="detail-section__title">{ta.detail.contactInfo}</div>
                <div className="detail-rows">
                  <div className="detail-row"><span>{ta.detail.name}</span><strong>{selected.name}</strong></div>
                  {selected.phone && <div className="detail-row"><span>{ta.detail.phone}</span><a href={`tel:${selected.phone}`}>{selected.phone}</a></div>}
                  {selected.email && <div className="detail-row"><span>{ta.detail.email}</span><a href={`mailto:${selected.email}`}>{selected.email}</a></div>}
                  <div className="detail-row"><span>{ta.detail.type}</span><span className="channel-badge">{ta.leadType[selected.type]}</span></div>
                  <div className="detail-row"><span>{ta.detail.channel}</span><span className="channel-badge">{selected.channel}</span></div>
                  {selected.subject && <div className="detail-row"><span>{ta.detail.subject}</span><strong>{selected.subject}</strong></div>}
                </div>
                {selected.message && (
                  <div className="detail-message">
                    <div className="detail-message__label">{ta.detail.message}</div>
                    <p>{selected.message}</p>
                  </div>
                )}
              </div>

              {/* Property submission details */}
              {isSubmission && (
                <>
                  <div className="detail-section">
                    <div className="detail-section__title">{ta.detail.submissionData}</div>
                    <div className="detail-rows">
                      {sub.intent && <div className="detail-row"><span>{ta.detail.submissionFields.intent}</span><strong>{ta.intentLabel[sub.intent] || sub.intent}</strong></div>}
                      {sub.type && <div className="detail-row"><span>{ta.detail.submissionFields.propType}</span><strong>{t.filters.types[sub.type] || sub.type}</strong></div>}
                      {sub.neighbourhood && <div className="detail-row"><span>{ta.detail.submissionFields.neighbourhood}</span><strong>{sub.neighbourhood}</strong></div>}
                      {sub.price && <div className="detail-row"><span>{ta.detail.submissionFields.price}</span><strong>{parseFloat(sub.price).toLocaleString('fr-FR')} XAF</strong></div>}
                      {sub.priceUnit && <div className="detail-row"><span>{ta.detail.submissionFields.priceUnit}</span><strong>{sub.priceUnit === 'month' ? t.property.perMonth : 'Total'}</strong></div>}
                      {sub.bedrooms > 0 && <div className="detail-row"><span>{ta.detail.submissionFields.bedrooms}</span><strong>{sub.bedrooms}</strong></div>}
                      {sub.bathrooms > 0 && <div className="detail-row"><span>{ta.detail.submissionFields.bathrooms}</span><strong>{sub.bathrooms}</strong></div>}
                      {sub.area && <div className="detail-row"><span>{ta.detail.submissionFields.area}</span><strong>{sub.area} m²</strong></div>}
                    </div>
                    {(sub.description_fr || sub.description_en) && (
                      <div className="detail-message">
                        <div className="detail-message__label">{ta.detail.submissionFields.description}</div>
                        <p>{lang === 'fr' ? sub.description_fr : sub.description_en}</p>
                      </div>
                    )}
                  </div>

                  {/* Uploaded images */}
                  <div className="detail-section">
                    <div className="detail-section__title">
                      {ta.detail.uploadedImages}
                      {subImages.length > 0 && <span className="img-count">{subImages.length} photo{subImages.length > 1 ? 's' : ''}</span>}
                    </div>
                    {subImages.length === 0 ? (
                      <div className="no-images">
                        <Icon name="image" size={28} color="var(--line)" />
                        <span>{ta.detail.noImages}</span>
                      </div>
                    ) : (
                      <div className="submission-images">
                        {subImages.map((url, i) => (
                          <button key={i} className="submission-img-btn" onClick={() => setLightboxImg(url)}>
                            <img src={assetUrl(url)} alt={`Photo ${i + 1}`} />
                            {i === 0 && <div className="cover-label">Cover</div>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Approve button */}
                  {!isAlreadyApproved ? (
                    <button
                      className="approve-btn"
                      onClick={() => handleApprove(selected)}
                      disabled={approving}
                    >
                      {approving ? (
                        <><span className="login-spinner" /> {t.common.loading}</>
                      ) : (
                        <><Icon name="checkCircle" size={18} /> {ta.approve}</>
                      )}
                    </button>
                  ) : (
                    <div className="approved-badge">
                      <Icon name="checkCircle" size={16} color="var(--forest)" />
                      {lang === 'fr' ? 'Déjà approuvé et publié' : 'Already approved and published'}
                    </div>
                  )}
                </>
              )}

              {/* WhatsApp CTA */}
              {selected.phone && (
                <a
                  href={`https://wa.me/${selected.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${selected.name}, merci pour votre demande IYO Immo.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="wa-action-btn"
                >
                  <Icon name="whatsapp" size={16} /> {ta.contactWhatsApp}
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Image lightbox */}
      {lightboxImg && (
        <div className="lightbox" onClick={() => setLightboxImg(null)}>
          <button className="lightbox-close"><Icon name="x" size={24} /></button>
          <img src={assetUrl(lightboxImg)} alt="Preview" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
