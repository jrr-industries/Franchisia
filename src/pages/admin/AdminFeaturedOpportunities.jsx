import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, StarOff, Loader2, Briefcase } from "lucide-react";

const API = "/api/admin/cms";

const s = {
  page: { padding: 24 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 700 },
  addBtn: { display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, border: "none", backgroundColor: "var(--primary)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  card: { padding: 20, borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--surface)", marginBottom: 12 },
  emptyState: { textAlign: "center", padding: 60, color: "var(--text-muted)" },
  modal: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 },
  modalContent: { backgroundColor: "var(--surface)", borderRadius: 16, padding: 32, width: "100%", maxWidth: 500, maxHeight: "90vh", overflow: "auto" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 700 },
  closeBtn: { background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 },
  input: { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--background)", color: "var(--text)", fontSize: 14, outline: "none", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--background)", color: "var(--text)", fontSize: 14, outline: "none", minHeight: 100, fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" },
  select: { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--background)", color: "var(--text)", fontSize: 14, outline: "none", boxSizing: "border-box" },
  saveBtn: { display: "flex", alignItems: "center", gap: 8, padding: "10px 24px", borderRadius: 8, border: "none", backgroundColor: "var(--primary)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", marginLeft: "auto" },
  cancelBtn: { padding: "10px 24px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "transparent", color: "var(--text)", fontSize: 14, cursor: "pointer" },
  iconBtn: { background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 6, borderRadius: 6 },
  dangerBtn: { background: "none", border: "none", color: "#EF4444", cursor: "pointer", padding: 6, borderRadius: 6 },
  formRow: { display: "flex", gap: 12 },
  halfField: { flex: 1 },
  checkboxRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 16 },
  pagination: { display: "flex", justifyContent: "center", gap: 8, marginTop: 20 },
  pageBtn: { padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "transparent", color: "var(--text)", fontSize: 14, cursor: "pointer" },
  pageBtnActive: { padding: "8px 14px", borderRadius: 8, border: "none", backgroundColor: "var(--primary)", color: "#fff", fontSize: 14, cursor: "pointer" },
  saveBtnRow: { display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 },
  message: { padding: "12px 16px", borderRadius: 8, fontSize: 14, marginBottom: 20 },
};

export default function AdminFeaturedOpportunities() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/marketplace/listings?limit=100", { credentials: "include" });
      if (res.ok) { const d = await res.json(); setListings(d.listings || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchListings(); }, []);

  const toggleFeatured = async (id) => {
    setToggling(id);
    try {
      const res = await fetch(`/api/admin/marketplace/listings/${id}/feature`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        setListings((prev) => prev.map((l) => l.id === id ? { ...l, isFeatured: !l.isFeatured } : l));
      }
    } catch (e) { console.error(e); }
    finally { setToggling(null); }
  };

  if (loading) {
    return (
      <div style={s.page}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
          <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "var(--primary)" }} />
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>Featured Opportunities</h1>
        <span style={{ fontSize: 14, color: "var(--text-muted)" }}>{listings.filter((l) => l.isFeatured).length} featured</span>
      </div>

      {listings.length === 0 ? (
        <div style={s.emptyState}>
          <p style={{ fontSize: 16 }}>No listings found</p>
        </div>
      ) : (
        listings.map((listing) => (
          <div key={listing.id} style={s.card}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {listing.images?.[0] ? (
                <img src={listing.images[0]} alt={listing.title} style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover" }} />
              ) : (
                <div style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Briefcase size={24} color="var(--primary)" />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{listing.title}</h3>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "2px 0 0" }}>
                  {listing.company?.name || "No company"} &bull; {listing.status}
                </p>
              </div>
              <button
                onClick={() => toggleFeatured(listing.id)}
                disabled={toggling === listing.id}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 16px", borderRadius: 8,
                  border: "1px solid",
                  borderColor: listing.isFeatured ? "#FCD34D" : "var(--border)",
                  backgroundColor: listing.isFeatured ? "#FEF3C7" : "transparent",
                  color: listing.isFeatured ? "#D97706" : "var(--text-muted)",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >
                {toggling === listing.id ? (
                  <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                ) : listing.isFeatured ? (
                  <Star size={14} />
                ) : (
                  <StarOff size={14} />
                )}
                {listing.isFeatured ? "Featured" : "Feature"}
              </button>
            </div>
          </div>
        ))
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
