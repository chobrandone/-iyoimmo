import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';
import Icon from '../../components/icons';
import toast from 'react-hot-toast';
import './AdminLogin.css';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Identifiants incorrects';
      toast.error(msg);
    }
    setLoading(false);
  };

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <div className="admin-login__logo">
          <Logo size="lg" />
          <div className="admin-login__logo-sub">Administration</div>
        </div>

        <h2>Connexion</h2>
        <p style={{ color: 'var(--slate)', fontSize: 14, marginBottom: 28 }}>
          Accès réservé à l'équipe IYO Immo.
        </p>

        <form onSubmit={handleSubmit} className="admin-login__form">
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@iyoimmo.com"
              required
              autoComplete="username"
            />
          </div>
          <div className="field" style={{ position: 'relative' }}>
            <label>Mot de passe</label>
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              style={{ paddingRight: 44 }}
            />
            <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
              <Icon name="eye" size={16} />
            </button>
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <span className="login-spinner" /> : 'Se connecter →'}
          </button>
        </form>
      </div>
    </div>
  );
}
