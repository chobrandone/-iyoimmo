import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../context/AuthContext';
import Icon from '../../components/icons';
import { assetUrl } from '../../utils/url';
import toast from 'react-hot-toast';
import './AdminProperties.css';

export default function AdminSettings() {
  const { user, refreshUser } = useAuth();
  const [name, setName]       = useState(user?.name  || '');
  const [phone, setPhone]     = useState(user?.phone || '');
  const [avatar, setAvatar]   = useState(user?.avatar || '');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw]     = useState('');
  const [saving, setSaving]   = useState(false);
  const [uploading, setUploading] = useState(false);

  // ── Avatar upload ──────────────────────────────────────────────────────────
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post('/upload/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newUrl = data.url;
      setAvatar(newUrl);
      // Save immediately to DB and refresh sidebar
      await api.patch('/auth/me', { avatar: newUrl });
      await refreshUser();
      toast.success('Photo de profil mise à jour');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur lors de l\'upload');
    }
    setUploading(false);
  };

  const removeAvatar = async () => {
    setAvatar('');
    try {
      await api.patch('/auth/me', { avatar: '' });
      await refreshUser();
      toast.success('Photo supprimée');
    } catch {
      toast.error('Erreur');
    }
  };

  // ── Profile save ───────────────────────────────────────────────────────────
  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/auth/me', { name, phone });
      toast.success('Profil mis à jour');
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
    setSaving(false);
  };

  // ── Password change ────────────────────────────────────────────────────────
  const changePw = async (e) => {
    e.preventDefault();
    if (newPw.length < 8) { toast.error('Le mot de passe doit contenir au moins 8 caractères'); return; }
    setSaving(true);
    try {
      await api.patch('/auth/change-password', { currentPassword: currentPw, newPassword: newPw });
      toast.success('Mot de passe modifié');
      setCurrentPw(''); setNewPw('');
    } catch {
      toast.error('Mot de passe actuel incorrect');
    }
    setSaving(false);
  };

  return (
    <div className="admin-section">
      <div className="admin-section__header">
        <h1>Paramètres</h1>
      </div>

      {/* ── Avatar card ── */}
      <div className="admin-card" style={{ padding: 24, marginBottom: 20, maxWidth: 800 }}>
        <h3 style={{ marginBottom: 20 }}>Photo de profil</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {/* Preview */}
          <div style={{
            width: 100, height: 100, borderRadius: '50%', overflow: 'hidden',
            background: 'var(--bg)', border: '2px solid var(--line)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {avatar ? (
              <img src={assetUrl(avatar)} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 36, fontWeight: 700, color: 'var(--navy)' }}>
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'var(--navy)', color: 'white', padding: '8px 16px',
              borderRadius: 8, cursor: uploading ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 600, opacity: uploading ? 0.7 : 1,
            }}>
              <Icon name="upload" size={15} />
              {uploading ? 'Upload en cours...' : 'Choisir une photo'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>
            {avatar && (
              <button onClick={removeAvatar} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'transparent', border: '1.5px solid var(--line)',
                color: 'var(--danger, #e53e3e)', padding: '6px 14px',
                borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
              }}>
                <Icon name="trash" size={14} /> Supprimer
              </button>
            )}
            <p style={{ fontSize: 12, color: 'var(--slate)', margin: 0 }}>
              JPG, PNG ou WebP · Max 10 MB
            </p>
          </div>
        </div>
      </div>

      {/* ── Profile + Password ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 800 }}>
        <form className="admin-card" style={{ padding: 24 }} onSubmit={saveProfile}>
          <h3 style={{ marginBottom: 20 }}>Mon profil</h3>
          <div className="field" style={{ marginBottom: 16 }}>
            <label>Nom</label>
            <input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="field" style={{ marginBottom: 16 }}>
            <label>Email</label>
            <input value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
          </div>
          <div className="field" style={{ marginBottom: 20 }}>
            <label>Téléphone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+236 72 00 00 00" />
          </div>
          <button type="submit" className="dash-btn" disabled={saving}>
            {saving ? '...' : 'Enregistrer'}
          </button>
        </form>

        <form className="admin-card" style={{ padding: 24 }} onSubmit={changePw}>
          <h3 style={{ marginBottom: 20 }}>Changer le mot de passe</h3>
          <div className="field" style={{ marginBottom: 16 }}>
            <label>Mot de passe actuel</label>
            <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} required />
          </div>
          <div className="field" style={{ marginBottom: 20 }}>
            <label>Nouveau mot de passe</label>
            <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} required minLength={8} />
          </div>
          <button type="submit" className="dash-btn" disabled={saving}>
            {saving ? '...' : 'Modifier'}
          </button>
        </form>
      </div>

      {/* ── Account info ── */}
      <div className="admin-card" style={{ padding: 24, marginTop: 20, maxWidth: 800 }}>
        <h3 style={{ marginBottom: 16 }}>Informations du compte</h3>
        <div style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.8 }}>
          <div><strong>Email :</strong> {user?.email}</div>
          <div><strong>Rôle :</strong> {user?.role}</div>
          <div><strong>Membre depuis :</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '—'}</div>
        </div>
      </div>
    </div>
  );
}
