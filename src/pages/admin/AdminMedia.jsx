import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit3, Trash2, X, Loader2, ChevronLeft, ChevronRight, Download, Image, Film, FileText, Eye } from "lucide-react";

const API = "/api/admin/cms";

const s = {
  page: { padding: 24 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 700 },
  filterSelect: { padding: "10px 16px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--surface)", color: "var(--text)", fontSize: 14, outline: "none" },
  addBtn: { display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, border: "none", backgroundColor: "var(--primary)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  card: { padding: 12, borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--surface)", marginBottom: 12 },
  emptyState: { textAlign: "center", padding: 60, color: "var(--text-muted)" },
  modal: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 },
  modalContent: { backgroundColor: "var(--surface)", borderRadius: 16, padding: 32, width: "100%", maxWidth: 600, maxHeight: "90vh", overflow: "auto" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 700 },
  closeBtn: { background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 },
  input: { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--background)", color: "var(--text)", fontSize: 14, outline: "none", boxSizing: "border-box" },
  select: { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--background)", color: "var(--text)", fontSize: 14, outline: "none", boxSizing: "border-box" },
  actions: { display: "flex", gap: 8 },
  iconBtn: { background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 6, borderRadius: 6 },
  dangerBtn: { background: "none", border: "none", color: "#EF4444", cursor: "pointer", padding: 6, borderRadius: 6 },
  saveBtn: { display: "flex", alignItems: "center", gap: 8, padding: "10px 24px", borderRadius: 8, border: "none", backgroundColor: "var(--primary)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", marginLeft: "auto" },
  cancelBtn: { padding: "10px 24px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "transparent", color: "var(--text)", fontSize: 14, cursor: "pointer" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 },
  mediaThumb: { width: "100%", height: 160, borderRadius: 8, objectFit: "cover", border: "1px solid var(--border)", backgroundColor: "var(--background)" },
  pagination: { display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 24 },
  pageBtn: { padding: "8px 16px", borderRadius: 6, border: "1px solid var(--border)", backgroundColor: "var(--surface)", color: "var(--text)", cursor: "pointer", fontSize: 13 },
  pageBtnActive: { padding: "8px 16px", borderRadius: 6, border: "none", backgroundColor: "var(--primary)", color: "#fff", cursor: "pointer", fontSize: 13 },
};

export default function AdminMedia() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const perPage = 20;

  const [form, setForm] = useState({ url: "", type: "image", fileName: "", alt: "" });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: perPage });
      if (typeFilter) params.set("type", typeFilter);
      const res = await fetch(`${API}/media?${params}`, { credentials: "include" });
      if (res.ok) { const d = await res.json(); setItems(d.items || []); setTotal(d.total || 0); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, [page, typeFilter]);

  const openUpload = () => {
    setForm({ url: "", type: "image", fileName: "", alt: "" });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/media`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(form) });
      if (res.ok) { setShowModal(false); fetchItems(); }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await fetch(`${API}/media/${deleteId}`, { method: "DELETE", credentials: "include" });
      setDeleteId(null); fetchItems();
    } catch (e) { console.error(e); }
  };

  const totalPages = Math.ceil(total / perPage);

  function getIcon(type) {
    switch (type) {
      case "image": return <Image size={14} color="#3B82F6" />;
      case "video": return <Film size={14} color="#8B5CF6" />;
      default: return <FileText size={14} color="#F59E0B" />;
    }
  }

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
        <h1 style={s.title}>Media Library</h1>
        <button style={s.addBtn} onClick={openUpload}><Plus size={18} /> Upload Media</button>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <select style={s.filterSelect} value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
          <option value="">All Types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="document">Documents</option>
        </select>
      </div>

      <AnimatePresence mode="popLayout">
        {items.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={s.emptyState}>
            <p style={{ fontSize: 16 }}>No media found</p>
            <p style={{ fontSize: 14, marginTop: 8 }}>Upload your first media item to get started.</p>
          </motion.div>
        ) : (
          <div style={s.grid}>
            {items.map((item) => (
              <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={s.card}>
                <div style={{ cursor: "pointer" }} onClick={() => setPreviewUrl(item.url)}>
                  {item.type === "image" ? (
                    <img src={item.url} alt={item.alt || ""} style={s.mediaThumb} onError={(e) => { e.target.style.display = "none"; }} />
                  ) : item.type === "video" ? (
                    <div style={{ ...s.mediaThumb, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--background)" }}>
                      <Film size={40} color="var(--text-muted)" />
                    </div>
                  ) : (
                    <div style={{ ...s.mediaThumb, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--background)" }}>
                      <FileText size={40} color="var(--text-muted)" />
                    </div>
                  )}
                </div>
                <div style={{ padding: "8px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--text-muted)" }}>
                    {getIcon(item.type)}
                    <span>{item.fileName || item.type}</span>
                  </div>
                  <button style={s.dangerBtn} onClick={() => setDeleteId(item.id)}><Trash2 size={14} /></button>
                </div>
              </motion.div>
            ))}
          </div>
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
                <h2 style={s.modalTitle}>Upload Media</h2>
                <button style={s.closeBtn} onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Media URL</label>
                <input style={s.input} value={form.url} onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))} placeholder="Paste media URL..." />
              </div>
              <div style={s.formRow}>
                <div style={s.halfField}>
                  <div style={s.fieldGroup}>
                    <label style={s.label}>Type</label>
                    <select style={s.select} value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}>
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                      <option value="document">Document</option>
                    </select>
                  </div>
                </div>
                <div style={s.halfField}>
                  <div style={s.fieldGroup}>
                    <label style={s.label}>File Name</label>
                    <input style={s.input} value={form.fileName} onChange={(e) => setForm((prev) => ({ ...prev, fileName: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Alt Text</label>
                <input style={s.input} value={form.alt} onChange={(e) => setForm((prev) => ({ ...prev, alt: e.target.value }))} />
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button style={s.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button style={s.saveBtn} onClick={handleSave} disabled={saving}>{saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : null} Upload</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {previewUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={s.modal} onClick={() => setPreviewUrl(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} style={{ ...s.modalContent, maxWidth: 800, textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
              <div style={s.modalHeader}>
                <h2 style={s.modalTitle}>Preview</h2>
                <button style={s.closeBtn} onClick={() => setPreviewUrl(null)}><X size={20} /></button>
              </div>
              <img src={previewUrl} alt="Preview" style={{ maxWidth: "100%", maxHeight: "70vh", borderRadius: 8 }} onError={(e) => { e.target.style.display = "none"; }} />
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 12, wordBreak: "break-all" }}>{previewUrl}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={s.modal} onClick={() => setDeleteId(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} style={{ ...s.modalContent, maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Confirm Delete</h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24 }}>Are you sure you want to delete this media item?</p>
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
