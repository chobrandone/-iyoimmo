import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { usePublicUser } from '../context/UserContext';
import { useLang } from '../context/LanguageContext';

export default function Register() {
  const { registerUser } = usePublicUser();
  const { lang } = useLang();
  const navigate = useNavigate();

  const [form, setForm]       = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const t = {
    title:    { fr: 'Créer un compte', en: 'Create an account' },
    sub:      { fr: 'Suivez vos demandes et soumissions', en: 'Track your requests and submissions' },
    name:     { fr: 'Nom complet', en: 'Full name' },
    email:    { fr: 'Adresse e-mail', en: 'Email address' },
    phone:    { fr: 'Téléphone (optionnel)', en: 'Phone (optional)' },
    password: { fr: 'Mot de passe', en: 'Password' },
    confirm:  { fr: 'Confirmer le mot de passe', en: 'Confirm password' },
    submit:   { fr: 'Créer le compte', en: 'Create account' },
    login:    { fr: 'Déjà inscrit ?', en: 'Already have an account?' },
    loginLink:{ fr: 'Se connecter', en: 'Sign in' },
    match:    { fr: 'Les mots de passe ne correspondent pas', en: 'Passwords do not match' },
    short:    { fr: 'Le mot de passe doit comporter au moins 6 caractères', en: 'Password must be at least 6 characters' },
  };
  const tx = (k) => t[k]?.[lang] || t[k]?.fr || '';

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error(tx('match'));
    if (form.password.length < 6)       return toast.error(tx('short'));
    setLoading(true);
    try {
      await registerUser(form.name, form.email, form.password, form.phone);
      toast.success(lang === 'fr' ? 'Compte créé avec succès !' : 'Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err?.response?.data?.message || (lang === 'fr' ? 'Erreur lors de l\'inscription' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: '2.5rem 2rem', width: '100%', maxWidth: 440, boxShadow: '0 4px 24px rgba(0,0,0,.08)' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--navy)' }}>IYO</span>
            <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--forest)' }}>immo</span>
          </Link>
          <p style={{ margin: '0.4rem 0 0', color: 'var(--muted)', fontSize: 14 }}>{tx('sub')}</p>
        </div>

        <h2 style={{ margin: '0 0 1.5rem', fontSize: 22, fontWeight: 700, color: 'var(--navy)', textAlign: 'center' }}>
          {tx('title')}
        </h2>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { name: 'name',     label: tx('name'),     type: 'text',     required: true  },
            { name: 'email',    label: tx('email'),    type: 'email',    required: true  },
            { name: 'phone',    label: tx('phone'),    type: 'tel',      required: false },
            { name: 'password', label: tx('password'), type: 'password', required: true  },
            { name: 'confirm',  label: tx('confirm'),  type: 'password', required: true  },
          ].map(({ name, label, type, required }) => (
            <div key={name}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>
                {label}
              </label>
              <input
                name={name}
                type={type}
                required={required}
                value={form[name]}
                onChange={handle}
                style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid var(--line)', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            style={{ background: 'var(--navy)', color: 'white', border: 'none', borderRadius: 8, padding: '0.85rem', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? '...' : tx('submit')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 14, color: 'var(--muted)' }}>
          {tx('login')}{' '}
          <Link to="/user-login" style={{ color: 'var(--forest)', fontWeight: 600, textDecoration: 'none' }}>
            {tx('loginLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}
