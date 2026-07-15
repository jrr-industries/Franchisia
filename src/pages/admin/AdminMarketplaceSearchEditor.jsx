import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Plus, Edit3, Trash2, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

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
  textarea: { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--background)", color: "var(--text)", fontSize: 14, outline: "none", minHeight: 80, fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" },
  select: { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--background)", color: "var(--text)", fontSize: 14, outline: "none", boxSizing: "border-box" },
  saveBtn: { display: "flex", alignItems: "center", gap: 8, padding: "10px 24px", borderRadius: 8, border: "none", backgroundColor: "var(--primary)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  cancelBtn: { padding: "10px 24px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "transparent", color: "var(--text)", fontSize: 14, cursor: "pointer" },
  iconBtn: { background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 6, borderRadius: 6 },
  dangerBtn: { background: "none", border: "none", color: "#EF4444", cursor: "pointer", padding: 6, borderRadius: 6 },
  formRow: { display: "flex", gap: 12 },
  halfField: { flex: 1 },
  checkboxRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 16 },
  pagination: { display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 24 },
  pageBtn: { padding: "8px 16px", borderRadius: 6, border: "1px solid var(--border)", backgroundColor: "var(--surface)", color: "var(--text)", cursor: "pointer", fontSize: 13 },
  pageBtnActive: { padding: "8px 16px", borderRadius: 6, border: "none", backgroundColor: "var(--primary)", color: "#fff", cursor: "pointer", fontSize: 13 },
  saveBtnRow: { display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 },
  message: { padding: "12px 16px", borderRadius: 8, backgroundColor: "#D1FAE5", color: "#065F46", fontSize: 14, marginBottom: 20 },
};

export default function AdminMarketplaceSearchEditor() {
  const [searchConfig, setSearchConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    title: "", description: "",
    defaultIndustries: "", defaultLocations: "",
    investmentRanges: "", placeholder: "",
    searchButtonText: "", isActive: true,
  });

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/marketplace-search`, { credentials: "include" });
      if (res.ok) {
        const d = await res.json();
        const item = d.marketplaceSearch || d;
        if (item && item.id) {
          setSearchConfig(item);
          setForm({
            title: item.title || "",
            description: item.description || "",
            defaultIndustries: Array.isArray(item.defaultIndustries) ? item.defaultIndustries.join(", ") : (item.defaultIndustries || ""),
            defaultLocations: Array.isArray(item.defaultLocations) ? item.defaultLocations.join(", ") : (item.defaultLocations || ""),
            investmentRanges: Array.isArray(item.investmentRanges) ? item.investmentRanges.join(", ") : (item.investmentRanges || ""),
            placeholder: item.placeholder || "",
            searchButtonText: item.searchButtonText || "",
            isActive: item.isActive ?? true,
          });
        }
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchConfig(); }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const body = {
        ...form,
        defaultIndustries: form.defaultIndustries.split(",").map((s) => s.trim()).filter(Boolean),
        defaultLocations: form.defaultLocations.split(",").map((s) => s.trim()).filter(Boolean),
        investmentRanges: form.investmentRanges.split(",").map((s) => s.trim()).filter(Boolean),
      };
      const url = searchConfig ? `${API}/marketplace-search/${searchConfig.id}` : `${API}/marketplace-search`;
      const method = searchConfig ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (res.ok) {
        const d = await res.json();
        setSearchConfig(d.marketplaceSearch || d);
        setMessage("Marketplace search config saved successfully.");
      } else {
        setMessage("Failed to save marketplace search config.");
      }
    } catch (e) { console.error(e); setMessage("An error occurred."); }
    finally { setSaving(false); }
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
        <h1 style={s.title}>Marketplace Search Editor</h1>
      </div>

      {message && <div style={s.message}>{message}</div>}

      <div style={s.card}>
        <div style={s.fieldGroup}>
          <label style={s.label}>Title</label>
          <input style={s.input} value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
        </div>

        <div style={s.fieldGroup}>
          <label style={s.label}>Description</label>
          <textarea style={s.textarea} value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
        </div>

        <div style={s.formRow}>
          <div style={s.halfField}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Default Industries (comma-separated)</label>
              <input style={s.input} value={form.defaultIndustries} onChange={(e) => setForm((prev) => ({ ...prev, defaultIndustries: e.target.value }))} placeholder="Food, Retail, Healthcare" />
            </div>
          </div>
          <div style={s.halfField}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Default Locations (comma-separated)</label>
              <input style={s.input} value={form.defaultLocations} onChange={(e) => setForm((prev) => ({ ...prev, defaultLocations: e.target.value }))} placeholder="New York, Los Angeles" />
            </div>
          </div>
        </div>

        <div style={s.fieldGroup}>
          <label style={s.label}>Investment Ranges (comma-separated)</label>
          <input style={s.input} value={form.investmentRanges} onChange={(e) => setForm((prev) => ({ ...prev, investmentRanges: e.target.value }))} placeholder="$50k-$100k, $100k-$500k" />
        </div>

        <div style={s.formRow}>
          <div style={s.halfField}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Placeholder Text</label>
              <input style={s.input} value={form.placeholder} onChange={(e) => setForm((prev) => ({ ...prev, placeholder: e.target.value }))} placeholder="Search franchises..." />
            </div>
          </div>
          <div style={s.halfField}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Search Button Text</label>
              <input style={s.input} value={form.searchButtonText} onChange={(e) => setForm((prev) => ({ ...prev, searchButtonText: e.target.value }))} placeholder="Search" />
            </div>
          </div>
        </div>

        <div style={s.checkboxRow}>
          <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))} />
          <label htmlFor="isActive" style={s.label}>Active</label>
        </div>

        <div style={s.saveBtnRow}>
          <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
            {searchConfig ? "Update" : "Create"}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
