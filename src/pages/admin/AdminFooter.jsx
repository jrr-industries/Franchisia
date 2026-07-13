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
  socialGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 },
};

export default function AdminFooter() {
  const [form, setForm] = useState({
    companyDescription: "", email: "", phone: "", address: "", copyright: "",
    facebook: "", twitter: "", linkedin: "", instagram: "", youtube: "",
    quickLinks: "", supportLinks: "", communityLinks: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API}/settings/footer`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const val = data.value || {};
          setForm({
            companyDescription: val.companyDescription || "",
            email: val.email || "",
            phone: val.phone || "",
            address: val.address || "",
            copyright: val.copyright || "",
            facebook: val.facebook || "",
            twitter: val.twitter || "",
            linkedin: val.linkedin || "",
            instagram: val.instagram || "",
            youtube: val.youtube || "",
            quickLinks: Array.isArray(val.quickLinks) ? val.quickLinks.join("\n") : val.quickLinks || "",
            supportLinks: Array.isArray(val.supportLinks) ? val.supportLinks.join("\n") : val.supportLinks || "",
            communityLinks: Array.isArray(val.communityLinks) ? val.communityLinks.join("\n") : val.communityLinks || "",
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
        quickLinks: form.quickLinks ? form.quickLinks.split("\n").filter(Boolean).map((l) => l.trim()) : [],
        supportLinks: form.supportLinks ? form.supportLinks.split("\n").filter(Boolean).map((l) => l.trim()) : [],
        communityLinks: form.communityLinks ? form.communityLinks.split("\n").filter(Boolean).map((l) => l.trim()) : [],
      };
      const res = await fetch(`${API}/settings/footer`, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ value: body }) });
      if (res.ok) { setMessage("Footer settings saved successfully."); setTimeout(() => setMessage(""), 3000); }
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
        <h1 style={s.title}>Footer Settings</h1>
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
        <h2 style={s.cardTitle}>Company Info</h2>
        <div style={s.fieldGroup}>
          <label style={s.label}>Company Description</label>
          <textarea style={s.textarea} value={form.companyDescription} onChange={(e) => setForm((prev) => ({ ...prev, companyDescription: e.target.value }))} />
        </div>
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
          <input style={s.input} value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} />
        </div>
        <div style={s.fieldGroup}>
          <label style={s.label}>Copyright</label>
          <input style={s.input} value={form.copyright} onChange={(e) => setForm((prev) => ({ ...prev, copyright: e.target.value }))} placeholder="© 2024 Franchisia. All rights reserved." />
        </div>
      </div>

      <div style={s.card}>
        <h2 style={s.cardTitle}>Social Links</h2>
        <div style={s.socialGrid}>
          <div style={s.fieldGroup}>
            <label style={s.label}>Facebook</label>
            <input style={s.input} value={form.facebook} onChange={(e) => setForm((prev) => ({ ...prev, facebook: e.target.value }))} />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>Twitter / X</label>
            <input style={s.input} value={form.twitter} onChange={(e) => setForm((prev) => ({ ...prev, twitter: e.target.value }))} />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>LinkedIn</label>
            <input style={s.input} value={form.linkedin} onChange={(e) => setForm((prev) => ({ ...prev, linkedin: e.target.value }))} />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>Instagram</label>
            <input style={s.input} value={form.instagram} onChange={(e) => setForm((prev) => ({ ...prev, instagram: e.target.value }))} />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>YouTube</label>
            <input style={s.input} value={form.youtube} onChange={(e) => setForm((prev) => ({ ...prev, youtube: e.target.value }))} />
          </div>
        </div>
      </div>

      <div style={s.card}>
        <h2 style={s.cardTitle}>Navigation Links</h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>One link per line (format: label|url or just label)</p>
        <div style={s.formRow}>
          <div style={s.halfField}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Quick Links</label>
              <textarea style={{ ...s.textarea, minHeight: 120 }} value={form.quickLinks} onChange={(e) => setForm((prev) => ({ ...prev, quickLinks: e.target.value }))} placeholder="About Us|/about&#10;Blog|/blog&#10;Careers|/careers" />
            </div>
          </div>
          <div style={s.halfField}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Support Links</label>
              <textarea style={{ ...s.textarea, minHeight: 120 }} value={form.supportLinks} onChange={(e) => setForm((prev) => ({ ...prev, supportLinks: e.target.value }))} placeholder="Help Center|/help&#10;Contact|/contact&#10;FAQ|/faq" />
            </div>
          </div>
        </div>
        <div style={s.fieldGroup}>
          <label style={s.label}>Community Links</label>
          <textarea style={{ ...s.textarea, minHeight: 120 }} value={form.communityLinks} onChange={(e) => setForm((prev) => ({ ...prev, communityLinks: e.target.value }))} placeholder="Forum|/forum&#10;Events|/events&#10;Partners|/partners" />
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
