import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit3, Trash2, X, Loader2, ArrowLeft } from "lucide-react";

const API = "/api/admin/cms";

const CONFIG = {
  "business-types": { title: "Business Types", labelField: "name", hasColor: true, hasIcon: true, hasDescription: true },
  "opportunity-types": { title: "Opportunity Types", labelField: "name", hasColor: true, hasIcon: true, hasDescription: true },
  "company-sizes": { title: "Company Sizes", labelField: "name", hasColor: true, hasIcon: true, hasDescription: false },
  languages: { title: "Languages", labelField: "name", hasColor: false, hasIcon: false, hasDescription: false, extraFields: [{ key: "nativeName", label: "Native Name" }] },
  currencies: { title: "Currencies", labelField: "name", hasColor: false, hasIcon: false, hasDescription: false, extraFields: [{ key: "code", label: "Code" }, { key: "symbol", label: "Symbol" }] },
  "document-types": { title: "Document Types", labelField: "name", hasColor: false, hasIcon: false, hasDescription: true },
  "investment-ranges": { title: "Investment Ranges", labelField: "label", hasColor: false, hasIcon: false, hasDescription: false, extraFields: [{ key: "min", label: "Min Value", type: "number" }, { key: "max", label: "Max Value", type: "number" }] },
};

const s = {
  page: { padding: 24 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 700 },
  backBtn: { display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "6px 12px", borderRadius: 8, fontSize: 14, marginRight: 12 },
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
  saveBtn: { display: "flex", alignItems: "center", gap: 8, padding: "10px 24px", borderRadius: 8, border: "none", backgroundColor: "var(--primary)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", marginLeft: "auto" },
  cancelBtn: { padding: "10px 24px", borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "transparent", color: "var(--text)", fontSize: 14, cursor: "pointer" },
  iconBtn: { background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 6, borderRadius: 6 },
  dangerBtn: { background: "none", border: "none", color: "#EF4444", cursor: "pointer", padding: 6, borderRadius: 6 },
  formRow: { display: "flex", gap: 12 },
  halfField: { flex: 1 },
  checkboxRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 16 },
};

export default function AdminMasterData() {
  const { type } = useParams();
  const navigate = useNavigate();
  const config = CONFIG[type];
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const getDefaultForm = () => {
    const base = { displayOrder: 0, isActive: true };
    base[config.labelField] = "";
    if (config.hasColor) base.color = "#6366F1";
    if (config.hasIcon) base.icon = "";
    if (config.hasDescription) base.description = "";
    if (config.extraFields) {
      config.extraFields.forEach((f) => { base[f.key] = f.type === "number" ? "" : ""; });
    }
    return base;
  };

  const [form, setForm] = useState(getDefaultForm);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/${type}`, { credentials: "include" });
      if (res.ok) { const d = await res.json(); setItems(d.items || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (type) fetchItems(); }, [type]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...getDefaultForm(), displayOrder: items.length + 1 });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    const f = { ...getDefaultForm() };
    f[config.labelField] = item[config.labelField] || "";
    if (config.hasColor) f.color = item.color || "#6366F1";
    if (config.hasIcon) f.icon = item.icon || "";
    if (config.hasDescription) f.description = item.description || "";
    f.displayOrder = item.displayOrder ?? 0;
    f.isActive = item.isActive ?? true;
    if (config.extraFields) {
      config.extraFields.forEach((ef) => { f[ef.key] = item[ef.key] ?? (ef.type === "number" ? "" : ""); });
    }
    setForm(f);
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = { ...form };
      if (body.min !== undefined) body.min = parseFloat(body.min) || null;
      if (body.max !== undefined) body.max = parseFloat(body.max) || null;
      body.displayOrder = parseInt(body.displayOrder) || 0;
      const url = editing ? `${API}/${type}/${editing.id}` : `${API}/${type}`;
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify(body),
      });
      if (res.ok) { setShowModal(false); fetchItems(); }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await fetch(`${API}/${type}/${deleteId}`, { method: "DELETE", credentials: "include" });
      setDeleteId(null); fetchItems();
    } catch (e) { console.error(e); }
  };

  if (!config) {
    return (
      <div style={s.page}>
        <div style={{ textAlign: "center", padding: 60 }}>
          <p style={{ fontSize: 16, color: "var(--text-muted)" }}>Unknown master data type: {type}</p>
          <button style={s.addBtn} onClick={() => navigate("/admin")}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={s.page}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
          <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "var(--primary)" }} />
        </div>
      </div>
    );
  }

  const labelField = config.labelField;
  const titleField = config.extraFields?.find((f) => f.key !== "code" && f.key !== "symbol");

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <button style={s.backBtn} onClick={() => navigate("/admin")}><ArrowLeft size={16} /> Back</button>
          <h1 style={s.title}>{config.title}</h1>
        </div>
        <button style={s.addBtn} onClick={openCreate}><Plus size={18} /> Add {config.title.slice(0, -1)}</button>
      </div>

      <AnimatePresence mode="popLayout">
        {items.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={s.emptyState}>
            <p style={{ fontSize: 16 }}>No {config.title.toLowerCase()} found</p>
            <p style={{ fontSize: 14, marginTop: 8 }}>Add your first item to get started.</p>
          </motion.div>
        ) : (
          items.map((item) => (
            <motion.div key={item.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} style={s.card}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {config.hasColor ? (
                  <div style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: item.color || "#6366F1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                    {item.icon || item[labelField]?.charAt(0) || "?"}
                  </div>
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: "var(--surface-container-high)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                    {item[labelField]?.charAt(0) || "?"}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{item[labelField]}</h3>
                    {item.code && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>({item.code})</span>}
                    {item.symbol && <span style={{ fontSize: 16 }}>{item.symbol}</span>}
                  </div>
                  {item.description && <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "2px 0 0" }}>{item.description}</p>}
                  <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Order: {item.displayOrder}</span>
                    <span style={{ fontSize: 12, color: item.isActive ? "#10B981" : "#EF4444" }}>
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
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
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} style={s.modalContent} onClick={(e) => e.stopPropagation()}>
              <div style={s.modalHeader}>
                <h2 style={s.modalTitle}>{editing ? `Edit ${config.title.slice(0, -1)}` : `New ${config.title.slice(0, -1)}`}</h2>
                <button style={s.closeBtn} onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label}>{labelField === "label" ? "Label" : "Name"}</label>
                <input style={s.input} value={form[labelField] || ""} onChange={(e) => setForm((p) => ({ ...p, [labelField]: e.target.value }))} />
              </div>

              {config.extraFields?.map((ef) => (
                <div key={ef.key} style={s.fieldGroup}>
                  <label style={s.label}>{ef.label}</label>
                  <input type={ef.type === "number" ? "number" : "text"} style={s.input} value={form[ef.key] ?? ""} onChange={(e) => setForm((p) => ({ ...p, [ef.key]: e.target.value }))} />
                </div>
              ))}

              {config.hasDescription && (
                <div style={s.fieldGroup}>
                  <label style={s.label}>Description</label>
                  <textarea style={s.textarea} value={form.description || ""} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
                </div>
              )}

              {config.hasIcon && (
                <div style={s.fieldGroup}>
                  <label style={s.label}>Icon</label>
                  <input style={s.input} value={form.icon || ""} onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))} placeholder="icon name" />
                </div>
              )}

              {config.hasColor && (
                <div style={s.fieldGroup}>
                  <label style={s.label}>Color</label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="color" value={form.color || "#6366F1"} onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))} style={{ width: 40, height: 40, borderRadius: 8, border: "1px solid var(--border)", cursor: "pointer", padding: 0 }} />
                    <input style={{ ...s.input, flex: 1 }} value={form.color || ""} onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))} />
                  </div>
                </div>
              )}

              <div style={s.formRow}>
                <div style={s.halfField}>
                  <div style={s.fieldGroup}>
                    <label style={s.label}>Display Order</label>
                    <input type="number" style={s.input} value={form.displayOrder ?? 0} onChange={(e) => setForm((p) => ({ ...p, displayOrder: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div style={s.checkboxRow}>
                <input type="checkbox" id="mdIsActive" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} />
                <label htmlFor="mdIsActive" style={s.label}>Active</label>
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button style={s.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : null}
                  {editing ? "Update" : "Create"}
                </button>
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
              <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24 }}>Are you sure you want to delete this item?</p>
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