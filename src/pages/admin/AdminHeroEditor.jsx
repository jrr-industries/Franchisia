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

export default function AdminHeroEditor() {
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    title: "", subtitle: "", description: "",
    primaryButtonText: "", primaryButtonUrl: "",
    secondaryButtonText: "", secondaryButtonUrl: "",
    backgroundImage: "", heroIllustration: "",
    floatingCards: "[]", isActive: true, status: "published",
  });

  const fetchHero = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/hero`, { credentials: "include" });
      if (res.ok) {
        const d = await res.json();
        const item = d.hero || d;
        if (item && item.id) {
          setHero(item);
          setForm({
            title: item.title || "",
            subtitle: item.subtitle || "",
            description: item.description || "",
            primaryButtonText: item.primaryButtonText || "",
            primaryButtonUrl: item.primaryButtonUrl || "",
            secondaryButtonText: item.secondaryButtonText || "",
            secondaryButtonUrl: item.secondaryButtonUrl || "",
            backgroundImage: item.backgroundImage || "",
            heroIllustration: item.heroIllustration || "",
            floatingCards: item.floatingCards ? JSON.stringify(item.floatingCards) : "[]",
            isActive: item.isActive ?? true,
            status: item.status || "published",
          });
        }
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchHero(); }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      let parsedCards;
      try { parsedCards = JSON.parse(form.floatingCards); }
      catch { parsedCards = []; }
      const body = { ...form, floatingCards: parsedCards };
      const url = hero ? `${API}/hero/${hero.id}` : `${API}/hero`;
      const method = hero ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (res.ok) {
        const d = await res.json();
        setHero(d.hero || d);
        setMessage("Hero section saved successfully.");
      } else {
        setMessage("Failed to save hero section.");
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
        <h1 style={s.title}>Hero Section Editor</h1>
      </div>

      {message && <div style={s.message}>{message}</div>}

      <div style={s.card}>
        <div style={s.formRow}>
          <div style={s.halfField}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Title</label>
              <input style={s.input} value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
            </div>
          </div>
          <div style={s.halfField}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Subtitle</label>
              <input style={s.input} value={form.subtitle} onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))} />
            </div>
          </div>
        </div>

        <div style={s.fieldGroup}>
          <label style={s.label}>Description</label>
          <textarea style={s.textarea} value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
        </div>

        <div style={s.formRow}>
          <div style={s.halfField}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Primary Button Text</label>
              <input style={s.input} value={form.primaryButtonText} onChange={(e) => setForm((prev) => ({ ...prev, primaryButtonText: e.target.value }))} />
            </div>
          </div>
          <div style={s.halfField}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Primary Button URL</label>
              <input style={s.input} value={form.primaryButtonUrl} onChange={(e) => setForm((prev) => ({ ...prev, primaryButtonUrl: e.target.value }))} />
            </div>
          </div>
        </div>

        <div style={s.formRow}>
          <div style={s.halfField}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Secondary Button Text</label>
              <input style={s.input} value={form.secondaryButtonText} onChange={(e) => setForm((prev) => ({ ...prev, secondaryButtonText: e.target.value }))} />
            </div>
          </div>
          <div style={s.halfField}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Secondary Button URL</label>
              <input style={s.input} value={form.secondaryButtonUrl} onChange={(e) => setForm((prev) => ({ ...prev, secondaryButtonUrl: e.target.value }))} />
            </div>
          </div>
        </div>

        <div style={s.formRow}>
          <div style={s.halfField}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Background Image URL</label>
              <input style={s.input} value={form.backgroundImage} onChange={(e) => setForm((prev) => ({ ...prev, backgroundImage: e.target.value }))} />
            </div>
          </div>
          <div style={s.halfField}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Hero Illustration URL</label>
              <input style={s.input} value={form.heroIllustration} onChange={(e) => setForm((prev) => ({ ...prev, heroIllustration: e.target.value }))} />
            </div>
          </div>
        </div>

        <div style={s.fieldGroup}>
          <label style={s.label}>Floating Cards (JSON array)</label>
          <textarea style={{ ...s.textarea, minHeight: 100 }} value={form.floatingCards} onChange={(e) => setForm((prev) => ({ ...prev, floatingCards: e.target.value }))} placeholder='[{"icon":"FaChart","value":"10k+","label":"Users"}]' />
        </div>

        <div style={s.formRow}>
          <div style={s.halfField}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Status</label>
              <select style={s.select} value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
          <div style={{ ...s.halfField, display: "flex", alignItems: "flex-end", paddingBottom: 16 }}>
            <div style={s.checkboxRow}>
              <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))} />
              <label htmlFor="isActive" style={s.label}>Active</label>
            </div>
          </div>
        </div>

        <div style={s.saveBtnRow}>
          <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
            {hero ? "Update" : "Create"}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
