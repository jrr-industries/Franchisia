import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Compass, Building2, MessageSquare, Bell, User, Settings, LogOut, Users, BarChart3, Shield, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const mainLinks = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Discover', path: '/discover', icon: Compass },
  { label: 'Companies', path: '/companies', icon: Building2 },
  { label: 'Messages', path: '/messages', icon: MessageSquare },
  { label: 'Notifications', path: '/notifications', icon: Bell },
];

const accountLinks = [
  { label: 'Profile', path: '/profile', icon: User },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 16px',
    borderRadius: 'var(--radius-sm)',
    fontSize: 14,
    fontWeight: 500,
    color: isActive(path) ? 'var(--primary)' : 'var(--text-secondary)',
    backgroundColor: isActive(path) ? 'var(--primary-light)' : 'transparent',
    transition: 'all 0.15s',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    textDecoration: 'none',
  });

  return (
    <aside
      style={{
        width: collapsed ? 64 : 'var(--sidebar-width)',
        height: '100vh',
        position: 'sticky',
        top: 0,
        backgroundColor: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <div style={{ padding: collapsed ? 16 : '20px 20px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: collapsed ? 14 : 20, color: 'var(--primary)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'inline-block', flexShrink: 0 }} />
          {!collapsed && 'Franchisia'}
        </Link>
      </div>

      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 4, flex: 1, overflow: 'auto' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, padding: '8px 12px', display: collapsed ? 'none' : 'block' }}>Main</p>
        {mainLinks.map((l) => (
          <Link key={l.path} to={l.path} style={linkStyle(l.path)} title={l.label}>
            <l.icon size={20} style={{ flexShrink: 0 }} />
            {!collapsed && l.label}
          </Link>
        ))}

        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, padding: '8px 12px', marginTop: 16, display: collapsed ? 'none' : 'block' }}>Account</p>
        {accountLinks.map((l) => (
          <Link key={l.path} to={l.path} style={linkStyle(l.path)} title={l.label}>
            <l.icon size={20} style={{ flexShrink: 0 }} />
            {!collapsed && l.label}
          </Link>
        ))}

        {isAdmin && (
          <>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, padding: '8px 12px', marginTop: 16, display: collapsed ? 'none' : 'block' }}>Admin</p>
            {[
              { label: 'Admin', path: '/admin', icon: Shield },
              { label: 'Users', path: '/admin/users', icon: Users },
              { label: 'Verification', path: '/admin/verification', icon: ShieldCheck },
              { label: 'Companies', path: '/admin/companies', icon: Building2 },
              { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
            ].map((l) => (
              <Link key={l.path} to={l.path} style={linkStyle(l.path)} title={l.label}>
                <l.icon size={20} style={{ flexShrink: 0 }} />
                {!collapsed && l.label}
              </Link>
            ))}
          </>
        )}
      </div>

      <div style={{ padding: 12, borderTop: '1px solid var(--border)' }}>
        <button
          onClick={logout}
          style={linkStyle('#')}
          title="Logout"
        >
          <LogOut size={20} style={{ flexShrink: 0 }} />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
}
