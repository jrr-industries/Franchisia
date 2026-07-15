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
  iconBtn: { background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 6, borderRadius: 6 },
  dangerBtn: { background: "none", border: "none", color: "#EF4444", cursor: "pointer", padding: 6, borderRadius: 6 },
  saveBtn: { display: "flex", alignItems: "center", gap: 8, padding: "10px 24px", borderRadius: 8, border: "none", backgroundColor: "var(--primary)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  cancelBtn: { padding: "10px 24px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "transparent", color: "var(--text)", fontSize: 14, cursor: "pointer" },
  formRow: { display: "flex", gap: 12 },
  halfField: { flex: 1 },
  checkboxRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: 600, marginBottom: 16 },
};

export default function AdminAIRecommendationsEditor() {
  const [form, setForm] = useState({
    title: "", subtitle: "", description: "", features: "",
    buttonText: "", buttonUrl: "", isActive: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API}/ai-section`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const val = data.value || data || {};
          setForm({
            title: val.title || "",
            subtitle: val.subtitle || "",
            description: val.description || "",
            features: Array.isArray(val.features) ? JSON.stringify(val.features, null, 2) : val.features || "",
            buttonText: val.buttonText || "",
            buttonUrl: val.buttonUrl || "",
            isActive: val.isActive ?? false,
          });
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      let features = [];
      try { features = form.features ? JSON.parse(form.features) : []; } catch { features = []; }
      const body = { ...form, features };
      const res = await fetch(`${API}/ai-section`, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (res.ok) { setMessage("AI Recommendations section saved successfully."); setTimeout(() => setMessage(""), 3000); }
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
        <h1 style={s.title}>AI Recommendations Section</h1>
        <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
          Save Changes
        </button>
      </div>

      {message && (
        <div style={{ padding: "12px 16px", borderRadius: 8, backgroundColor: "#D1FAE5", color: "#065F46", fontSize: 14, marginBottom: 20 }}>
          {message}
        </div>
      )}

      <div style={s.card}>
        <h2 style={s.cardTitle}>Main Content</h2>
        <div style={s.fieldGroup}>
          <label style={s.label}>Title</label>
          <input style={s.input} value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
        </div>
        <div style={s.fieldGroup}>
          <label style={s.label}>Subtitle</label>
          <input style={s.input} value={form.subtitle} onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))} />
        </div>
        <div style={s.fieldGroup}>
          <label style={s.label}>Description</label>
          <textarea style={s.textarea} value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
        </div>
      </div>

      <div style={s.card}>
        <h2 style={s.cardTitle}>Features</h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
          JSON array of feature objects with title and description
        </p>
        <div style={s.fieldGroup}>
          <textarea style={{ ...s.textarea, minHeight: 180, fontFamily: "monospace" }} value={form.features} onChange={(e) => setForm((prev) => ({ ...prev, features: e.target.value }))} placeholder='[&#10;  { "title": "Feature 1", "description": "Description here" },&#10;  { "title": "Feature 2", "description": "Description here" }&#10;]' />
        </div>
      </div>

      <div style={s.card}>
        <h2 style={s.cardTitle}>Call to Action</h2>
        <div style={s.formRow}>
          <div style={s.halfField}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Button Text</label>
              <input style={s.input} value={form.buttonText} onChange={(e) => setForm((prev) => ({ ...prev, buttonText: e.target.value }))} />
            </div>
          </div>
          <div style={s.halfField}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Button URL</label>
              <input style={s.input} value={form.buttonUrl} onChange={(e) => setForm((prev) => ({ ...prev, buttonUrl: e.target.value }))} />
            </div>
          </div>
        </div>
      </div>

      <div style={s.card}>
        <div style={s.checkboxRow}>
          <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))} />
          <label htmlFor="isActive" style={s.label}>Active</label>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
