import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit3, Trash2, X, Loader2, ChevronLeft, ChevronRight, GripVertical } from "lucide-react";

const API = "/api/admin/cms";

const s = {
  page: { padding: 24 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 700 },
  searchInput: { flex: 1, padding: "10px 16px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--surface)", color: "var(--text)", fontSize: 14, outline: "none" },
  filterSelect: { padding: "10px 16px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--surface)", color: "var(--text)", fontSize: 14, outline: "none" },
  addBtn: { display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, border: "none", backgroundColor: "var(--primary)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  card: { padding: 20, borderRadius: 12, border: "1px solid var(--border)", backgroundColor: "var(--surface)", marginBottom: 12 },
  emptyState: { textAlign: "center", padding: 60, color: "var(--text-muted)" },
  modal: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 },
  modalContent: { backgroundColor: "var(--surface)", borderRadius: 16, padding: 32, width: "100%", maxWidth: 600, maxHeight: "90vh", overflow: "auto" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 700 },
  closeBtn: { background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 },
  input: { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--background)", color: "var(--text)", fontSize: 14, outline: "none", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--background)", color: "var(--text)", fontSize: 14, outline: "none", minHeight: 100, fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" },
  select: { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--background)", color: "var(--text)", fontSize: 14, outline: "none", boxSizing: "border-box" },
  actions: { display: "flex", gap: 8 },
  iconBtn: { background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 6, borderRadius: 6 },
  dangerBtn: { background: "none", border: "none", color: "#EF4444", cursor: "pointer", padding: 6, borderRadius: 6 },
  saveBtn: { display: "flex", alignItems: "center", gap: 8, padding: "10px 24px", borderRadius: 8, border: "none", backgroundColor: "var(--primary)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", marginLeft: "auto" },
  cancelBtn: { padding: "10px 24px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "transparent", color: "var(--text)", fontSize: 14, cursor: "pointer" },
  formRow: { display: "flex", gap: 12 },
  halfField: { flex: 1 },
  checkboxRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 16 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 },
  imagePreview: { width: 60, height: 60, borderRadius: 8, objectFit: "contain", border: "1px solid var(--border)", backgroundColor: "#fff" },
  pagination: { display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 24 },
  pageBtn: { padding: "8px 16px", borderRadius: 6, border: "1px solid var(--border)", backgroundColor: "var(--surface)", color: "var(--text)", cursor: "pointer", fontSize: 13 },
  pageBtnActive: { padding: "8px 16px", borderRadius: 6, border: "none", backgroundColor: "var(--primary)", color: "#fff", cursor: "pointer", fontSize: 13 },
};

const partnerTypes = ["Technology", "Legal", "Finance", "Bank", "Marketing", "Consultant"];

export default function AdminPartners() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const perPage = 12;

  const [form, setForm] = useState({
    name: "", logo: "", partnerType: "", description: "", website: "",
    isFeatured: false, displayOrder: 0, status: "published",
  });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: perPage });
      const res = await fetch(`${API}/partners?${params}`, { credentials: "include" });
      if (res.ok) { const d = await res.json(); setItems(d.items || []); setTotal(d.total || 0); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, [page]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", logo: "", partnerType: "", description: "", website: "", isFeatured: false, displayOrder: items.length + 1, status: "published" });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name || "",
      logo: item.logo || "",
      partnerType: item.partnerType || "",
      description: item.description || "",
      website: item.website || "",
      isFeatured: item.isFeatured || false,
      displayOrder: item.displayOrder ?? 0,
      status: item.status || "published",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = { ...form, displayOrder: parseInt(form.displayOrder) || 0 };
      const url = editing ? `${API}/partners/${editing.id}` : `${API}/partners`;
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (res.ok) { setShowModal(false); fetchItems(); }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await fetch(`${API}/partners/${deleteId}`, { method: "DELETE", credentials: "include" });
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
        <h1 style={s.title}>Partners</h1>
        <button style={s.addBtn} onClick={openCreate}><Plus size={18} /> New Partner</button>
      </div>

      <AnimatePresence mode="popLayout">
        {items.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={s.emptyState}>
            <p style={{ fontSize: 16 }}>No partners found</p>
            <p style={{ fontSize: 14, marginTop: 8 }}>Add your first partner to get started.</p>
          </motion.div>
        ) : (
          <div style={s.grid}>
            {items.map((item) => (
              <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={s.card}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  {item.logo ? (
                    <img src={item.logo} alt={item.name} style={s.imagePreview} />
                  ) : (
                    <div style={{ ...s.imagePreview, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--border)", color: "var(--text-muted)", fontSize: 11 }}>No Logo</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{item.name}</h3>
                      {item.isFeatured && <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, backgroundColor: "#DBEAFE", color: "#1E40AF" }}>Featured</span>}
                    </div>
                    {item.partnerType && <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>{item.partnerType}</p>}
                    <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "4px 0 0" }}>Order: {item.displayOrder ?? 0} · {item.status}</p>
                  </div>
                  <div style={s.actions}>
                    <button style={s.iconBtn} onClick={() => openEdit(item)}><Edit3 size={15} /></button>
                    <button style={s.dangerBtn} onClick={() => setDeleteId(item.id)}><Trash2 size={15} /></button>
                  </div>
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
                <h2 style={s.modalTitle}>{editing ? "Edit Partner" : "New Partner"}</h2>
                <button style={s.closeBtn} onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>
              <div style={s.formRow}>
                <div style={s.halfField}>
                  <div style={s.fieldGroup}>
                    <label style={s.label}>Name</label>
                    <input style={s.input} value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
                  </div>
                </div>
                <div style={s.halfField}>
                  <div style={s.fieldGroup}>
                    <label style={s.label}>Logo URL</label>
                    <input style={s.input} value={form.logo} onChange={(e) => setForm((prev) => ({ ...prev, logo: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div style={s.formRow}>
                <div style={s.halfField}>
                  <div style={s.fieldGroup}>
                    <label style={s.label}>Partner Type</label>
                    <select style={s.select} value={form.partnerType} onChange={(e) => setForm((prev) => ({ ...prev, partnerType: e.target.value }))}>
                      <option value="">Select type</option>
                      {partnerTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div style={s.halfField}>
                  <div style={s.fieldGroup}>
                    <label style={s.label}>Display Order</label>
                    <input type="number" style={s.input} value={form.displayOrder} onChange={(e) => setForm((prev) => ({ ...prev, displayOrder: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Description</label>
                <textarea style={s.textarea} value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Website</label>
                <input style={s.input} value={form.website} onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))} />
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
                    <input type="checkbox" id="isFeatured" checked={form.isFeatured} onChange={(e) => setForm((prev) => ({ ...prev, isFeatured: e.target.checked }))} />
                    <label htmlFor="isFeatured" style={s.label}>Featured</label>
                  </div>
                </div>
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
              <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24 }}>Are you sure you want to delete this partner?</p>
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
