import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserProvider } from './context/UserContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Listings from './pages/Listings';
import PropertyDetail from './pages/PropertyDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Services from './pages/Services';
import ListProperty from './pages/ListProperty';
import Register from './pages/Register';
import UserLogin from './pages/UserLogin';

import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminProperties from './pages/admin/AdminProperties';
import PropertyForm from './pages/admin/PropertyForm';
import AdminLeads from './pages/admin/AdminLeads';
import AdminTeam from './pages/admin/AdminTeam';
import AdminSettings from './pages/admin/AdminSettings';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loader-spin" style={{ width: 40, height: 40, border: '3px solid var(--line)', borderTopColor: 'var(--navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
}

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  const basename = import.meta.env.BASE_URL || '/';

  return (
    <BrowserRouter basename={basename}>
      <LanguageProvider>
        <AuthProvider>
          <UserProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                style: { fontFamily: 'Inter, sans-serif', fontSize: 14 },
                success: { iconTheme: { primary: 'var(--forest)', secondary: 'white' } },
              }}
            />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
              <Route path="/properties" element={<PublicLayout><Listings /></PublicLayout>} />
              <Route path="/properties/:id" element={<PublicLayout><PropertyDetail /></PublicLayout>} />
              <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
              <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
              <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
              <Route path="/list-property" element={<PublicLayout><ListProperty /></PublicLayout>} />

              {/* Public user auth */}
              <Route path="/register" element={<Register />} />
              <Route path="/user-login" element={<UserLogin />} />

              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="properties" element={<AdminProperties />} />
                <Route path="properties/new" element={<PropertyForm />} />
                <Route path="properties/:id/edit" element={<PropertyForm />} />
                <Route path="leads" element={<AdminLeads />} />
                <Route path="team" element={<AdminTeam />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </UserProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
