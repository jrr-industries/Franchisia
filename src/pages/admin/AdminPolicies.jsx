import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Eye, Shield, ShieldOff, Building2, Loader2,
  FileSignature, History, Clock, ArrowRight,
  Check, AlertCircle, ChevronDown, ChevronUp,
  DollarSign, Scale, BookOpen, MapPin, HelpCircle, FileText,
  BadgeCheck, ExternalLink,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";

const API = "/api";

const FIELD_LABELS = {
  minimumAge: "Minimum Age",
  minimumEducation: "Minimum Education",
  businessExperienceRequired: "Business Experience Required",
  netWorthRequired: "Net Worth Required",
  preferredIndustries: "Preferred Industries",
  commercialSpaceRequired: "Commercial Space Required",
  businessRegistrationRequired: "Business Registration Required",
  gstRequired: "GST Required",
  localLicenseRequired: "Local License Required",
  additionalRequirements: "Additional Requirements",
  minimumInvestment: "Minimum Investment",
  maximumInvestment: "Maximum Investment",
  franchiseFee: "Franchise Fee",
  royaltyFee: "Royalty Fee",
  marketingFee: "Marketing Fee",
  workingCapital: "Working Capital",
  securityDeposit: "Security Deposit",
  expectedROI: "Expected ROI",
  breakEvenPeriod: "Break Even Period",
  agreementDuration: "Agreement Duration",
  renewalAvailable: "Renewal Available",
  terminationConditions: "Termination Conditions",
  exitPolicy: "Exit Policy",
  transferPolicy: "Transfer Policy",
  renewalCharges: "Renewal Charges",
  initialTraining: "Initial Training",
  onSiteSupport: "On-site Support",
  marketingSupport: "Marketing Support",
  technologySupport: "Technology Support",
  operationsManual: "Operations Manual",
  storeSetupSupport: "Store Setup Support",
  hiringSupport: "Hiring Support",
  supplyChainSupport: "Supply Chain Support",
  exclusiveTerritory: "Exclusive Territory",
  nonExclusiveTerritory: "Non-Exclusive Territory",
  expansionPlans: "Expansion Plans",
  targetCities: "Target Cities",
  targetStates: "Target States",
  targetCountries: "Target Countries",
  refundPolicy: "Refund Policy",
  cancellationPolicy: "Cancellation Policy",
  brandGuidelines: "Brand Guidelines",
  trademarkRules: "Trademark Rules",
  confidentialityAgreement: "Confidentiality Agreement",
  codeOfConduct: "Code of Conduct",
};

const SECTIONS = [
  { id: "eligibility", icon: Check, title: "Eligibility Requirements", iconBg: "#10B981", fields: ["minimumAge", "minimumEducation", "businessExperienceRequired", "netWorthRequired", "commercialSpaceRequired", "businessRegistrationRequired", "gstRequired", "localLicenseRequired", "additionalRequirements"] },
  { id: "investment", icon: DollarSign, title: "Investment", iconBg: "#F59E0B", fields: ["minimumInvestment", "maximumInvestment", "franchiseFee", "royaltyFee", "marketingFee", "workingCapital", "securityDeposit", "expectedROI", "breakEvenPeriod"] },
  { id: "agreement", icon: Scale, title: "Agreement", iconBg: "#6366F1", fields: ["agreementDuration", "renewalAvailable", "terminationConditions", "exitPolicy", "transferPolicy", "renewalCharges"] },
  { id: "support", icon: BookOpen, title: "Training & Support", iconBg: "#8B5CF6", fields: ["initialTraining", "onSiteSupport", "marketingSupport", "technologySupport", "operationsManual", "storeSetupSupport", "hiringSupport", "supplyChainSupport"] },
  { id: "territory", icon: MapPin, title: "Territory", iconBg: "#3B82F6", fields: ["exclusiveTerritory", "nonExclusiveTerritory", "expansionPlans", "targetCities", "targetStates", "targetCountries"] },
  { id: "legal", icon: Shield, title: "Legal Policies", iconBg: "#EF4444", fields: ["refundPolicy", "cancellationPolicy", "brandGuidelines", "trademarkRules", "confidentialityAgreement", "codeOfConduct"] },
];

const SECTION_ORDER = [
  { id: "eligibility", label: "Eligibility", fields: ["minimumAge", "minimumEducation", "businessExperienceRequired", "netWorthRequired", "preferredIndustries", "commercialSpaceRequired", "businessRegistrationRequired", "gstRequired", "localLicenseRequired", "additionalRequirements"] },
  { id: "investment", label: "Investment", fields: ["minimumInvestment", "maximumInvestment", "franchiseFee", "royaltyFee", "marketingFee", "workingCapital", "securityDeposit", "expectedROI", "breakEvenPeriod"] },
  { id: "agreement", label: "Agreement", fields: ["agreementDuration", "renewalAvailable", "terminationConditions", "exitPolicy", "transferPolicy", "renewalCharges"] },
  { id: "support", label: "Training & Support", fields: ["initialTraining", "onSiteSupport", "marketingSupport", "technologySupport", "operationsManual", "storeSetupSupport", "hiringSupport", "supplyChainSupport"] },
  { id: "territory", label: "Territory", fields: ["exclusiveTerritory", "nonExclusiveTerritory", "expansionPlans", "targetCities", "targetStates", "targetCountries"] },
  { id: "legal", label: "Legal Policies", fields: ["refundPolicy", "cancellationPolicy", "brandGuidelines", "trademarkRules", "confidentialityAgreement", "codeOfConduct"] },
];

function formatVal(v) {
  if (v === null || v === undefined) return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v)) return v.length ? v.join(", ") : "—";
  return String(v);
}

function computeDiff(oldData, newData) {
  const changes = {};
  const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);
  for (const key of allKeys) {
    if (key === "id" || key === "companyId" || key === "createdAt" || key === "updatedAt" || key === "publishedAt") continue;
    const oldVal = oldData?.[key];
    const newVal = newData?.[key];
    const oldStr = JSON.stringify(oldVal);
    const newStr = JSON.stringify(newVal);
    if (oldStr !== newStr) {
      changes[key] = { old: oldVal, new: newVal };
    }
  }
  return changes;
}

export default function AdminPolicies() {
  const { addToast } = useToast();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailModal, setDetailModal] = useState(false);
  const [fullPolicy, setFullPolicy] = useState(null);
  const [fullLoading, setFullLoading] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const [historyPolicy, setHistoryPolicy] = useState(null);
  const [versions, setVersions] = useState([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [activeDetailSection, setActiveDetailSection] = useState("meta");

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

  const openDetail = async (p) => {
    setFullPolicy(null);
    setActiveDetailSection("meta");
    setDetailModal(true);
    setFullLoading(true);
    try {
      const res = await fetch(`${API}/policies/admin/${p.id}`, { credentials: "include" });
      if (res.ok) {
        setFullPolicy(await res.json());
      }
    } catch {} finally {
      setFullLoading(false);
    }
  };

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

  const openHistory = async (p) => {
    setHistoryPolicy(p);
    setHistoryModal(true);
    setVersions([]);
    setSelectedVersion(null);
    setExpandedSection(null);
    setVersionsLoading(true);
    try {
      const res = await fetch(`${API}/policies/admin/${p.id}/versions`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setVersions(data);
        if (data.length > 0) setSelectedVersion(data[0].id);
      }
    } catch {} finally {
      setVersionsLoading(false);
    }
  };

  const currentVersionData = versions.find((v) => v.id === selectedVersion);
  const prevVersionData = (() => {
    if (!selectedVersion) return null;
    const idx = versions.findIndex((v) => v.id === selectedVersion);
    if (idx < versions.length - 1) return versions[idx + 1];
    return null;
  })();

  const changes = currentVersionData
    ? computeDiff(prevVersionData?.data, currentVersionData.data)
    : {};

  const changedFields = new Set(Object.keys(changes));

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <Loader2 size={32} className="spin" color="var(--primary)" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Company Policies</h1>
      <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24 }}>
        View and manage all company franchise policies. Track franchisor changes across versions.
      </p>

      {policies.length === 0 ? (
        <Card padding="48px" style={{ textAlign: "center" }}>
          <FileSignature size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>No policies found.</p>
        </Card>
      ) : (
        <Card padding="0" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
                        title="View full policy"
                        onClick={() => openDetail(p)}
                      />
                      <Button
                        size="sm" variant="ghost"
                        icon={<History size={14} />}
                        title="View version history"
                        onClick={() => openHistory(p)}
                      />
                      <Button
                        size="sm" variant="ghost"
                        icon={p.isSuspended ? <Shield size={14} color="var(--success)" /> : <ShieldOff size={14} color="var(--danger)" />}
                        title={p.isSuspended ? "Reinstate" : "Suspend"}
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

      {/* ── Full Policy Detail Modal ── */}
      <Modal
        isOpen={detailModal}
        onClose={() => setDetailModal(false)}
        title={`Full Policy: ${fullPolicy?.company?.name || ""}`}
        width="800px"
      >
        {fullLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <Loader2 size={28} className="spin" color="var(--primary)" />
          </div>
        ) : !fullPolicy ? (
          <p style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Failed to load policy.</p>
        ) : (
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
              <NavBtn label="Overview" active={activeDetailSection === "meta"} onClick={() => setActiveDetailSection("meta")} />
              {SECTIONS.map((s) => (
                <NavBtn key={s.id} label={s.title} active={activeDetailSection === s.id} onClick={() => setActiveDetailSection(s.id)} />
              ))}
              {fullPolicy.faqs?.length > 0 && (
                <NavBtn label="FAQs" active={activeDetailSection === "faqs"} onClick={() => setActiveDetailSection("faqs")} />
              )}
              {fullPolicy.documents?.length > 0 && (
                <NavBtn label="Documents" active={activeDetailSection === "documents"} onClick={() => setActiveDetailSection("documents")} />
              )}
            </div>

            <div style={{ maxHeight: 500, overflowY: "auto" }}>
              {activeDetailSection === "meta" && (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <InfoRow label="Status" value={fullPolicy.status} />
                    <InfoRow label="Version" value={fullPolicy.version} />
                    <InfoRow label="Active" value={fullPolicy.isActive ? "Yes" : "No"} />
                    <InfoRow label="Suspended" value={fullPolicy.isSuspended ? "Yes" : "No"} />
                    <InfoRow label="Published" value={fullPolicy.publishedAt ? new Date(fullPolicy.publishedAt).toLocaleDateString() : "N/A"} />
                    <InfoRow label="Acceptances" value={fullPolicy._count?.acceptances || 0} />
                    <InfoRow label="Created" value={new Date(fullPolicy.createdAt).toLocaleDateString()} />
                    <InfoRow label="Updated" value={new Date(fullPolicy.updatedAt).toLocaleDateString()} />
                  </div>
                  {fullPolicy.company && (
                    <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, backgroundColor: "var(--background)" }}>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Company</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                        <Building2 size={16} color="var(--primary)" />
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{fullPolicy.company.name}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {SECTIONS.map((sec) => {
                if (activeDetailSection !== sec.id) return null;
                const Icon = sec.icon;
                const validFields = sec.fields.filter((f) => fullPolicy[f] !== null && fullPolicy[f] !== undefined);
                return (
                  <Card key={sec.id} padding="20px">
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: `${sec.iconBg}20`, color: sec.iconBg }}>
                        <Icon size={14} />
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 600 }}>{sec.title}</h3>
                    </div>
                    {validFields.length === 0 ? (
                      <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: 16 }}>No information provided.</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {validFields.map((f) => (
                          <FieldRow key={f} label={FIELD_LABELS[f] || f} value={formatVal(fullPolicy[f])} />
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}

              {activeDetailSection === "faqs" && fullPolicy.faqs?.length > 0 && (
                <Card padding="20px">
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#3B82F620", color: "#3B82F6" }}>
                      <HelpCircle size={14} />
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 600 }}>FAQs</h3>
                  </div>
                  {fullPolicy.faqs.map((faq) => (
                    <div key={faq.id} style={{ padding: 14, borderRadius: 8, border: "1px solid var(--border)", marginBottom: 8, backgroundColor: "var(--background)" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                        <HelpCircle size={14} color="var(--primary)" />{faq.question}
                      </p>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", paddingLeft: 20 }}>{faq.answer}</p>
                    </div>
                  ))}
                </Card>
              )}

              {activeDetailSection === "documents" && fullPolicy.documents?.length > 0 && (
                <Card padding="20px">
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#8B5CF620", color: "#8B5CF6" }}>
                      <FileText size={14} />
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 600 }}>Documents ({fullPolicy.documents.length})</h3>
                  </div>
                  {fullPolicy.documents.map((doc) => (
                    <div key={doc.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", marginBottom: 6, backgroundColor: "var(--background)" }}>
                      <FileText size={18} color="var(--primary)" />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 500 }}>{doc.title}</p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{doc.type?.replace(/_/g, " ")}{doc.isHidden ? " · Hidden" : ""}</p>
                      </div>
                      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                        {doc.isHidden !== undefined && (
                          <Button size="sm" variant="ghost" onClick={() => handleHideDoc(doc.id, !doc.isHidden)}>
                            {doc.isHidden ? "Unhide" : "Hide"}
                          </Button>
                        )}
                        {doc.url && (
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>
                            <ExternalLink size={16} color="var(--text-muted)" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </Card>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ── Version History Modal ── */}
      <Modal
        isOpen={historyModal}
        onClose={() => setHistoryModal(false)}
        title={`Change History: ${historyPolicy?.company?.name || ""}`}
        width="800px"
      >
        <div style={{ display: "flex", gap: 16, minHeight: 400 }}>
          <div style={{ width: 220, flexShrink: 0, borderRight: "1px solid var(--border)", paddingRight: 12, overflowY: "auto", maxHeight: 500 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
              Versions
            </p>
            {versionsLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
                <Loader2 size={20} className="spin" color="var(--primary)" />
              </div>
            ) : versions.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No versions</p>
            ) : (
              versions.map((v) => {
                const isSelected = v.id === selectedVersion;
                const changeCount = isSelected ? Object.keys(changes).length : 0;
                return (
                  <button
                    key={v.id}
                    onClick={() => { setSelectedVersion(v.id); setExpandedSection(null); }}
                    style={{
                      display: "block", width: "100%", textAlign: "left", padding: "8px 10px",
                      borderRadius: 6, border: "none", cursor: "pointer",
                      backgroundColor: isSelected ? "var(--primary-light)" : "transparent",
                      color: isSelected ? "var(--primary)" : "var(--text-secondary)",
                      fontWeight: isSelected ? 600 : 400, fontSize: 13,
                      marginBottom: 4, transition: "all 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Clock size={12} />
                      v{v.version}
                    </div>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                      {new Date(v.createdAt).toLocaleDateString()}
                    </p>
                    {isSelected && changeCount > 0 && (
                      <p style={{ fontSize: 10, color: "var(--warning)", marginTop: 2 }}>
                        {changeCount} change{changeCount !== 1 ? "s" : ""}
                      </p>
                    )}
                  </button>
                );
              })
            )}
          </div>

          <div style={{ flex: 1, overflowY: "auto", maxHeight: 500 }}>
            {!currentVersionData ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Select a version to view changes</p>
              </div>
            ) : Object.keys(changes).length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 8 }}>
                <Check size={32} color="var(--success)" />
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No changes in this version</p>
                {prevVersionData && (
                  <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    Compared to v{prevVersionData.version}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <AlertCircle size={16} color="var(--warning)" />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>
                    {Object.keys(changes).length} field{Object.keys(changes).length !== 1 ? "s" : ""} changed
                  </span>
                  {prevVersionData && (
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      (vs v{prevVersionData.version})
                    </span>
                  )}
                </div>

                {SECTION_ORDER.map((section) => {
                  const sectionChanges = section.fields.filter((f) => changedFields.has(f));
                  if (sectionChanges.length === 0) return null;
                  const isOpen = expandedSection === section.id;
                  return (
                    <div key={section.id} style={{ marginBottom: 8, borderRadius: 8, border: "1px solid var(--border)", overflow: "hidden" }}>
                      <button
                        onClick={() => setExpandedSection(isOpen ? null : section.id)}
                        style={{
                          display: "flex", alignItems: "center", gap: 6, width: "100%",
                          padding: "8px 12px", border: "none", background: "var(--background)",
                          cursor: "pointer", fontSize: 13, fontWeight: 600,
                        }}
                      >
                        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {section.label}
                        <Badge variant="warning" style={{ fontSize: 9, marginLeft: "auto" }}>
                          {sectionChanges.length}
                        </Badge>
                      </button>
                      {isOpen && (
                        <div style={{ padding: "4px 12px 12px" }}>
                          {sectionChanges.map((key) => {
                            const c = changes[key];
                            return (
                              <div key={key} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                                  {FIELD_LABELS[key] || key}
                                </p>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 24px 1fr", gap: 8, alignItems: "center" }}>
                                  <div style={{ padding: "6px 8px", borderRadius: 4, backgroundColor: "rgba(239,68,68,0.1)", color: "var(--danger)", fontSize: 12, textDecoration: "line-through" }}>
                                    {formatVal(c.old)}
                                  </div>
                                  <ArrowRight size={14} color="var(--text-muted)" />
                                  <div style={{ padding: "6px 8px", borderRadius: 4, backgroundColor: "rgba(34,197,94,0.1)", color: "var(--success)", fontSize: 12 }}>
                                    {formatVal(c.new)}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {(["faqs", "documents", "status", "version", "isActive"]).filter((k) => changedFields.has(k)).length > 0 && (
                  <div style={{ marginTop: 12, padding: 12, borderRadius: 8, border: "1px solid var(--border)" }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8 }}>
                      Other Changes
                    </p>
                    {["faqs", "documents", "status", "version", "isActive"].filter((k) => changedFields.has(k)).map((key) => {
                      const c = changes[key];
                      return (
                        <div key={key} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                            {FIELD_LABELS[key] || key}
                          </p>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 24px 1fr", gap: 8, alignItems: "center" }}>
                            <div style={{ padding: "6px 8px", borderRadius: 4, backgroundColor: "rgba(239,68,68,0.1)", color: "var(--danger)", fontSize: 12, textDecoration: "line-through" }}>
                              {formatVal(c.old)}
                            </div>
                            <ArrowRight size={14} color="var(--text-muted)" />
                            <div style={{ padding: "6px 8px", borderRadius: 4, backgroundColor: "rgba(34,197,94,0.1)", color: "var(--success)", fontSize: 12 }}>
                              {formatVal(c.new)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}

const s = {
  th: {
    textAlign: "left", padding: "10px 14px", fontSize: 12, fontWeight: 600,
    color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1,
    borderBottom: "1px solid var(--border)",
  },
  td: {
    padding: "12px 14px", fontSize: 13, borderBottom: "1px solid var(--border)",
  },
};

function NavBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 12px", borderRadius: 100, fontSize: 12, fontWeight: 500,
        border: "1px solid", cursor: "pointer", whiteSpace: "nowrap",
        borderColor: active ? "var(--primary)" : "var(--border)",
        backgroundColor: active ? "var(--primary-light)" : "transparent",
        color: active ? "var(--primary)" : "var(--text-secondary)",
      }}
    >
      {label}
    </button>
  );
}

function FieldRow({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderRadius: 8, backgroundColor: "var(--background)", gap: 12 }}>
      <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, textAlign: "right", flex: 1 }}>{String(value)}</span>
    </div>
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
