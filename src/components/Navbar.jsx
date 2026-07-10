import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Moon, Sun, Bell, LogIn, UserPlus, LayoutDashboard, User } from "lucide-react";
import Button from "./ui/Button";
import Avatar from "./ui/Avatar";
import Dropdown, { DropdownItem } from "./ui/Dropdown";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import VerifiedBadge from "./ui/VerifiedBadge";
import logo from "../assets/logo.png";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Pricing", path: "/pricing" },
  { label: "Contact", path: "/contact" },
  { label: "FAQ", path: "/faq" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated, user, isVerified, logout } = useAuth();
  const location = useLocation();

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <img src={logo} alt="Franchisia" style={{ height: 36, width: 'auto' }} />
          <span style={{ fontSize: 20, fontWeight: 800, color: "var(--text)" }}>Franchisia</span>
        </Link>

        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: location.pathname === link.path ? "var(--primary)" : "var(--text-secondary)",
                transition: "color 0.2s",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={toggleTheme} style={{ background: "none", border: "none", color: "var(--text)", padding: 8, display: "flex", borderRadius: 8 }}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <Dropdown
              align="right"
              trigger={
                <div style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <Avatar name={user?.name || "User"} size={32} />
                  <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{user?.name || "User"}</span>
                  {isVerified && <VerifiedBadge size={14} />}
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
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" icon={<LogIn size={16} />}>Log In</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" icon={<UserPlus size={16} />}>Sign Up</Button>
              </Link>
            </>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ display: "none", background: "none", border: "none", color: "var(--text)", padding: 8 }}
            className="mobile-menu-btn"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div style={{ padding: 16, borderTop: "1px solid var(--border)" }} className="container">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block",
                padding: "12px 0",
                fontSize: 16,
                color: location.pathname === link.path ? "var(--primary)" : "var(--text)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
          nav > div:first-child > div:nth-child(2) { display: none; }
          nav > div:first-child > div:nth-child(3) > a { display: none; }
        }
      `}</style>
    </nav>
  );
}
