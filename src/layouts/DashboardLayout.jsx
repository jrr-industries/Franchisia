import { useState, useCallback, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebar_collapsed') === 'true'; } catch { return false; }
  });
  const [sidebarOverlay, setSidebarOverlay] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth <= 768
  );
  const location = useLocation();

  useEffect(() => {
    setSidebarOverlay(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggle = useCallback(() => {
    setSidebarOverlay(true);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {isMobile ? (
        <>
          {sidebarOverlay && <Sidebar overlayOpen={true} onOverlayClose={() => setSidebarOverlay(false)} />}
        </>
      ) : (
        <div className="sidebar-desktop">
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((prev) => { const next = !prev; try { localStorage.setItem('sidebar_collapsed', String(next)); } catch {} return next; })} />
        </div>
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header onToggleSidebar={handleToggle} />
        <div className="dashboard-content" style={{ flex: 1, padding: 24, overflow: 'auto' }}>
          <Outlet />
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .dashboard-content { padding: 16px !important; }
        }
      `}</style>
    </div>
  );
}