import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Moon, Sun, Bell, MessageSquare, LogIn, UserPlus, Menu, LayoutDashboard, User, PanelLeft } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import Avatar from "./ui/Avatar";
import Dropdown, { DropdownItem } from "./ui/Dropdown";
import SearchBar from "./SearchBar";
import MobileDrawer from "./MobileDrawer";
import VerifiedBadge from "./ui/VerifiedBadge";
import useSocketStore from "../store/socketStore";
import Logo from "./Logo";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Pricing", path: "/pricing" },
  { label: "Contact", path: "/contact" },
  { label: "FAQ", path: "/faq" },
];

export default function Header({ onToggleSidebar }) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated, user, isVerified, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isConnected = useSocketStore((s) => s.isConnected);
  const unreadCount = useSocketStore((s) => s.unreadCount);
  const notificationCount = useSocketStore((s) => s.notificationCount);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch("/api/messages/unread-count", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.unreadCount === "number") {
          const store = useSocketStore.getState();
          store.setUnreadCount(data.unreadCount);
        }
      })
      .catch(() => {});
  }, [isAuthenticated, location.pathname]);

  const isDashboard = location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/admin") || location.pathname.startsWith("/messages") || location.pathname.startsWith("/notifications") || location.pathname.startsWith("/profile") || location.pathname.startsWith("/settings");

  return (
    <>
      <header
        style={{
          position: "sticky", top: 0, zIndex: 100,
          backgroundColor: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isDashboard && onToggleSidebar && (
              <button onClick={onToggleSidebar} style={{ background: "none", border: "none", color: "var(--text-muted)", padding: 8, display: "flex", borderRadius: 8, cursor: "pointer" }} className="sidebar-toggle-btn" aria-label="Toggle sidebar">
                <PanelLeft size={18} />
              </button>
            )}
            <Logo size={44} />
          </div>

          <div style={{ display: "flex", gap: 24, alignItems: "center" }} className="header-nav-links">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  fontSize: 14, fontWeight: 500,
                  color: location.pathname === link.path ? "var(--primary)" : "var(--text-secondary)",
                  transition: "color 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div style={{ flex: 1, maxWidth: 400, display: "flex", justifyContent: "center" }} className="header-search-container">
            <SearchBar />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={toggleTheme} style={{ background: "none", border: "none", color: "var(--text-muted)", padding: 8, display: "flex", borderRadius: 8, cursor: "pointer" }} aria-label="Toggle theme">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate("/messages")}
                  className="header-icon-btn"
                  style={{
                    position: "relative", background: "none", border: "none", color: location.pathname === "/messages" ? "var(--primary)" : "var(--text-muted)",
                    width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: 8, cursor: "pointer", zIndex: 1,
                  }}
                  aria-label="Messages"
                >
                  <MessageSquare size={18} />
                  {unreadCount > 0 ? (
                    <BadgeNumber count={unreadCount} />
                  ) : isConnected && (
                    <BadgeDot />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/notifications")}
                  className="header-icon-btn"
                  style={{
                    position: "relative", background: "none", border: "none", color: location.pathname === "/notifications" ? "var(--primary)" : "var(--text-muted)",
                    width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: 8, cursor: "pointer", zIndex: 1,
                  }}
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  {notificationCount > 0 && (
                    <BadgeNumber count={notificationCount} />
                  )}
                </button>

                <Dropdown
                  align="right"
                  trigger={
                    <div style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", padding: 2 }}>
                      <Avatar name={user?.name || "User"} size={32} />
                    </div>
                  }
                >
                  {(!user?.role || user?.role === "none") && (
                    <DropdownItem onClick={() => window.location.href = "/onboarding/select-role"}>
                      Complete Profile
                    </DropdownItem>
                  )}
                  {user?.role && user?.role !== "none" && !user?.onboardingCompleted && (
                    <DropdownItem onClick={() => window.location.href = "/onboarding/status"}>
                      Verification Status
                    </DropdownItem>
                  )}
                  <DropdownItem onClick={() => window.location.href = "/dashboard"}>
                    <LayoutDashboard size={16} /> Dashboard
                  </DropdownItem>
                  <DropdownItem onClick={() => window.location.href = "/profile"}>
                    <User size={16} /> Profile
                  </DropdownItem>
                  <DropdownItem onClick={() => { logout(); window.location.href = "/"; }}>
                    Logout
                  </DropdownItem>
                </Dropdown>
              </>
            ) : (
              <>
                <Link to="/login" style={{ textDecoration: "none" }}>
                  <button style={{ padding: "6px 14px", fontSize: 13, fontWeight: 600, backgroundColor: "transparent", color: "var(--primary)", border: "1px solid var(--primary)", borderRadius: "var(--radius-sm)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }} className="header-auth-btn">
                    <LogIn size={14} /> Log In
                  </button>
                </Link>
                <Link to="/signup" style={{ textDecoration: "none" }}>
                  <button style={{ padding: "6px 14px", fontSize: 13, fontWeight: 600, backgroundColor: "var(--primary)", color: "white", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }} className="header-auth-btn">
                    <UserPlus size={14} /> Sign Up
                  </button>
                </Link>
              </>
            )}

            <button
              onClick={() => { isDashboard && onToggleSidebar ? onToggleSidebar() : setMobileDrawerOpen(true); }}
              style={{ background: "none", border: "none", color: "var(--text)", padding: 8, display: "none", cursor: "pointer" }}
              className="header-mobile-btn"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer open={mobileDrawerOpen} onClose={() => setMobileDrawerOpen(false)} />

      <style>{`
        .header-icon-btn { transition: background-color 0.15s, color 0.15s; }
        .header-icon-btn:hover { background-color: var(--surface-hover); color: var(--text) !important; }
        @media (max-width: 1200px) {
          .header-nav-links { gap: 16px !important; }
          .header-search-container { max-width: 300px !important; }
        }
        @media (max-width: 1024px) {
          .header-nav-links { display: none !important; }
          .header-search-container { max-width: 280px !important; }
        }
        @media (max-width: 768px) {
          .header-search-container { display: none !important; }
          .header-auth-btn { display: none !important; }
          .header-mobile-btn { display: flex !important; }
          .sidebar-toggle-btn { display: none !important; }
        }
        @media (max-width: 380px) {
          .header-icon-btn { width: 34px !important; height: 34px !important; }
        }
      `}</style>
    </>
  );
}

function BadgeDot() {
  return (
    <span style={{
      position: "absolute", top: 6, right: 6, width: 8, height: 8,
      borderRadius: "50%", backgroundColor: "var(--primary)",
    }} />
  );
}

function BadgeNumber({ count }) {
  return (
    <span style={{
      position: "absolute", top: 2, right: 2, minWidth: 16, height: 16,
      borderRadius: 8, backgroundColor: "var(--danger)",
      color: "#fff", fontSize: 10, fontWeight: 700,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "0 4px",
    }}>
      {count > 99 ? "99+" : count}
    </span>
  );
}
