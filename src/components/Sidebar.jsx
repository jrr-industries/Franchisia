import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Compass, Building2, MessageSquare, Bell, User, Settings, LogOut, Users, BarChart3, Shield, ShieldCheck, FileText, AlertTriangle, Heart, Search, Briefcase, ClipboardList, Activity, Server, Megaphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

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
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', whiteSpace: 'nowrap' }}>
          <img src={logo} alt="Franchisia" style={{ height: collapsed ? 28 : 32, width: 'auto' }} />
          {!collapsed && <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>Franchisia</span>}
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
              { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
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
              { label: 'Content', path: '/admin/content', icon: Shield },
              { label: 'Settings', path: '/admin/settings', icon: Settings },
              { label: 'Audit Logs', path: '/admin/audit-logs', icon: FileText },
              { label: 'System Health', path: '/admin/system-health', icon: Server },
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
