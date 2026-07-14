import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Save, Loader2, Edit2, Trash2, X } from "lucide-react";

const API = "/api/admin/cms/pages";

const s = {
  page: { padding: 24 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 700 },
  addBtn: { display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, border: "none", backgroundColor: "var(--primary)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 600, color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid var(--border)" },
  td: { padding: "12px 16px", fontSize: 14, borderBottom: "1px solid var(--border)" },
  badge: (status) => ({ display: "inline-block", padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, backgroundColor: status === "published" ? "#D1FAE5" : "#FEF3C7", color: status === "published" ? "#065F46" : "#92400E" }),
  iconBtn: (color) => ({ padding: 6, borderRadius: 6, border: "none", backgroundColor: "transparent", color: color || "var(--on-surface)", cursor: "pointer", display: "inline-flex" }),
  modalOverlay: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { backgroundColor: "var(--surface)", borderRadius: 16, padding: 32, width: "90%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto", position: "relative" },
  modalTitle: { fontSize: 20, fontWeight: 700, marginBottom: 24 },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 },
  input: { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--background)", color: "var(--text)", fontSize: 14, outline: "none", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--background)", color: "var(--text)", fontSize: 14, outline: "none", minHeight: 200, fontFamily: "monospace", resize: "vertical", boxSizing: "border-box" },
  select: { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--background)", color: "var(--text)", fontSize: 14, outline: "none", boxSizing: "border-box" },
  formRow: { display: "flex", gap: 12 },
  halfField: { flex: 1 },
  saveBtn: { display: "flex", alignItems: "center", gap: 8, padding: "10px 24px", borderRadius: 8, border: "none", backgroundColor: "var(--primary)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%", justifyContent: "center" },
  closeBtn: { position: "absolute", top: 16, right: 16, padding: 6, borderRadius: 6, border: "none", backgroundColor: "transparent", color: "var(--on-surface)", cursor: "pointer" },
};

const emptyForm = { slug: "", title: "", content: "", metaTitle: "", metaDescription: "", status: "draft" };

export default function AdminPages() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchPages = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load pages");
      const data = await res.json();
      setPages(data.items || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPages(); }, []);

  const openCreate = () => { setForm(emptyForm); setModal("create"); };
  const openEdit = (page) => { setForm({ ...page }); setModal("edit"); };
  const closeModal = () => { setModal(null); setMessage(null); };

  const showMsg = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const isEdit = modal === "edit";
      const url = isEdit ? `${API}/${form.id}` : API;
      const method = isEdit ? "PUT" : "POST";
      const { id, createdAt, updatedAt, ...body } = form;
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed to save page");
      await fetchPages();
      showMsg(isEdit ? "Page updated successfully." : "Page created successfully.");
      closeModal();
    } catch (e) {
      showMsg(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this page?")) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete page");
      await fetchPages();
      showMsg("Page deleted successfully.");
    } catch (e) {
      showMsg(e.message, "error");
    }
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>Content Pages</h1>
        <button style={s.addBtn} onClick={openCreate}>
          <Plus size={16} /> New Page
        </button>
      </div>

      {message && (
        <div style={{ padding: "12px 16px", borderRadius: 8, backgroundColor: message.type === "error" ? "#FEE2E2" : "#D1FAE5", color: message.type === "error" ? "#991B1B" : "#065F46", fontSize: 14, marginBottom: 20 }}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
          <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "var(--primary)" }} />
        </div>
      ) : error ? (
        <div style={{ padding: 24, textAlign: "center", color: "#991B1B" }}>
          <p>{error}</p>
          <button onClick={fetchPages} style={{ marginTop: 12, padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--surface)", cursor: "pointer", fontSize: 14 }}>Retry</button>
        </div>
      ) : pages.length === 0 ? (
        <div style={{ padding: 48, textAlign: "center", color: "var(--on-surface-variant)" }}>
          <p style={{ fontSize: 16, marginBottom: 8 }}>No pages yet</p>
          <p style={{ fontSize: 14 }}>Create your first content page using the button above.</p>
        </div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Slug</th>
              <th style={s.th}>Title</th>
              <th style={s.th}>Status</th>
              <th style={s.th}>Updated</th>
              <th style={s.th}></th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.id}>
                <td style={s.td}><code>{p.slug}</code></td>
                <td style={s.td}>{p.title}</td>
                <td style={s.td}><span style={s.badge(p.status)}>{p.status}</span></td>
                <td style={s.td}>{new Date(p.updatedAt).toLocaleDateString()}</td>
                <td style={s.td}>
                  <button style={s.iconBtn("var(--primary)")} onClick={() => openEdit(p)} title="Edit"><Edit2 size={16} /></button>
                  <button style={s.iconBtn("#DC2626")} onClick={() => handleDelete(p.id)} title="Delete"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <AnimatePresence>
        {modal && (
          <motion.div style={s.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal}>
            <motion.div style={s.modal} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <button style={s.closeBtn} onClick={closeModal}><X size={20} /></button>
              <h2 style={s.modalTitle}>{modal === "create" ? "New Page" : "Edit Page"}</h2>

              <div style={s.formRow}>
                <div style={s.halfField}>
                  <div style={s.fieldGroup}>
                    <label style={s.label}>Slug</label>
                    <input style={s.input} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })} placeholder="about-us" />
                  </div>
                </div>
                <div style={s.halfField}>
                  <div style={s.fieldGroup}>
                    <label style={s.label}>Status</label>
                    <select style={s.select} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label}>Title</label>
                <input style={s.input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="About Us" />
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label}>Content (supports ## headings, **bold**, and paragraphs)</label>
                <textarea style={s.textarea} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="## Section Title&#10;&#10;Content goes here..." />
              </div>

              <div style={s.formRow}>
                <div style={s.halfField}>
                  <div style={s.fieldGroup}>
                    <label style={s.label}>Meta Title</label>
                    <input style={s.input} value={form.metaTitle || ""} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} />
                  </div>
                </div>
                <div style={s.halfField}>
                  <div style={s.fieldGroup}>
                    <label style={s.label}>Meta Description</label>
                    <input style={s.input} value={form.metaDescription || ""} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} />
                  </div>
                </div>
              </div>

              <button style={s.saveBtn} onClick={handleSave} disabled={saving || !form.slug || !form.title}>
                {saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
                {modal === "create" ? "Create Page" : "Update Page"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
