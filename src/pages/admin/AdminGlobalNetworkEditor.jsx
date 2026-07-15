import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Loader2 } from "lucide-react";

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

export default function AdminGlobalNetworkEditor() {
  const [form, setForm] = useState({
    title: "", subtitle: "", description: "", backgroundImage: "",
    quote: "", quoteAuthor: "", animation: "none", isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/global-network`, { credentials: "include" });
      if (res.ok) {
        const d = await res.json();
        const item = d.item || d.data || d;
        if (item) {
          setForm({
            title: item.title || "",
            subtitle: item.subtitle || "",
            description: item.description || "",
            backgroundImage: item.backgroundImage || "",
            quote: item.quote || "",
            quoteAuthor: item.quoteAuthor || "",
            animation: item.animation || "none",
            isActive: item.isActive ?? true,
          });
        }
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`${API}/global-network`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      if (res.ok) { setMessage("Saved successfully."); setTimeout(() => setMessage(""), 3000); }
    } catch (e) { console.error(e); }
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
        <h1 style={s.title}>Global Network Section</h1>
        <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
          Save Changes
        </button>
      </div>

      {message && (
        <div style={{ ...s.message, backgroundColor: "#D1FAE5", color: "#065F46" }}>{message}</div>
      )}

      <div style={s.card}>
        <div style={s.fieldGroup}>
          <label style={s.label}>Title</label>
          <input style={s.input} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
        </div>
        <div style={s.fieldGroup}>
          <label style={s.label}>Subtitle</label>
          <input style={s.input} value={form.subtitle} onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))} />
        </div>
        <div style={s.fieldGroup}>
          <label style={s.label}>Description</label>
          <textarea style={s.textarea} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
        </div>
        <div style={s.fieldGroup}>
          <label style={s.label}>Background Image URL</label>
          <input style={s.input} value={form.backgroundImage} onChange={(e) => setForm((p) => ({ ...p, backgroundImage: e.target.value }))} />
        </div>
      </div>

      <div style={s.card}>
        <div style={s.formRow}>
          <div style={s.halfField}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Quote</label>
              <input style={s.input} value={form.quote} onChange={(e) => setForm((p) => ({ ...p, quote: e.target.value }))} />
            </div>
          </div>
          <div style={s.halfField}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Quote Author</label>
              <input style={s.input} value={form.quoteAuthor} onChange={(e) => setForm((p) => ({ ...p, quoteAuthor: e.target.value }))} />
            </div>
          </div>
        </div>
        <div style={s.formRow}>
          <div style={s.halfField}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Animation</label>
              <select style={s.select} value={form.animation} onChange={(e) => setForm((p) => ({ ...p, animation: e.target.value }))}>
                <option value="none">None</option>
                <option value="fade">Fade</option>
                <option value="slide">Slide</option>
                <option value="zoom">Zoom</option>
              </select>
            </div>
          </div>
          <div style={s.halfField}>
            <div style={s.checkboxRow}>
              <input type="checkbox" id="gnIsActive" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} />
              <label htmlFor="gnIsActive" style={s.label}>Active</label>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
