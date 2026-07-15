import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Loader2 } from "lucide-react";

const API = "/api/admin/cms";

const s = {
  page: { padding: 24 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 700 },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 },
  input: { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--background)", color: "var(--text)", fontSize: 14, outline: "none", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--background)", color: "var(--text)", fontSize: 14, outline: "none", minHeight: 100, fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" },
  saveBtn: { display: "flex", alignItems: "center", gap: 8, padding: "10px 24px", borderRadius: 8, border: "none", backgroundColor: "var(--primary)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  card: { padding: 20, borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--surface)", marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: 600, marginBottom: 16 },
  formRow: { display: "flex", gap: 12 },
  halfField: { flex: 1 },
  checkboxRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 16 },
};

export default function AdminNewsletterEditor() {
  const [form, setForm] = useState({
    title: "", subtitle: "", successMessage: "", buttonText: "", placeholder: "", isActive: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API}/newsletter`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setForm({
            title: data.title || "",
            subtitle: data.subtitle || "",
            successMessage: data.successMessage || "",
            buttonText: data.buttonText || "",
            placeholder: data.placeholder || "",
            isActive: data.isActive ?? false,
          });
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`${API}/newsletter`, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(form) });
      if (res.ok) { setMessage("Newsletter settings saved successfully."); setTimeout(() => setMessage(""), 3000); }
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
        <h1 style={s.title}>Newsletter Settings</h1>
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
        <h2 style={s.cardTitle}>Newsletter Section</h2>
        <div style={s.fieldGroup}>
          <label style={s.label}>Title</label>
          <input style={s.input} value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
        </div>
        <div style={s.fieldGroup}>
          <label style={s.label}>Subtitle</label>
          <input style={s.input} value={form.subtitle} onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))} />
        </div>
        <div style={s.fieldGroup}>
          <label style={s.label}>Success Message</label>
          <input style={s.input} value={form.successMessage} onChange={(e) => setForm((prev) => ({ ...prev, successMessage: e.target.value }))} />
        </div>
        <div style={s.formRow}>
          <div style={s.halfField}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Button Text</label>
              <input style={s.input} value={form.buttonText} onChange={(e) => setForm((prev) => ({ ...prev, buttonText: e.target.value }))} />
            </div>
          </div>
          <div style={s.halfField}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Input Placeholder</label>
              <input style={s.input} value={form.placeholder} onChange={(e) => setForm((prev) => ({ ...prev, placeholder: e.target.value }))} />
            </div>
          </div>
        </div>
        <div style={s.checkboxRow}>
          <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))} />
          <label htmlFor="isActive" style={s.label}>Active</label>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
