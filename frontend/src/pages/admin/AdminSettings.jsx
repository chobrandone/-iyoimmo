import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './AdminProperties.css';

export default function AdminSettings() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [saving, setSaving] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/auth/me', { name, phone });
      toast.success('Profil mis à jour');
    } catch { toast.error('Erreur'); }
    setSaving(false);
  };

  const changePw = async (e) => {
    e.preventDefault();
    if (newPw.length < 8) { toast.error('Le mot de passe doit contenir au moins 8 caractères'); return; }
    setSaving(true);
    try {
      await api.patch('/auth/change-password', { currentPassword: currentPw, newPassword: newPw });
      toast.success('Mot de passe modifié');
      setCurrentPw(''); setNewPw('');
    } catch { toast.error('Mot de passe actuel incorrect'); }
    setSaving(false);
  };

  return (
    <div className="admin-section">
      <div className="admin-section__header">
        <h1>Paramètres</h1>
      </div>

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
            <input value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <button type="submit" className="dash-btn" disabled={saving}>Enregistrer</button>
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
          <button type="submit" className="dash-btn" disabled={saving}>Modifier</button>
        </form>
      </div>

      <div className="admin-card" style={{ padding: 24, marginTop: 20, maxWidth: 800 }}>
        <h3 style={{ marginBottom: 16 }}>Informations du compte</h3>
        <div style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.8 }}>
          <div><strong>Email :</strong> {user?.email}</div>
          <div><strong>Rôle :</strong> {user?.role}</div>
          <div><strong>Membre depuis :</strong> {new Date(user?.createdAt).toLocaleDateString('fr-FR')}</div>
        </div>
      </div>
    </div>
  );
}
