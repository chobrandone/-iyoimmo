import { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import Icon from '../../components/icons';
import { assetUrl } from '../../utils/url';
import toast from 'react-hot-toast';
import './AdminProperties.css';
import './AdminTeam.css';

const EMPTY = { name: '', role_fr: '', role_en: '', phone: '', email: '', order: 0, photo: '' };

function LangTab({ lang, setLang }) {
  return (
    <div style={{ display: 'inline-flex', border: '1.5px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
      {['fr', 'en'].map(l => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          style={{
            padding: '4px 14px', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer',
            background: lang === l ? 'var(--navy)' : 'transparent',
            color: lang === l ? 'white' : 'var(--slate)',
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default function AdminTeam() {
  const [members, setMembers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [form, setForm]         = useState(EMPTY);
  const [roleLang, setRoleLang] = useState('fr');
  const [editing, setEditing]   = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    try { setMembers((await api.get('/team')).data || []); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchMembers(); }, []);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(f => ({ ...f, photo: data.url }));
      toast.success('Photo uploadée');
    } catch { toast.error('Erreur upload'); }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Le nom est requis'); return; }
    const payload = {
      name: form.name,
      role: { fr: form.role_fr, en: form.role_en },
      phone: form.phone,
      email: form.email,
      order: parseInt(form.order) || 0,
      photo: form.photo,
    };
    try {
      if (editing) {
        await api.patch(`/team/${editing}`, payload);
        toast.success('Membre mis à jour');
      } else {
        await api.post('/team', payload);
        toast.success('Membre ajouté');
      }
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY);
      fetchMembers();
    } catch { toast.error('Erreur lors de la sauvegarde'); }
  };

  const handleEdit = (m) => {
    setForm({ name: m.name, role_fr: m.role?.fr || m.roleFr || '', role_en: m.role?.en || m.roleEn || '', phone: m.phone || '', email: m.email || '', order: m.order || 0, photo: m.photo || '' });
    setEditing(m._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce membre ?')) return;
    try { await api.delete(`/team/${id}`); toast.success('Supprimé'); fetchMembers(); }
    catch { toast.error('Erreur'); }
  };

  return (
    <div className="admin-section">
      <div className="admin-section__header">
        <div>
          <h1>Équipe</h1>
          <p>{members.length} membre{members.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="dash-btn" onClick={() => { setShowForm(!showForm); setEditing(null); setForm(EMPTY); setRoleLang('fr'); }}>
          <Icon name="plus" size={16} /> Ajouter un membre
        </button>
      </div>

      {showForm && (
        <div className="admin-card team-form-card">
          <h3>{editing ? 'Modifier le membre' : 'Nouveau membre'}</h3>

          {/* Photo upload */}
          <div className="team-photo-upload">
            <div className="team-photo-preview">
              {form.photo ? (
                <img src={assetUrl(form.photo)} alt="Photo" className="team-photo-img" />
              ) : (
                <div className="team-photo-empty">
                  <Icon name="camera" size={28} color="var(--slate)" />
                  <span>Photo</span>
                </div>
              )}
            </div>
            <div className="team-photo-actions">
              <label className="upload-photo-btn">
                <Icon name="upload" size={15} />
                {uploading ? 'Upload...' : 'Choisir une photo'}
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} disabled={uploading} />
              </label>
              {form.photo && (
                <button className="remove-photo-btn" onClick={() => setForm(f => ({ ...f, photo: '' }))}>
                  <Icon name="trash" size={14} /> Supprimer
                </button>
              )}
              <p className="photo-hint">JPG ou PNG · Recommandé : portrait carré 400×400px</p>
            </div>
          </div>

          <div className="field-row">
            <div className="field"><label>Nom complet *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jean Mbongo" /></div>
            <div className="field"><label>Ordre d'affichage</label><input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: e.target.value }))} /></div>
          </div>
          <div className="field">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <label style={{ margin: 0 }}>Rôle</label>
              <LangTab lang={roleLang} setLang={setRoleLang} />
            </div>
            <input
              value={roleLang === 'fr' ? form.role_fr : form.role_en}
              onChange={e => setForm(f => ({ ...f, [roleLang === 'fr' ? 'role_fr' : 'role_en']: e.target.value }))}
              placeholder={roleLang === 'fr' ? 'Agent Senior' : 'Senior Agent'}
            />
          </div>
          <div className="field-row">
            <div className="field"><label>Téléphone</label><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+236 72 63 71 71" /></div>
            <div className="field"><label>Email</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jean@iyoimmo.com" /></div>
          </div>

          <div className="form-actions-row">
            <button className="btn-ghost-sm" onClick={() => { setShowForm(false); setEditing(null); }}>Annuler</button>
            <button className="dash-btn" onClick={handleSave}>
              <Icon name="check" size={15} /> {editing ? 'Sauvegarder' : 'Ajouter'}
            </button>
          </div>
        </div>
      )}

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Nom</th>
              <th>Rôle</th>
              <th>Contact</th>
              <th>Ordre</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="table-loading">Chargement...</td></tr>
            ) : members.length === 0 ? (
              <tr><td colSpan={6} className="table-loading">Aucun membre</td></tr>
            ) : members.map(m => (
              <tr key={m._id}>
                <td>
                  <div className="member-avatar">
                    {m.photo ? (
                      <img src={assetUrl(m.photo)} alt={m.name} />
                    ) : (
                      <span>{m.name?.charAt(0)}</span>
                    )}
                  </div>
                </td>
                <td><strong>{m.name}</strong></td>
                <td><span className="channel-badge">{m.role?.fr || m.roleFr}</span></td>
                <td style={{ fontSize: 12, color: 'var(--slate)' }}>
                  {m.phone && <div>{m.phone}</div>}
                  {m.email && <div>{m.email}</div>}
                </td>
                <td>{m.order}</td>
                <td>
                  <div className="table-actions">
                    <button className="icon-btn" onClick={() => handleEdit(m)} title="Modifier">
                      <Icon name="edit" size={15} />
                    </button>
                    <button className="icon-btn icon-btn--danger" onClick={() => handleDelete(m._id)} title="Supprimer">
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
