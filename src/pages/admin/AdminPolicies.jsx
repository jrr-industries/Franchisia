import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, Eye, Shield, ShieldOff, Building2, Loader2, ExternalLink, FileSignature } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";

const API = "/api";

const s = {
  page: { maxWidth: 1000, margin: "0 auto" },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 4 },
  subtitle: { fontSize: 14, color: "var(--text-secondary)", marginBottom: 24 },
  table: {
    width: "100%", borderCollapse: "collapse",
  },
  th: {
    textAlign: "left", padding: "10px 14px", fontSize: 12, fontWeight: 600,
    color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1,
    borderBottom: "1px solid var(--border)",
  },
  td: {
    padding: "12px 14px", fontSize: 13, borderBottom: "1px solid var(--border)",
  },
};

export default function AdminPolicies() {
  const { addToast } = useToast();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [detailModal, setDetailModal] = useState(false);

  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/policies/admin/policies`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setPolicies(data);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPolicies(); }, [fetchPolicies]);

  const handleToggleSuspend = async (id, suspended) => {
    try {
      const res = await fetch(`${API}/policies/admin/${id}/suspend`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ suspended }),
      });
      if (res.ok) {
        addToast(suspended ? "Policy suspended" : "Policy reinstated", "success");
        fetchPolicies();
      } else {
        addToast("Failed", "error");
      }
    } catch {
      addToast("Network error", "error");
    }
  };

  const handleHideDoc = async (docId, hidden) => {
    try {
      const res = await fetch(`${API}/policies/admin/documents/${docId}/hide`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ hidden }),
      });
      if (res.ok) {
        addToast(hidden ? "Document hidden" : "Document visible", "success");
        fetchPolicies();
      } else {
        addToast("Failed", "error");
      }
    } catch {
      addToast("Network error", "error");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <Loader2 size={32} className="spin" color="var(--primary)" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={s.page}>
      <h1 style={s.title}>Company Policies</h1>
      <p style={s.subtitle}>View and manage all company franchise policies. Admins cannot edit policies.</p>

      {policies.length === 0 ? (
        <Card padding="48px" style={{ textAlign: "center" }}>
          <FileSignature size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>No policies found.</p>
        </Card>
      ) : (
        <Card padding="0" style={{ overflow: "hidden" }}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Company</th>
                <th style={s.th}>Version</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Docs</th>
                <th style={s.th}>Acceptances</th>
                <th style={s.th}>Updated</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((p) => (
                <tr key={p.id}>
                  <td style={s.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Building2 size={16} color="var(--primary)" />
                      <span style={{ fontWeight: 500 }}>{p.company?.name || "Unknown"}</span>
                    </div>
                  </td>
                  <td style={s.td}>v{p.version}</td>
                  <td style={s.td}>
                    <Badge variant={p.status === "published" ? "success" : p.status === "archived" ? "secondary" : "default"}>
                      {p.status}
                    </Badge>
                    {p.isSuspended && <Badge variant="danger" style={{ marginLeft: 4 }}>Suspended</Badge>}
                  </td>
                  <td style={s.td}>{p._count?.documents || 0}</td>
                  <td style={s.td}>{p._count?.acceptances || 0}</td>
                  <td style={s.td}>{new Date(p.updatedAt).toLocaleDateString()}</td>
                  <td style={s.td}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <Button
                        size="sm" variant="ghost"
                        icon={<Eye size={14} />}
                        onClick={() => { setSelectedPolicy(p); setDetailModal(true); }}
                      />
                      <Button
                        size="sm" variant="ghost"
                        icon={p.isSuspended ? <Shield size={14} color="var(--success)" /> : <ShieldOff size={14} color="var(--danger)" />}
                        onClick={() => handleToggleSuspend(p.id, !p.isSuspended)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal isOpen={detailModal} onClose={() => setDetailModal(null)} title={`Policy: ${selectedPolicy?.company?.name || ""}`} width="700px">
        {selectedPolicy && (
          <div style={{ maxHeight: 500, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <InfoRow label="Status" value={selectedPolicy.status} />
              <InfoRow label="Version" value={selectedPolicy.version} />
              <InfoRow label="Active" value={selectedPolicy.isActive ? "Yes" : "No"} />
              <InfoRow label="Suspended" value={selectedPolicy.isSuspended ? "Yes" : "No"} />
              <InfoRow label="Published" value={selectedPolicy.publishedAt ? new Date(selectedPolicy.publishedAt).toLocaleDateString() : "N/A"} />
              <InfoRow label="Created" value={new Date(selectedPolicy.createdAt).toLocaleDateString()} />
              <InfoRow label="Updated" value={new Date(selectedPolicy.updatedAt).toLocaleDateString()} />
              <InfoRow label="Acceptances" value={selectedPolicy._count?.acceptances || 0} />
            </div>
            <div style={{ padding: 12, borderRadius: 8, backgroundColor: "var(--background)" }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Company</p>
              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{selectedPolicy.company?.name}</p>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ padding: "8px 12px", borderRadius: 8, backgroundColor: "var(--background)" }}>
      <p style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 500 }}>{String(value)}</p>
    </div>
  );
}
