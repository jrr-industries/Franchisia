import { useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Compass, Building2, MessageSquare, Bell, User, Settings,
  LogOut, Users, BarChart3, Shield, ShieldCheck, FileText, AlertTriangle,
  Heart, Briefcase, ClipboardList, Activity, Server, Megaphone, X,
  FileSignature, FileEdit, CalendarDays, Megaphone as MegaphoneIcon,
  Star, HelpCircle, CreditCard, Image, Newspaper, PenLine,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

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

const companyLinks = [
  { label: 'Policies & Terms', path: '/dashboard/policies', icon: FileSignature },
];

export default function Sidebar({ collapsed, onToggle, overlayOpen, onOverlayClose }) {
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const isFranchisor = user?.role === "franchisor";

  const handleClose = useCallback(() => { onOverlayClose?.(); }, [onOverlayClose]);

  useEffect(() => {
    if (overlayOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [overlayOpen]);

  useEffect(() => {
    if (!overlayOpen) return;
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [overlayOpen, handleClose]);

  useEffect(() => { handleClose(); }, [location.pathname, handleClose]);

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
        {overlayOpen && (
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
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: 1, padding: '8px 12px', marginTop: 16, display: collapsed ? 'none' : 'block' }}>My Company</p>
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
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: 1, padding: '8px 12px', marginTop: 16, display: collapsed ? 'none' : 'block' }}>Admin</p>
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
              { label: 'Policies', path: '/admin/policies', icon: FileSignature },
            ].map((l) => (
              <Link key={l.path} to={l.path} onClick={handleClose} style={linkStyle(l.path)} title={l.label}>
                <l.icon size={20} style={{ flexShrink: 0 }} />
                {!collapsed && l.label}
              </Link>
            ))}

            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: 1, padding: '8px 12px', marginTop: 16, display: collapsed ? 'none' : 'block' }}>Content Management</p>
            {[
              { label: 'Hero', path: '/admin/cms/hero', icon: PenLine },
              { label: 'Statistics', path: '/admin/cms/statistics', icon: BarChart3 },
              { label: 'Blog', path: '/admin/cms/blog', icon: Newspaper },
              { label: 'Careers', path: '/admin/cms/careers', icon: Briefcase },
              { label: 'Events', path: '/admin/cms/events', icon: CalendarDays },
              { label: 'Partners', path: '/admin/cms/partners', icon: MegaphoneIcon },
              { label: 'Testimonials', path: '/admin/cms/testimonials', icon: Star },
              { label: 'FAQ', path: '/admin/cms/faq', icon: HelpCircle },
              { label: 'Pricing Plans', path: '/admin/cms/plans', icon: CreditCard },
              { label: 'Media', path: '/admin/cms/media', icon: Image },
              { label: 'Footer', path: '/admin/cms/footer', icon: FileEdit },
              { label: 'Pages', path: '/admin/cms/pages', icon: FileText },
              { label: 'Contact', path: '/admin/cms/contact', icon: MessageSquare },
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

  if (overlayOpen) {
    return (
      <>
        <div onClick={handleClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 300, opacity: 1, transition: 'opacity 0.25s ease' }} />
        <aside style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 'var(--sidebar-width)', backgroundColor: 'var(--surface)', zIndex: 301, display: 'flex', flexDirection: 'column', boxShadow: '0 4px 24px rgba(0,0,0,0.15)', transform: 'translateX(0)', transition: 'transform 0.3s ease' }}>
          {sidebarContent}
        </aside>
      </>
    );
  }

  return (
    <aside style={{ width: collapsed ? 64 : 'var(--sidebar-width)', height: '100vh', position: 'sticky', top: 0, backgroundColor: 'var(--surface)', borderRight: '1px solid var(--outline-variant)', display: 'flex', flexDirection: 'column', transition: 'width 0.3s', overflow: 'hidden', flexShrink: 0 }}>
      {sidebarContent}
    </aside>
  );
}
