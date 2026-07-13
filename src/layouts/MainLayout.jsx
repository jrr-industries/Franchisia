import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MaintenancePage from '../pages/public/MaintenancePage';
import { useSite } from '../context/SiteContext';
import { useAuth } from '../context/AuthContext';

export default function MainLayout() {
  const { maintenanceMode } = useSite();
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (maintenanceMode && !isAdmin) {
    return <MaintenancePage />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
