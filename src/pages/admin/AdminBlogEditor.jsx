import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit3, Trash2, X, Loader2, Save, GripVertical, ChevronLeft, ChevronRight } from "lucide-react";

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
  saveBtn: { display: "flex", alignItems: "center", gap: 8, padding: "10px 24px", borderRadius: 8, border: "none", backgroundColor: "var(--primary)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", marginLeft: "auto" },
  cancelBtn: { padding: "10px 24px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "transparent", color: "var(--text)", fontSize: 14, cursor: "pointer" },
  formRow: { display: "flex", gap: 12 },
  halfField: { flex: 1 },
  checkboxRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 16 },
  pagination: { display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 24 },
  pageBtn: { padding: "8px 16px", borderRadius: 6, border: "1px solid var(--border)", backgroundColor: "var(--surface)", color: "var(--text)", cursor: "pointer", fontSize: 13 },
  pageBtnActive: { padding: "8px 16px", borderRadius: 6, border: "none", backgroundColor: "var(--primary)", color: "#fff", cursor: "pointer", fontSize: 13 },
};

const statusColors = {
  draft: { bg: "#FEF3C7", color: "#92400E" },
  published: { bg: "#D1FAE5", color: "#065F46" },
};

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function AdminBlogEditor() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const perPage = 10;

  const [form, setForm] = useState({
    title: "", slug: "", featuredImage: "", author: "", category: "", tags: "",
    shortDescription: "", content: "", seoTitle: "", seoDescription: "",
    status: "draft", isFeatured: false,
  });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: perPage });
      const res = await fetch(`${API}/blog?${params}`, { credentials: "include" });
      if (res.ok) { const d = await res.json(); setItems(d.items || []); setTotal(d.total || 0); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, [page]);

  const handleTitleChange = (value) => {
    setForm((prev) => ({ ...prev, title: value, slug: slugify(value) }));
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", slug: "", featuredImage: "", author: "", category: "", tags: "", shortDescription: "", content: "", seoTitle: "", seoDescription: "", status: "draft", isFeatured: false });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title || "",
      slug: item.slug || "",
      featuredImage: item.featuredImage || "",
      author: item.author || "",
      category: item.category || "",
      tags: Array.isArray(item.tags) ? item.tags.join(", ") : item.tags || "",
      shortDescription: item.shortDescription || "",
      content: item.content || "",
      seoTitle: item.seoTitle || "",
      seoDescription: item.seoDescription || "",
      status: item.status || "draft",
      isFeatured: item.isFeatured || false,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        ...form,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      };
      const url = editing ? `${API}/blog/${editing.id}` : `${API}/blog`;
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (res.ok) { setShowModal(false); fetchItems(); }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await fetch(`${API}/blog/${deleteId}`, { method: "DELETE", credentials: "include" });
      setDeleteId(null); fetchItems();
    } catch (e) { console.error(e); }
  };

  const totalPages = Math.ceil(total / perPage);

  if (loading && !items.length) {
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
        <h1 style={s.title}>Blog Posts</h1>
        <button style={s.addBtn} onClick={openCreate}><Plus size={18} /> New Post</button>
      </div>

      <AnimatePresence mode="popLayout">
        {items.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={s.emptyState}>
            <p style={{ fontSize: 16 }}>No blog posts found</p>
            <p style={{ fontSize: 14, marginTop: 8 }}>Create your first post to get started.</p>
          </motion.div>
        ) : (
          items.map((item, index) => (
            <motion.div key={item.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} style={s.card}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: 4 }}>
                  <button style={{ ...s.iconBtn, padding: 2 }} disabled={index === 0} onClick={() => moveItem(index, -1)}>▲</button>
                  <button style={{ ...s.iconBtn, padding: 2 }} disabled={index === items.length - 1} onClick={() => moveItem(index, 1)}>▼</button>
                </div>
                {item.featuredImage && <img src={item.featuredImage} alt="" style={{ width: 80, height: 60, borderRadius: 8, objectFit: "cover" }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{item.title}</h3>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, backgroundColor: statusColors[item.status]?.bg || "#F3F4F6", color: statusColors[item.status]?.color || "#374151" }}>{item.status}</span>
                    {item.isFeatured && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, backgroundColor: "#DBEAFE", color: "#1E40AF" }}>Featured</span>}
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>{item.author}{item.category ? ` · ${item.category}` : ""}</p>
                  {item.shortDescription && <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6, marginBottom: 0 }}>{item.shortDescription}</p>}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={s.iconBtn} onClick={() => openEdit(item)}><Edit3 size={16} /></button>
                  <button style={s.dangerBtn} onClick={() => setDeleteId(item.id)}><Trash2 size={16} /></button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </AnimatePresence>

      {totalPages > 1 && (
        <div style={s.pagination}>
          <button style={s.pageBtn} disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}><ChevronLeft size={16} /></button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} style={p === page ? s.pageBtnActive : s.pageBtn} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button style={s.pageBtn} disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}><ChevronRight size={16} /></button>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={s.modal} onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} style={s.modalContent} onClick={(e) => e.stopPropagation()}>
              <div style={s.modalHeader}>
                <h2 style={s.modalTitle}>{editing ? "Edit Post" : "New Post"}</h2>
                <button style={s.closeBtn} onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Title</label>
                <input style={s.input} value={form.title} onChange={(e) => handleTitleChange(e.target.value)} />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Slug</label>
                <input style={s.input} value={form.slug} onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))} />
              </div>
              <div style={s.formRow}>
                <div style={s.halfField}>
                  <div style={s.fieldGroup}>
                    <label style={s.label}>Featured Image URL</label>
                    <input style={s.input} value={form.featuredImage} onChange={(e) => setForm((prev) => ({ ...prev, featuredImage: e.target.value }))} />
                  </div>
                </div>
                <div style={s.halfField}>
                  <div style={s.fieldGroup}>
                    <label style={s.label}>Author</label>
                    <input style={s.input} value={form.author} onChange={(e) => setForm((prev) => ({ ...prev, author: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.halfField}>
                  <div style={s.fieldGroup}>
                    <label style={s.label}>Category</label>
                    <input style={s.input} value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} />
                  </div>
                </div>
                <div style={s.halfField}>
                  <div style={s.fieldGroup}>
                    <label style={s.label}>Tags (comma-separated)</label>
                    <input style={s.input} value={form.tags} onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Short Description</label>
                <textarea style={s.textarea} value={form.shortDescription} onChange={(e) => setForm((prev) => ({ ...prev, shortDescription: e.target.value }))} />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Content</label>
                <textarea style={{ ...s.textarea, minHeight: 160 }} value={form.content} onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))} />
              </div>
              <div style={s.formRow}>
                <div style={s.halfField}>
                  <div style={s.fieldGroup}>
                    <label style={s.label}>SEO Title</label>
                    <input style={s.input} value={form.seoTitle} onChange={(e) => setForm((prev) => ({ ...prev, seoTitle: e.target.value }))} />
                  </div>
                </div>
                <div style={s.halfField}>
                  <div style={s.fieldGroup}>
                    <label style={s.label}>SEO Description</label>
                    <input style={s.input} value={form.seoDescription} onChange={(e) => setForm((prev) => ({ ...prev, seoDescription: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.halfField}>
                  <div style={s.fieldGroup}>
                    <label style={s.label}>Status</label>
                    <select style={s.select} value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>
              </div>
              <div style={s.checkboxRow}>
                <input type="checkbox" id="isFeatured" checked={form.isFeatured} onChange={(e) => setForm((prev) => ({ ...prev, isFeatured: e.target.checked }))} />
                <label htmlFor="isFeatured" style={s.label}>Featured Post</label>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button style={s.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button style={s.saveBtn} onClick={handleSave} disabled={saving}>{saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : null} {editing ? "Update" : "Create"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={s.modal} onClick={() => setDeleteId(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} style={{ ...s.modalContent, maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Confirm Delete</h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24 }}>Are you sure you want to delete this post? This action cannot be undone.</p>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button style={s.cancelBtn} onClick={() => setDeleteId(null)}>Cancel</button>
                <button style={{ ...s.saveBtn, backgroundColor: "#EF4444" }} onClick={handleDelete}>Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
