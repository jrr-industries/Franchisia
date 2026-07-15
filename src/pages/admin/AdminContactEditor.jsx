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
};

export default function AdminContactEditor() {
  const [form, setForm] = useState({
    email: "", phone: "", address: "", businessHours: "", googleMapUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API}/contact`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setForm({
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            businessHours: data.businessHours || "",
            googleMapUrl: data.googleMapUrl || "",
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
      const res = await fetch(`${API}/contact`, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(form) });
      if (res.ok) { setMessage("Contact information saved successfully."); setTimeout(() => setMessage(""), 3000); }
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
        <h1 style={s.title}>Contact Information</h1>
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
        <h2 style={s.cardTitle}>Contact Details</h2>
        <div style={s.formRow}>
          <div style={s.halfField}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Email</label>
              <input style={s.input} value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
            </div>
          </div>
          <div style={s.halfField}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Phone</label>
              <input style={s.input} value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
            </div>
          </div>
        </div>
        <div style={s.fieldGroup}>
          <label style={s.label}>Address</label>
          <textarea style={s.textarea} value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} />
        </div>
        <div style={s.fieldGroup}>
          <label style={s.label}>Business Hours</label>
          <input style={s.input} value={form.businessHours} onChange={(e) => setForm((prev) => ({ ...prev, businessHours: e.target.value }))} />
        </div>
        <div style={s.fieldGroup}>
          <label style={s.label}>Google Map URL</label>
          <input style={s.input} value={form.googleMapUrl} onChange={(e) => setForm((prev) => ({ ...prev, googleMapUrl: e.target.value }))} />
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
