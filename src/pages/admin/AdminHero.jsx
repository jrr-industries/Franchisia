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
  formRow: { display: "flex", gap: 12 },
  halfField: { flex: 1 },
  saveBtn: { display: "flex", alignItems: "center", gap: 8, padding: "10px 24px", borderRadius: 8, border: "none", backgroundColor: "var(--primary)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  card: { padding: 20, borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--surface)", marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: 600, marginBottom: 16 },
};

export default function AdminHero() {
  const [form, setForm] = useState({
    headline: "", subheadline: "", description: "", ctaText: "", ctaUrl: "",
    secondaryCtaText: "", secondaryCtaUrl: "", backgroundImage: "", heroIllustration: "",
    rotatingQuotes: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API}/settings/hero`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const val = data.value || {};
          setForm({
            headline: val.headline || "",
            subheadline: val.subheadline || "",
            description: val.description || "",
            ctaText: val.ctaText || "",
            ctaUrl: val.ctaUrl || "",
            secondaryCtaText: val.secondaryCtaText || "",
            secondaryCtaUrl: val.secondaryCtaUrl || "",
            backgroundImage: val.backgroundImage || "",
            heroIllustration: val.heroIllustration || "",
            rotatingQuotes: Array.isArray(val.rotatingQuotes) ? val.rotatingQuotes.join("\n") : val.rotatingQuotes || "",
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
      const body = {
        ...form,
        rotatingQuotes: form.rotatingQuotes ? form.rotatingQuotes.split("\n").filter(Boolean).map((q) => q.trim()) : [],
      };
      const res = await fetch(`${API}/settings/hero`, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ value: body }) });
      if (res.ok) { setMessage("Settings saved successfully."); setTimeout(() => setMessage(""), 3000); }
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
        <h1 style={s.title}>Hero Section</h1>
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
          <label style={s.label}>Headline</label>
          <input style={s.input} value={form.headline} onChange={(e) => setForm((prev) => ({ ...prev, headline: e.target.value }))} />
        </div>
        <div style={s.fieldGroup}>
          <label style={s.label}>Subheadline</label>
          <input style={s.input} value={form.subheadline} onChange={(e) => setForm((prev) => ({ ...prev, subheadline: e.target.value }))} />
        </div>
        <div style={s.fieldGroup}>
          <label style={s.label}>Description</label>
          <textarea style={s.textarea} value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
        </div>
      </div>

      <div style={s.card}>
        <h2 style={s.cardTitle}>Call to Action</h2>
        <div style={s.formRow}>
          <div style={s.halfField}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Primary CTA Text</label>
              <input style={s.input} value={form.ctaText} onChange={(e) => setForm((prev) => ({ ...prev, ctaText: e.target.value }))} />
            </div>
          </div>
          <div style={s.halfField}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Primary CTA URL</label>
              <input style={s.input} value={form.ctaUrl} onChange={(e) => setForm((prev) => ({ ...prev, ctaUrl: e.target.value }))} />
            </div>
          </div>
        </div>
        <div style={s.formRow}>
          <div style={s.halfField}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Secondary CTA Text</label>
              <input style={s.input} value={form.secondaryCtaText} onChange={(e) => setForm((prev) => ({ ...prev, secondaryCtaText: e.target.value }))} />
            </div>
          </div>
          <div style={s.halfField}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Secondary CTA URL</label>
              <input style={s.input} value={form.secondaryCtaUrl} onChange={(e) => setForm((prev) => ({ ...prev, secondaryCtaUrl: e.target.value }))} />
            </div>
          </div>
        </div>
      </div>

      <div style={s.card}>
        <h2 style={s.cardTitle}>Media</h2>
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
      </div>

      <div style={s.card}>
        <h2 style={s.cardTitle}>Rotating Quotes</h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>One quote per line</p>
        <div style={s.fieldGroup}>
          <textarea style={{ ...s.textarea, minHeight: 120 }} value={form.rotatingQuotes} onChange={(e) => setForm((prev) => ({ ...prev, rotatingQuotes: e.target.value }))} placeholder="Quote 1&#10;Quote 2&#10;Quote 3" />
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
