import { useCallback, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Compass, Building2, MessageSquare, Bell,
  User, Settings, LogOut, X, Users, ShieldCheck, Briefcase,
  ClipboardList, Heart, AlertTriangle, BarChart3, Shield,
  FileText, Server, LogIn, UserPlus, Menu
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

const mainLinks = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Discover", path: "/discover", icon: Compass },
  { label: "Companies", path: "/companies", icon: Building2 },
  { label: "Messages", path: "/messages", icon: MessageSquare },
  { label: "Notifications", path: "/notifications", icon: Bell },
];

const accountLinks = [
  { label: "Profile", path: "/profile", icon: User },
  { label: "Settings", path: "/settings", icon: Settings },
];

const adminLinks = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Verification", path: "/admin/verification", icon: ShieldCheck },
  { label: "Companies", path: "/admin/companies", icon: Building2 },
  { label: "Marketplace", path: "/admin/marketplace", icon: Briefcase },
  { label: "Applications", path: "/admin/applications", icon: ClipboardList },
  { label: "Messages", path: "/admin/messages", icon: MessageSquare },
  { label: "Followers", path: "/admin/followers", icon: Heart },
  { label: "Reports", path: "/admin/reports", icon: AlertTriangle },
  { label: "Notifications", path: "/admin/notifications", icon: Bell },
  { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
  { label: "Content", path: "/admin/content", icon: Shield },
  { label: "Settings", path: "/admin/settings", icon: Settings },
  { label: "Audit Logs", path: "/admin/audit-logs", icon: FileText },
  { label: "System Health", path: "/admin/system-health", icon: Server },
];

export default function MobileDrawer({ open, onClose }) {
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  const handleLogout = useCallback(() => {
    logout();
    onClose();
  }, [logout, onClose]);

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    display: "flex", alignItems: "center", gap: 12, padding: "10px 16px",
    borderRadius: "var(--radius-sm)", fontSize: 14, fontWeight: 500,
    color: isActive(path) ? "var(--primary)" : "var(--text-secondary)",
    backgroundColor: isActive(path) ? "var(--primary-light)" : "transparent",
    border: "none", cursor: "pointer", width: "100%", textDecoration: "none",
    transition: "background 0.15s",
  });

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 300,
          opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.25s ease",
        }}
      />

      <div
        style={{
          position: "fixed", top: 0, left: 0, bottom: 0, width: "min(85vw, 320px)",
          backgroundColor: "var(--surface)", zIndex: 301, display: "flex",
          flexDirection: "column",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <Logo size={40} onClick={onClose} />
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4, display: "flex" }} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: 12 }}>
          {!isAuthenticated && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "8px 4px 16px", borderBottom: "1px solid var(--border)", marginBottom: 8 }}>
              <Link
                to="/login"
                onClick={onClose}
                style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", padding: "10px 16px", borderRadius: "var(--radius-sm)", fontSize: 14, fontWeight: 600, backgroundColor: "var(--primary)", color: "white", textDecoration: "none", border: "none", cursor: "pointer" }}
              >
                <LogIn size={16} /> Sign In
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", padding: "10px 16px", borderRadius: "var(--radius-sm)", fontSize: 14, fontWeight: 600, backgroundColor: "transparent", color: "var(--primary)", textDecoration: "none", border: "1px solid var(--primary)", cursor: "pointer" }}
              >
                <UserPlus size={16} /> Create Account
              </Link>
            </div>
          )}

          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, padding: "8px 12px" }}>Main</p>
          {mainLinks.map((l) => (
            <Link key={l.path} to={l.path} onClick={onClose} style={linkStyle(l.path)}>
              <l.icon size={20} style={{ flexShrink: 0 }} />
              {l.label}
            </Link>
          ))}

          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, padding: "8px 12px", marginTop: 16 }}>Account</p>
          {accountLinks.map((l) => (
            <Link key={l.path} to={l.path} onClick={onClose} style={linkStyle(l.path)}>
              <l.icon size={20} style={{ flexShrink: 0 }} />
              {l.label}
            </Link>
          ))}

          {isAdmin && (
            <>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, padding: "8px 12px", marginTop: 16 }}>Admin</p>
              {adminLinks.map((l) => (
                <Link key={l.path} to={l.path} onClick={onClose} style={linkStyle(l.path)}>
                  <l.icon size={20} style={{ flexShrink: 0 }} />
                  {l.label}
                </Link>
              ))}
            </>
          )}
        </div>

        {isAuthenticated && (
          <div style={{ padding: 12, borderTop: "1px solid var(--border)" }}>
            <button onClick={handleLogout} style={linkStyle("#")}>
              <LogOut size={20} style={{ flexShrink: 0 }} />
              Logout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
