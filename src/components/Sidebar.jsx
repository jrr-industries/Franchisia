import { useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Compass, Building2, MessageSquare, Bell, User, Settings,
  LogOut, Users, BarChart3, ShieldCheck, FileText, AlertTriangle,
  Heart, Briefcase, ClipboardList, Server, X, FileSignature,
  Store, FolderOpen, LineChart,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

const mainLinks = [
  { label: 'Home', path: '/', icon: LayoutDashboard },
  { label: 'Dashboard', path: '/dashboard', icon: Compass },
  { label: 'Discover', path: '/discover', icon: Store },
  { label: 'Companies', path: '/companies', icon: Building2 },
  { label: 'Messages', path: '/messages', icon: MessageSquare },
  { label: 'Notifications', path: '/notifications', icon: Bell },
];

const accountLinks = [
  { label: 'Profile', path: '/profile', icon: User },
  { label: 'Settings', path: '/settings', icon: Settings },
];

const companyLinks = [
  { label: 'My Company', path: '/company/my', icon: Building2 },
  { label: 'My Marketplace', path: '/dashboard/listings', icon: Store },
  { label: 'Applications', path: '/dashboard/applications', icon: ClipboardList },
  { label: 'Policies & Terms', path: '/dashboard/policies', icon: FileSignature },
  { label: 'Analytics', path: '/dashboard/analytics', icon: LineChart },
  { label: 'Followers', path: '/dashboard/followers', icon: Heart },
  { label: 'Documents', path: '/dashboard/documents', icon: FolderOpen },
];

export default function Sidebar({ collapsed, onToggle, overlayOpen, onOverlayClose }) {
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const isFranchisor = user?.role === "franchisor";
  const sidebarVisible = overlayOpen === true;
  const sidebarOverlayMode = overlayOpen !== undefined;

  const handleClose = useCallback(() => { onOverlayClose?.(); }, [onOverlayClose]);

  useEffect(() => {
    if (sidebarVisible) {
      document.body.style.overflow = 'hidden';
    } else if (sidebarOverlayMode) {
      document.body.style.overflow = '';
    }
    return () => {
      if (sidebarOverlayMode) {
        document.body.style.overflow = '';
      }
    };
  }, [sidebarVisible, sidebarOverlayMode]);

  useEffect(() => {
    if (!sidebarVisible) return;
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [sidebarVisible, handleClose]);

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 16px',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    color: isActive(path) ? 'var(--on-secondary-container)' : 'var(--on-surface-variant)',
    backgroundColor: isActive(path) ? 'var(--secondary-container)' : 'transparent',
    transition: 'all 0.15s',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  });

  const sidebarContent = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: collapsed ? 16 : '20px 20px', borderBottom: '1px solid var(--outline-variant)' }}>
        <Logo size={collapsed ? 36 : 40} collapsed={collapsed} onClick={handleClose} />
        {sidebarVisible && (
          <button onClick={handleClose} style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', padding: 4, display: 'flex', borderRadius: 8 }} aria-label="Close sidebar">
            <X size={20} />
          </button>
        )}
      </div>

      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 4, flex: 1, overflow: 'auto' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: 1, padding: '8px 12px', display: collapsed ? 'none' : 'block' }}>Main</p>
        {mainLinks.map((l) => (
          <Link key={l.path} to={l.path} style={linkStyle(l.path)} title={l.label}>
            <l.icon size={20} style={{ flexShrink: 0 }} />
            {!collapsed && l.label}
          </Link>
        ))}

        {isFranchisor && (
          <>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: 1, padding: '8px 12px', marginTop: 16, display: collapsed ? 'none' : 'block' }}>My Business</p>
            {companyLinks.map((l) => (
              <Link key={l.path} to={l.path} onClick={handleClose} style={linkStyle(l.path)} title={l.label}>
                <l.icon size={20} style={{ flexShrink: 0 }} />
                {!collapsed && l.label}
              </Link>
            ))}
          </>
        )}

        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: 1, padding: '8px 12px', marginTop: 16, display: collapsed ? 'none' : 'block' }}>Account</p>
        {accountLinks.map((l) => (
          <Link key={l.path} to={l.path} onClick={handleClose} style={linkStyle(l.path)} title={l.label}>
            <l.icon size={20} style={{ flexShrink: 0 }} />
            {!collapsed && l.label}
          </Link>
        ))}

        {isAdmin && (
          <>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: 1, padding: '8px 12px', marginTop: 16, display: collapsed ? 'none' : 'block' }}>Dashboard</p>
            <Link key="/admin/home" to="/admin/home" onClick={handleClose} style={linkStyle('/admin/home')} title="Home">
              <LayoutDashboard size={20} style={{ flexShrink: 0 }} />
              {!collapsed && 'Home'}
            </Link>

            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: 1, padding: '8px 12px', marginTop: 16, display: collapsed ? 'none' : 'block' }}>Admin Management</p>
            {[
              { label: 'Users', path: '/admin/users', icon: Users },
              { label: 'Verification', path: '/admin/verification', icon: ShieldCheck },
              { label: 'Companies', path: '/admin/companies', icon: Building2 },
              { label: 'Marketplace', path: '/admin/marketplace', icon: Briefcase },
              { label: 'Applications', path: '/admin/applications', icon: ClipboardList },
              { label: 'Messages', path: '/admin/messages', icon: MessageSquare },
              { label: 'Followers', path: '/admin/followers', icon: Heart },
              { label: 'Reports', path: '/admin/reports', icon: AlertTriangle },
              { label: 'Notifications', path: '/admin/notifications', icon: Bell },
              { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
              { label: 'Settings', path: '/admin/settings', icon: Settings },
              { label: 'Audit Logs', path: '/admin/audit-logs', icon: FileText },
              { label: 'System Health', path: '/admin/system-health', icon: Server },
            ].map((l) => (
              <Link key={l.path} to={l.path} onClick={handleClose} style={linkStyle(l.path)} title={l.label}>
                <l.icon size={20} style={{ flexShrink: 0 }} />
                {!collapsed && l.label}
              </Link>
            ))}
          </>
        )}
      </div>

      <div style={{ padding: 12, borderTop: '1px solid var(--outline-variant)' }}>
        <button onClick={() => { logout(); handleClose(); }} style={linkStyle('#')} title="Logout">
          <LogOut size={20} style={{ flexShrink: 0 }} />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </>
  );

  if (sidebarOverlayMode) {
    return (
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 300,
          pointerEvents: sidebarVisible ? 'auto' : 'none',
          visibility: sidebarVisible ? 'visible' : 'hidden',
        }}
      >
        <div
          onClick={handleClose}
          style={{
            position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
            opacity: sidebarVisible ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        />
        <aside
          style={{
            position: 'absolute', top: 0, left: 0, bottom: 0,
            width: 'var(--sidebar-width)', backgroundColor: 'var(--surface)',
            display: 'flex', flexDirection: 'column',
            transform: sidebarVisible ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.25s ease',
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
          }}
        >
          {sidebarContent}
        </aside>
      </div>
    );
  }

  return (
    <aside style={{ width: collapsed ? 64 : 'var(--sidebar-width)', height: '100vh', position: 'sticky', top: 0, backgroundColor: 'var(--surface)', borderRight: '1px solid var(--outline-variant)', display: 'flex', flexDirection: 'column', transition: 'width 0.3s', overflow: 'hidden', flexShrink: 0 }}>
      {sidebarContent}
    </aside>
  );
}
