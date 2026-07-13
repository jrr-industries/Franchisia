import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit3, Trash2, X, Loader2, Save, GripVertical } from "lucide-react";

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
  iconBtn: { background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 6, borderRadius: 6 },
  dangerBtn: { background: "none", border: "none", color: "#EF4444", cursor: "pointer", padding: 6, borderRadius: 6 },
  saveBtn: { display: "flex", alignItems: "center", gap: 8, padding: "10px 24px", borderRadius: 8, border: "none", backgroundColor: "var(--primary)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", marginLeft: "auto" },
  cancelBtn: { padding: "10px 24px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "transparent", color: "var(--text)", fontSize: 14, cursor: "pointer" },
  formRow: { display: "flex", gap: 12 },
  halfField: { flex: 1 },
};

export default function AdminStatistics() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ value: "", label: "", sort: 0 });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/stats`, { credentials: "include" });
      if (res.ok) { const d = await res.json(); setItems(d.items || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ value: "", label: "", sort: items.length + 1 });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ value: item.value || "", label: item.label || "", sort: item.sort ?? 0 });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = { ...form, sort: parseInt(form.sort) || 0 };
      const url = editing ? `${API}/stats/${editing.id}` : `${API}/stats`;
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (res.ok) { setShowModal(false); fetchItems(); }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await fetch(`${API}/stats/${deleteId}`, { method: "DELETE", credentials: "include" });
      setDeleteId(null); fetchItems();
    } catch (e) { console.error(e); }
  };

  const moveItem = (index, direction) => {
    const newItems = [...items];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    newItems.forEach((item, i) => { item.sort = i + 1; });
    setItems(newItems);
    newItems.forEach((item) => {
      fetch(`${API}/stats/${item.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ sort: item.sort }) }).catch(() => {});
    });
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
        <h1 style={s.title}>Site Statistics</h1>
        <button style={s.addBtn} onClick={openCreate}><Plus size={18} /> Add Stat</button>
      </div>

      <AnimatePresence mode="popLayout">
        {items.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={s.emptyState}>
            <p style={{ fontSize: 16 }}>No statistics found</p>
            <p style={{ fontSize: 14, marginTop: 8 }}>Add your first statistic to get started.</p>
          </motion.div>
        ) : (
          items.map((item, index) => (
            <motion.div key={item.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} style={s.card}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <button style={{ ...s.iconBtn, padding: 2 }} disabled={index === 0} onClick={() => moveItem(index, -1)}>▲</button>
                  <button style={{ ...s.iconBtn, padding: 2 }} disabled={index === items.length - 1} onClick={() => moveItem(index, 1)}>▼</button>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "var(--primary)" }}>{item.value}</h3>
                  </div>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "2px 0 0" }}>{item.label}</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>Order: {item.sort ?? index + 1}</p>
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

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={s.modal} onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} style={s.modalContent} onClick={(e) => e.stopPropagation()}>
              <div style={s.modalHeader}>
                <h2 style={s.modalTitle}>{editing ? "Edit Stat" : "New Stat"}</h2>
                <button style={s.closeBtn} onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>
              <div style={s.formRow}>
                <div style={s.halfField}>
                  <div style={s.fieldGroup}>
                    <label style={s.label}>Value</label>
                    <input style={s.input} value={form.value} onChange={(e) => setForm((prev) => ({ ...prev, value: e.target.value }))} placeholder="e.g. 10,000+" />
                  </div>
                </div>
                <div style={s.halfField}>
                  <div style={s.fieldGroup}>
                    <label style={s.label}>Sort Order</label>
                    <input type="number" style={s.input} value={form.sort} onChange={(e) => setForm((prev) => ({ ...prev, sort: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Label</label>
                <input style={s.input} value={form.label} onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))} placeholder="e.g. Active Franchise Listings" />
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
              <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24 }}>Are you sure you want to delete this statistic?</p>
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
