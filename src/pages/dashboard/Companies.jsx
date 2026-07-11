import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Users, Briefcase, Building2, SearchIcon } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import VerifiedBadge from "../../components/ui/VerifiedBadge";
import useCompanyStore from "../../store/companyStore";
import { useAuth } from "../../context/AuthContext";

const API = "/api";

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default function Companies() {
  const { user: currentUser } = useAuth();
  const companies = useCompanyStore((s) => s.companies);
  const loading = useCompanyStore((s) => s.loading);
  const error = useCompanyStore((s) => s.error);
  const fetchCompanies = useCompanyStore((s) => s.fetchCompanies);
  const initSocketListeners = useCompanyStore((s) => s.initSocketListeners);
  const removeSocketListeners = useCompanyStore((s) => s.removeSocketListeners);

  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCompanies();
    initSocketListeners();
    return () => {
      removeSocketListeners();
    };
  }, [fetchCompanies, initSocketListeners, removeSocketListeners]);

  const visible = companies.filter((c) => c.ownerId !== currentUser?.id);

  const filtered = visible.filter((c) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      c.name?.toLowerCase().includes(q) ||
      c.industry?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Companies Directory</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
          Browse franchise companies and explore opportunities.
        </p>
      </div>

      <div style={{ marginBottom: 24, position: "relative" }}>
        <SearchIcon size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", zIndex: 1 }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search companies by name, industry, or location..."
          style={{
            width: "100%", padding: "10px 14px 10px 40px", fontSize: 14,
            backgroundColor: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)", color: "var(--text)", outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} padding="20px">
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                <div style={{ width: 50, height: 50, borderRadius: 12, background: "var(--border)", animation: "shimmer 1.5s infinite" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ width: "70%", height: 14, borderRadius: 4, background: "var(--border)", marginBottom: 6, animation: "shimmer 1.5s infinite" }} />
                  <div style={{ width: "40%", height: 12, borderRadius: 4, background: "var(--border)", animation: "shimmer 1.5s infinite" }} />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                {[1, 2, 3].map((j) => (
                  <div key={j} style={{ width: "60%", height: 12, borderRadius: 4, background: "var(--border)", animation: "shimmer 1.5s infinite" }} />
                ))}
              </div>
              <div style={{ width: "100%", height: 36, borderRadius: "var(--radius-sm)", background: "var(--border)", animation: "shimmer 1.5s infinite" }} />
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card padding="32px" style={{ textAlign: "center" }}>
          <Building2 size={40} style={{ color: "var(--text-muted)", margin: "0 auto 12px", display: "block" }} />
          <p style={{ fontSize: 14, color: "var(--danger)", marginBottom: 12 }}>{error}</p>
          <Button variant="primary" size="sm" onClick={fetchCompanies}>Retry</Button>
        </Card>
      ) : filtered.length === 0 ? (
        <Card padding="48px" style={{ textAlign: "center" }}>
          <Building2 size={48} style={{ color: "var(--text-muted)", margin: "0 auto 12px", display: "block" }} />
          <p style={{ fontSize: 16, color: "var(--text-secondary)", fontWeight: 500, marginBottom: 4 }}>
            {search ? "No companies found matching your search." : "No companies found."}
          </p>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
            {search ? "Try a different search term." : "Companies will appear here once they are created."}
          </p>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {filtered.map((c) => (
            <Card key={c.id} padding="20px" hover>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                {c.logoUrl ? (
                  <img src={c.logoUrl} alt={c.name} style={{ width: 50, height: 50, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 50, height: 50, borderRadius: 12, backgroundColor: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, color: "var(--primary)", flexShrink: 0 }}>
                    {getInitials(c.name)}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</h3>
                    {c.isVerified && <VerifiedBadge size={16} />}
                  </div>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{c.industry}</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                {(c.city || c.country) && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                    <MapPin size={14} /> {[c.city, c.country].filter(Boolean).join(", ")}
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                  <Users size={14} /> {formatCount(c.followerCount)} followers
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                  <Briefcase size={14} /> {c.listingCount} open {c.listingCount === 1 ? "opportunity" : "opportunities"}
                </div>
              </div>
              <Link to={`/company/${c.slug || c.id}`} style={{ textDecoration: "none" }}>
                <Button variant="primary" size="sm" fullWidth>View Company</Button>
              </Link>
            </Card>
          ))}
        </div>
      )}

      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>
    </div>
  );
}

function formatCount(n) {
  if (!n && n !== 0) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}
