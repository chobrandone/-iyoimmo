import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import Logo from '../../components/Logo';
import Icon from '../../components/icons';
import { assetUrl } from '../../utils/url';
import './AdminLayout.css';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { t, lang, toggle } = useLang();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/'); };

  const menu = [
    { to: '/admin', label: t.admin.dashboard, icon: 'chart', end: true },
    { to: '/admin/properties', label: t.admin.properties, icon: 'home' },
    { to: '/admin/leads', label: t.admin.leads, icon: 'bell' },
    { to: '/admin/team', label: t.admin.team, icon: 'users' },
    { to: '/admin/settings', label: t.admin.settings, icon: 'settings' },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__logo">
          <Logo size="sm" dark />
          <span>Admin</span>
        </div>

        <nav className="admin-sidebar__nav">
          {menu.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-nav-item${isActive ? ' admin-nav-item--active' : ''}`}
            >
              <Icon name={item.icon} size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <Link to="/" className="admin-nav-item" target="_blank">
            <Icon name="externalLink" size={16} /> {t.admin.viewSite}
          </Link>

          <div className="admin-user">
            <div className="admin-user__avatar">
              {user?.avatar
                ? <img src={assetUrl(user.avatar)} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                : user?.name?.charAt(0)
              }
            </div>
            <div className="admin-user__info">
              <div className="admin-user__name">{user?.name}</div>
              <div className="admin-user__role">{user?.role}</div>
            </div>
            <button
              onClick={toggle}
              className="admin-lang-btn"
              title={lang === 'fr' ? 'Switch to English' : 'Passer en Français'}
            >
              {lang === 'fr' ? 'EN' : 'FR'}
            </button>
            <button onClick={handleLogout} className="admin-logout-btn" title={t.nav.signOut}>
              <Icon name="logout" size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
