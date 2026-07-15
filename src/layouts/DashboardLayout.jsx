import { useState, useCallback, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ErrorBoundary from '../components/ErrorBoundary';
import MaintenancePage from '../pages/public/MaintenancePage';
import { useSite } from '../context/SiteContext';
import { useAuth } from '../context/AuthContext';

function getBreakpoint() {
  const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
  if (w <= 768) return 'mobile';
  if (w <= 1024) return 'tablet';
  if (w <= 1200) return 'laptop';
  return 'desktop';
}

export default function DashboardLayout() {
  const { maintenanceMode } = useSite();
  const { isAdmin, loading } = useAuth();
  const location = useLocation();

  const [breakpoint, setBreakpoint] = useState(getBreakpoint);
  const [sidebarOverlay, setSidebarOverlay] = useState(false);

  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const isLaptop = breakpoint === 'laptop';

  const [collapsed, setCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('sidebar_collapsed');
      if (saved !== null) return saved === 'true';
    } catch {}
    return isTablet || isMobile;
  });

  // Render-time path check: closes sidebar in the SAME render cycle as navigation,
  // preventing the sidebar from ever being committed in a visible state after navigation.
  const prevPathRef = useRef(location.pathname);
  const isNewPath = location.pathname !== prevPathRef.current;

  if (isNewPath) {
    prevPathRef.current = location.pathname;
    setSidebarOverlay(false);
  }

  const effectiveOverlayOpen = isNewPath ? false : sidebarOverlay;

  useEffect(() => {
    const handleResize = () => {
      const bp = getBreakpoint();
      setBreakpoint(bp);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isTablet || isMobile) {
      setCollapsed(true);
    }
  }, [isTablet, isMobile]);

  const handleToggle = useCallback(() => {
    if (isMobile) {
      setSidebarOverlay((prev) => !prev);
    } else {
      setCollapsed((prev) => {
        const next = !prev;
        try { localStorage.setItem('sidebar_collapsed', String(next)); } catch {}
        return next;
      });
    }
  }, [isMobile]);

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

  const sidebarWidth = collapsed ? 64 : 'var(--sidebar-width)';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {isMobile ? (
        <ErrorBoundary>
          <Sidebar overlayOpen={effectiveOverlayOpen} onOverlayClose={() => setSidebarOverlay(false)} />
        </ErrorBoundary>
      ) : (
        <div className="sidebar-desktop" style={{ width: sidebarWidth, flexShrink: 0 }}>
          <ErrorBoundary>
            <Sidebar
              collapsed={collapsed}
              onToggle={() => {
                setCollapsed((prev) => {
                  const next = !prev;
                  try { localStorage.setItem('sidebar_collapsed', String(next)); } catch {}
                  return next;
                });
              }}
            />
          </ErrorBoundary>
        </div>
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header onToggleSidebar={handleToggle} />
        <div className="dashboard-content" style={{ flex: 1, overflow: 'auto' }}>
          <Outlet />
        </div>
      </div>
      <style>{`
        .dashboard-content {
          padding: 24px;
        }
        @media (max-width: 1200px) {
          .dashboard-content { padding: 20px; }
        }
        @media (max-width: 1024px) {
          .dashboard-content { padding: 16px; }
        }
        @media (max-width: 768px) {
          .dashboard-content { padding: 12px; }
        }
      `}</style>
    </div>
  );
}
