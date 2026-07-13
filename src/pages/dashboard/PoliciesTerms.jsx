import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Save, Check, X, Plus, Trash2, Upload, Eye, FileText,
  Monitor, Tablet, Smartphone, Clock, History, Globe,
  ArrowUp, AlertTriangle, ChevronDown, ChevronRight,
  HelpCircle, DollarSign, Scale, BookOpen, MapPin,
  Shield, File, Camera, Play, Loader2, BadgeCheck,
  DraftingCompass, Lightbulb, GripVertical, Archive,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/ui/Toast";

const API = "/api";

const policySchema = z.object({
  minimumAge: z.coerce.number().min(0).optional().nullable(),
  minimumEducation: z.string().optional().nullable(),
  businessExperienceRequired: z.string().optional().nullable(),
  netWorthRequired: z.string().optional().nullable(),
  preferredIndustries: z.array(z.string()).optional().nullable(),
  commercialSpaceRequired: z.boolean().optional().nullable(),
  businessRegistrationRequired: z.boolean().optional().nullable(),
  gstRequired: z.boolean().optional().nullable(),
  localLicenseRequired: z.boolean().optional().nullable(),
  additionalRequirements: z.string().optional().nullable(),

  minimumInvestment: z.string().optional().nullable(),
  maximumInvestment: z.string().optional().nullable(),
  franchiseFee: z.string().optional().nullable(),
  royaltyFee: z.string().optional().nullable(),
  marketingFee: z.string().optional().nullable(),
  workingCapital: z.string().optional().nullable(),
  securityDeposit: z.string().optional().nullable(),
  expectedROI: z.string().optional().nullable(),
  breakEvenPeriod: z.string().optional().nullable(),

  agreementDuration: z.string().optional().nullable(),
  renewalAvailable: z.boolean().optional().nullable(),
  terminationConditions: z.string().optional().nullable(),
  exitPolicy: z.string().optional().nullable(),
  transferPolicy: z.string().optional().nullable(),
  renewalCharges: z.string().optional().nullable(),

  initialTraining: z.string().optional().nullable(),
  onSiteSupport: z.string().optional().nullable(),
  marketingSupport: z.string().optional().nullable(),
  technologySupport: z.string().optional().nullable(),
  operationsManual: z.string().optional().nullable(),
  storeSetupSupport: z.string().optional().nullable(),
  hiringSupport: z.string().optional().nullable(),
  supplyChainSupport: z.string().optional().nullable(),

  exclusiveTerritory: z.boolean().optional().nullable(),
  nonExclusiveTerritory: z.boolean().optional().nullable(),
  expansionPlans: z.string().optional().nullable(),
  targetCities: z.array(z.string()).optional().nullable(),
  targetStates: z.array(z.string()).optional().nullable(),
  targetCountries: z.array(z.string()).optional().nullable(),

  refundPolicy: z.string().optional().nullable(),
  cancellationPolicy: z.string().optional().nullable(),
  brandGuidelines: z.string().optional().nullable(),
  trademarkRules: z.string().optional().nullable(),
  confidentialityAgreement: z.string().optional().nullable(),
  codeOfConduct: z.string().optional().nullable(),
});

const sections = [
  { id: "eligibility", label: "Eligibility", icon: Check },
  { id: "investment", label: "Investment", icon: DollarSign },
  { id: "agreement", label: "Agreement", icon: Scale },
  { id: "training", label: "Support", icon: BookOpen },
  { id: "territory", label: "Territory", icon: MapPin },
  { id: "legal", label: "Legal", icon: Shield },
  { id: "faqs", label: "FAQs", icon: HelpCircle },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "preview", label: "Preview", icon: Eye },
  { id: "publish", label: "Publish", icon: Globe },
];

const s = {
  page: { maxWidth: 1200, margin: "0 auto" },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    marginBottom: 28, gap: 16, flexWrap: "wrap",
  },
  headerLeft: { display: "flex", flexDirection: "column", gap: 8 },
  title: { fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" },
  subtitle: { fontSize: 14, color: "var(--text-secondary)", marginTop: 2 },
  headerRight: { display: "flex", gap: 10, alignItems: "center" },
  layout: { display: "flex", gap: 28, position: "relative" },
  toc: {
    width: 220, flexShrink: 0, position: "sticky", top: 24, alignSelf: "flex-start",
    maxHeight: "calc(100vh - 120px)", overflowY: "auto",
  },
  tocInner: {
    padding: 12, backgroundColor: "var(--surface)", borderRadius: "var(--radius-md)",
    border: "1px solid var(--border)",
  },
  tocItem: {
    display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
    borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer",
    border: "none", background: "none", width: "100%", textAlign: "left",
    transition: "all 0.15s",
  },
  content: { flex: 1, minWidth: 0 },
  section: {
    marginBottom: 28, scrollMarginTop: 80,
  },
  sectionCard: {
    padding: 28, borderRadius: "var(--radius-lg)",
    border: "1px solid var(--border)", backgroundColor: "var(--surface)",
  },
  sectionHeader: {
    display: "flex", alignItems: "center", gap: 12, marginBottom: 24,
    paddingBottom: 16, borderBottom: "1px solid var(--border)",
  },
  sectionIcon: {
    width: 36, height: 36, borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
    backgroundColor: "var(--primary-light)", color: "var(--primary)",
  },
  sectionTitle: { fontSize: 17, fontWeight: 600 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 4 },
  label: { fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" },
  input: {
    width: "100%", padding: "8px 12px", borderRadius: 8,
    border: "1px solid var(--border)", backgroundColor: "var(--background)",
    color: "var(--text)", fontSize: 13, outline: "none",
    transition: "border-color 0.15s", boxSizing: "border-box",
  },
  textarea: {
    width: "100%", padding: "8px 12px", borderRadius: 8,
    border: "1px solid var(--border)", backgroundColor: "var(--background)",
    color: "var(--text)", fontSize: 13, outline: "none",
    fontFamily: "inherit", resize: "vertical", minHeight: 80,
    transition: "border-color 0.15s", boxSizing: "border-box",
  },
  checkbox: {
    display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
    padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)",
    transition: "all 0.15s", fontSize: 13, userSelect: "none",
  },
  progressBar: {
    width: "100%", height: 4, backgroundColor: "var(--border)",
    borderRadius: 2, overflow: "hidden", marginBottom: 24,
  },
  progressFill: { height: "100%", backgroundColor: "var(--primary)", borderRadius: 2, transition: "width 0.5s ease" },
  faqCard: {
    padding: 16, borderRadius: 10, border: "1px solid var(--border)",
    marginBottom: 10, backgroundColor: "var(--background)",
  },
  docCard: {
    display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
    borderRadius: 10, border: "1px solid var(--border)", marginBottom: 8,
  },
  versionChip: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 600,
    backgroundColor: "var(--primary-light)", color: "var(--primary)",
  },
  previewFrame: {
    width: "100%", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
    backgroundColor: "var(--background)", overflow: "hidden",
  },
};

function Field({ label, error, children }) {
  return (
    <div style={s.field}>
      <label style={{ ...s.label, color: error ? "var(--danger)" : "var(--text-secondary)" }}>{label}</label>
      {children}
      {error && <span style={{ fontSize: 11, color: "var(--danger)" }}>{error}</span>}
    </div>
  );
}

function Toggle({ value, onChange, label }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        ...s.checkbox,
        borderColor: value ? "var(--primary)" : "var(--border)",
        backgroundColor: value ? "var(--primary-light)" : "transparent",
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: 4, border: "2px solid",
        borderColor: value ? "var(--primary)" : "var(--border)",
        backgroundColor: value ? "var(--primary)" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, transition: "all 0.15s",
      }}>
        {value && <Check size={12} color="#fff" />}
      </div>
      <span>{label}</span>
    </div>
  );
}

export default function PoliciesTerms() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [policy, setPolicy] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("eligibility");
  const [faqs, setFaqs] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [versions, setVersions] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [versionModal, setVersionModal] = useState(false);
  const [faqForm, setFaqForm] = useState({ question: "", answer: "" });
  const [faqModal, setFaqModal] = useState(null);
  const [faqSubmitting, setFaqSubmitting] = useState(false);
  const [docUploading, setDocUploading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [progress, setProgress] = useState(0);

  const autoSaveTimer = useRef(null);
  const formRef = useRef(null);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    resolver: zodResolver(policySchema),
    defaultValues: {},
  });

  const formValues = watch();

  useEffect(() => {
    const completed = sections.filter(s => s.id !== "faqs" && s.id !== "documents" && s.id !== "preview" && s.id !== "publish").reduce((count, s) => {
      const sectionFields = {
        eligibility: ["minimumAge", "minimumEducation", "businessExperienceRequired", "netWorthRequired", "preferredIndustries", "additionalRequirements"],
        investment: ["minimumInvestment", "maximumInvestment", "franchiseFee", "royaltyFee", "marketingFee", "workingCapital", "securityDeposit", "expectedROI", "breakEvenPeriod"],
        agreement: ["agreementDuration", "terminationConditions", "exitPolicy", "transferPolicy", "renewalCharges"],
        training: ["initialTraining", "onSiteSupport", "marketingSupport", "technologySupport", "operationsManual", "storeSetupSupport", "hiringSupport", "supplyChainSupport"],
        territory: ["expansionPlans"],
        legal: ["refundPolicy", "cancellationPolicy", "brandGuidelines", "trademarkRules", "confidentialityAgreement", "codeOfConduct"],
      }[s.id] || [];
      const filled = sectionFields.filter(f => formValues[f]).length;
      return count + (filled / Math.max(sectionFields.length, 1));
    }, 0);
    const totalSections = 6;
    setProgress(Math.min(100, Math.round((completed / totalSections) * 100)));
  }, [formValues]);

  useEffect(() => {
    if (!hasChanges) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      if (policy?.id) handleSave();
      else setHasChanges(false);
    }, 3000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [hasChanges, formValues]);

  useEffect(() => {
    setHasChanges(true);
  }, [formValues]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  const fetchPolicy = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/policies/my`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setCompanyId(data.companyId);
        if (data.policy) {
          setPolicy(data.policy);
          reset(data.policy);
          setFaqs(data.policy.faqs || []);
          setDocuments(data.policy.documents || []);
          setVersions(data.policy.versions || []);
        }
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [reset]);

  useEffect(() => { fetchPolicy(); }, [fetchPolicy]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const vals = {};
      Object.keys(formValues).forEach(k => { if (formValues[k] !== undefined) vals[k] = formValues[k]; });

      if (policy?.id) {
        const res = await fetch(`${API}/policies/${policy.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(vals),
        });
        if (res.ok) {
          addToast("Changes saved", "success");
          setHasChanges(false);
          const updated = await res.json();
          setPolicy(updated);
        } else {
          const err = await res.json();
          addToast(err.error || "Save failed", "error");
        }
      } else {
        const res = await fetch(`${API}/policies`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(vals),
        });
        if (res.ok) {
          addToast("Policy created", "success");
          setHasChanges(false);
          const created = await res.json();
          setPolicy(created);
          setVersions(created.versions || []);
        } else {
          const err = await res.json();
          addToast(err.error || "Create failed", "error");
        }
      }
    } catch {
      addToast("Network error", "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!policy?.id) return;
    try {
      const res = await fetch(`${API}/policies/${policy.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ description: `Policy v${policy.version}` }),
      });
      if (res.ok) {
        addToast("Policy published!", "success");
        fetchPolicy();
      } else {
        const err = await res.json();
        addToast(err.error || "Publish failed", "error");
      }
    } catch {
      addToast("Network error", "error");
    }
  };

  const handleArchive = async () => {
    if (!policy?.id) return;
    try {
      const res = await fetch(`${API}/policies/${policy.id}/archive`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        addToast("Policy archived", "success");
        fetchPolicy();
      } else {
        const err = await res.json();
        addToast(err.error || "Archive failed", "error");
      }
    } catch {
      addToast("Network error", "error");
    }
  };

  const handleAddFaq = async () => {
    if (!faqForm.question.trim() || !faqForm.answer.trim() || !policy?.id) return;
    setFaqSubmitting(true);
    try {
      const res = await fetch(`${API}/policies/${policy.id}/faqs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(faqForm),
      });
      if (res.ok) {
        const faq = await res.json();
        setFaqs(prev => [...prev, faq]);
        setFaqForm({ question: "", answer: "" });
        setFaqModal(null);
        addToast("FAQ added", "success");
      } else {
        addToast("Failed to add FAQ", "error");
      }
    } catch {
      addToast("Network error", "error");
    } finally {
      setFaqSubmitting(false);
    }
  };

  const handleDeleteFaq = async (faqId) => {
    if (!policy?.id) return;
    try {
      const res = await fetch(`${API}/policies/${policy.id}/faqs/${faqId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setFaqs(prev => prev.filter(f => f.id !== faqId));
        addToast("FAQ deleted", "success");
      } else {
        addToast("Failed to delete FAQ", "error");
      }
    } catch {
      addToast("Network error", "error");
    }
  };

  const handleDocUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file || !policy?.id) return;
    setDocUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    formData.append("title", file.name);
    try {
      const res = await fetch(`${API}/policies/${policy.id}/documents`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (res.ok) {
        const doc = await res.json();
        setDocuments(prev => [...prev, doc]);
        addToast("Document uploaded", "success");
      } else {
        addToast("Upload failed", "error");
      }
    } catch {
      addToast("Network error", "error");
    } finally {
      setDocUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!policy?.id) return;
    try {
      const res = await fetch(`${API}/policies/${policy.id}/documents/${docId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== docId));
        addToast("Document deleted", "success");
      } else {
        addToast("Failed to delete document", "error");
      }
    } catch {
      addToast("Network error", "error");
    }
  };

  const scrollToSection = (id) => {
    setActiveSection(id);
    const el = document.getElementById(`section-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const renderInput = (name, placeholder, type = "text") => (
    <input
      {...register(name)}
      type={type}
      placeholder={placeholder}
      style={s.input}
      onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
      onBlur={(e) => e.target.style.borderColor = ""}
    />
  );

  const renderTextarea = (name, placeholder) => (
    <textarea
      {...register(name)}
      placeholder={placeholder}
      style={s.textarea}
      onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
      onBlur={(e) => e.target.style.borderColor = ""}
    />
  );

  const renderPreviewContent = () => {
    const data = formValues;
    return (
      <div style={{ padding: 32, fontSize: 14, lineHeight: 1.7, color: "var(--text)" }}>
        {policy && (
          <div style={{ marginBottom: 24, textAlign: "center" }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Franchise Policies & Terms</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Version {policy.version} | Last updated: {new Date(policy.updatedAt).toLocaleDateString()}</p>
          </div>
        )}

        <SectionPreview title="Eligibility Requirements" data={[
          ["Minimum Age", data.minimumAge],
          ["Minimum Education", data.minimumEducation],
          ["Business Experience Required", data.businessExperienceRequired],
          ["Net Worth Required", data.netWorthRequired],
          ["Commercial Space Required", data.commercialSpaceRequired ? "Yes" : null],
          ["Business Registration Required", data.businessRegistrationRequired ? "Yes" : null],
          ["GST Required", data.gstRequired ? "Yes" : null],
          ["Local License Required", data.localLicenseRequired ? "Yes" : null],
          ["Additional Requirements", data.additionalRequirements],
        ]} />

        <SectionPreview title="Investment" data={[
          ["Minimum Investment", data.minimumInvestment],
          ["Maximum Investment", data.maximumInvestment],
          ["Franchise Fee", data.franchiseFee],
          ["Royalty Fee", data.royaltyFee],
          ["Marketing Fee", data.marketingFee],
          ["Working Capital", data.workingCapital],
          ["Security Deposit", data.securityDeposit],
          ["Expected ROI", data.expectedROI],
          ["Break Even Period", data.breakEvenPeriod],
        ]} />

        <SectionPreview title="Agreement" data={[
          ["Agreement Duration", data.agreementDuration],
          ["Renewal Available", data.renewalAvailable ? "Yes" : null],
          ["Termination Conditions", data.terminationConditions],
          ["Exit Policy", data.exitPolicy],
          ["Transfer Policy", data.transferPolicy],
          ["Renewal Charges", data.renewalCharges],
        ]} />

        <SectionPreview title="Training & Support" data={[
          ["Initial Training", data.initialTraining],
          ["On-site Support", data.onSiteSupport],
          ["Marketing Support", data.marketingSupport],
          ["Technology Support", data.technologySupport],
          ["Operations Manual", data.operationsManual],
          ["Store Setup Support", data.storeSetupSupport],
          ["Hiring Support", data.hiringSupport],
          ["Supply Chain Support", data.supplyChainSupport],
        ]} />

        <SectionPreview title="Territory" data={[
          ["Exclusive Territory", data.exclusiveTerritory ? "Yes" : null],
          ["Non-Exclusive Territory", data.nonExclusiveTerritory ? "Yes" : null],
          ["Expansion Plans", data.expansionPlans],
        ]} />

        <SectionPreview title="Legal Policies" data={[
          ["Refund Policy", data.refundPolicy],
          ["Cancellation Policy", data.cancellationPolicy],
          ["Brand Guidelines", data.brandGuidelines],
          ["Trademark Rules", data.trademarkRules],
          ["Confidentiality Agreement", data.confidentialityAgreement],
          ["Code of Conduct", data.codeOfConduct],
        ]} />

        {faqs.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, paddingBottom: 8, borderBottom: "2px solid var(--primary)" }}>Frequently Asked Questions</h3>
            {faqs.map((faq, i) => (
              <div key={faq.id || i} style={{ marginBottom: 16, padding: 16, borderRadius: 8, backgroundColor: "var(--background)" }}>
                <p style={{ fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Q: {faq.question}</p>
                <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>A: {faq.answer}</p>
              </div>
            ))}
          </div>
        )}

        {documents.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, paddingBottom: 8, borderBottom: "2px solid var(--primary)" }}>Documents</h3>
            {documents.filter(d => !d.isHidden).map((doc, i) => (
              <div key={doc.id || i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 8, backgroundColor: "var(--background)", marginBottom: 8 }}>
                <FileText size={20} color="var(--primary)" />
                <span style={{ fontWeight: 500, fontSize: 14 }}>{doc.title}</span>
                <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)" }}>{doc.type}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 32, padding: 20, borderRadius: 10, backgroundColor: "var(--primary-light)", textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "var(--primary)", fontWeight: 500 }}>I have read and agree to the company's Franchise Terms & Conditions.</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <Loader2 size={32} className="spin" color="var(--primary)" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={s.page}>
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={s.title}>Policies & Terms</h1>
            {policy && (
              <Badge variant={policy.status === "published" ? "success" : policy.status === "archived" ? "secondary" : "default"}>
                {policy.status === "published" ? "Published" : policy.status === "archived" ? "Archived" : "Draft"}
              </Badge>
            )}
          </div>
          <p style={s.subtitle}>Manage your franchise policies, terms, and requirements</p>
        </div>
        <div style={s.headerRight}>
          {policy?.status === "published" && <div style={s.versionChip}><BadgeCheck size={14} /> v{policy.version}</div>}
          {hasChanges && <span style={{ fontSize: 12, color: "var(--warning)", display: "flex", alignItems: "center", gap: 4 }}><AlertTriangle size={14} /> Unsaved changes</span>}
          <Button variant="ghost" size="sm" icon={<History size={16} />} onClick={() => setVersionModal(true)} disabled={versions.length === 0}>
            History
          </Button>
          <Button variant="secondary" size="sm" icon={<Save size={16} />} onClick={handleSave} disabled={!hasChanges || saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div style={s.progressBar}>
        <div style={{ ...s.progressFill, width: `${progress}%` }} />
      </div>

      <div style={s.layout}>
        <div style={s.toc}>
          <div style={s.tocInner}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, padding: "4px 12px 12px" }}>Sections</p>
            {sections.map((sec) => {
              const Icon = sec.icon;
              return (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  style={{
                    ...s.tocItem,
                    color: activeSection === sec.id ? "var(--primary)" : "var(--text-secondary)",
                    backgroundColor: activeSection === sec.id ? "var(--primary-light)" : "transparent",
                  }}
                >
                  <Icon size={16} />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={s.content}>
          <form onChange={() => setHasChanges(true)}>
            <Section id="eligibility" title="Eligibility Requirements" icon={Check}>
              <div style={s.grid2}>
                <Field label="Minimum Age" error={errors.minimumAge?.message}>
                  {renderInput("minimumAge", "e.g. 21", "number")}
                </Field>
                <Field label="Minimum Education" error={errors.minimumEducation?.message}>
                  {renderInput("minimumEducation", "e.g. High School, Bachelor's")}
                </Field>
              </div>
              <div style={s.grid2}>
                <Field label="Business Experience Required" error={errors.businessExperienceRequired?.message}>
                  {renderInput("businessExperienceRequired", "e.g. 2+ years")}
                </Field>
                <Field label="Net Worth Required" error={errors.netWorthRequired?.message}>
                  {renderInput("netWorthRequired", "e.g. $100,000")}
                </Field>
              </div>
              <Field label="Preferred Industries">
                {renderInput("preferredIndustries", "e.g. Retail, Food & Beverage, Healthcare")}
              </Field>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Toggle value={watch("commercialSpaceRequired") || false} onChange={(v) => setValue("commercialSpaceRequired", v)} label="Commercial Space Required" />
                <Toggle value={watch("businessRegistrationRequired") || false} onChange={(v) => setValue("businessRegistrationRequired", v)} label="Business Registration Required" />
                <Toggle value={watch("gstRequired") || false} onChange={(v) => setValue("gstRequired", v)} label="GST Required" />
                <Toggle value={watch("localLicenseRequired") || false} onChange={(v) => setValue("localLicenseRequired", v)} label="Local License Required" />
              </div>
              <Field label="Additional Requirements">
                {renderTextarea("additionalRequirements", "Any other eligibility requirements...")}
              </Field>
            </Section>

            <Section id="investment" title="Investment" icon={DollarSign}>
              <div style={s.grid2}>
                <Field label="Minimum Investment">
                  {renderInput("minimumInvestment", "e.g. $50,000")}
                </Field>
                <Field label="Maximum Investment">
                  {renderInput("maximumInvestment", "e.g. $200,000")}
                </Field>
              </div>
              <div style={s.grid3}>
                <Field label="Franchise Fee">
                  {renderInput("franchiseFee", "e.g. $25,000")}
                </Field>
                <Field label="Royalty Fee">
                  {renderInput("royaltyFee", "e.g. 5%")}
                </Field>
                <Field label="Marketing Fee">
                  {renderInput("marketingFee", "e.g. 2%")}
                </Field>
              </div>
              <div style={s.grid3}>
                <Field label="Working Capital">
                  {renderInput("workingCapital", "e.g. $30,000")}
                </Field>
                <Field label="Security Deposit">
                  {renderInput("securityDeposit", "e.g. $10,000")}
                </Field>
                <Field label="Expected ROI">
                  {renderInput("expectedROI", "e.g. 20-30%")}
                </Field>
              </div>
              <Field label="Break Even Period">
                {renderInput("breakEvenPeriod", "e.g. 12-18 months")}
              </Field>
            </Section>

            <Section id="agreement" title="Agreement" icon={Scale}>
              <div style={s.grid2}>
                <Field label="Agreement Duration">
                  {renderInput("agreementDuration", "e.g. 5 years")}
                </Field>
                <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 4 }}>
                  <Toggle value={watch("renewalAvailable") || false} onChange={(v) => setValue("renewalAvailable", v)} label="Renewal Available" />
                </div>
              </div>
              <Field label="Termination Conditions">
                {renderTextarea("terminationConditions", "Describe conditions for termination...")}
              </Field>
              <div style={s.grid2}>
                <Field label="Exit Policy">
                  {renderTextarea("exitPolicy", "Describe exit policy...")}
                </Field>
                <Field label="Transfer Policy">
                  {renderTextarea("transferPolicy", "Describe transfer policy...")}
                </Field>
              </div>
              <Field label="Renewal Charges">
                {renderInput("renewalCharges", "e.g. $5,000 renewal fee")}
              </Field>
            </Section>

            <Section id="training" title="Training & Support" icon={BookOpen}>
              <div style={s.grid2}>
                <Field label="Initial Training">
                  {renderTextarea("initialTraining", "Describe initial training program...")}
                </Field>
                <Field label="On-site Support">
                  {renderTextarea("onSiteSupport", "Describe on-site support...")}
                </Field>
              </div>
              <div style={s.grid2}>
                <Field label="Marketing Support">
                  {renderTextarea("marketingSupport", "Describe marketing support...")}
                </Field>
                <Field label="Technology Support">
                  {renderTextarea("technologySupport", "Describe technology support...")}
                </Field>
              </div>
              <div style={s.grid2}>
                <Field label="Operations Manual">
                  {renderTextarea("operationsManual", "Describe operations manual...")}
                </Field>
                <Field label="Store Setup Support">
                  {renderTextarea("storeSetupSupport", "Describe store setup support...")}
                </Field>
              </div>
              <div style={s.grid2}>
                <Field label="Hiring Support">
                  {renderTextarea("hiringSupport", "Describe hiring support...")}
                </Field>
                <Field label="Supply Chain Support">
                  {renderTextarea("supplyChainSupport", "Describe supply chain support...")}
                </Field>
              </div>
            </Section>

            <Section id="territory" title="Territory" icon={MapPin}>
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <Toggle value={watch("exclusiveTerritory") || false} onChange={(v) => setValue("exclusiveTerritory", v)} label="Exclusive Territory" />
                <Toggle value={watch("nonExclusiveTerritory") || false} onChange={(v) => setValue("nonExclusiveTerritory", v)} label="Non-Exclusive Territory" />
              </div>
              <Field label="Expansion Plans">
                {renderTextarea("expansionPlans", "Describe expansion plans...")}
              </Field>
              <div style={s.grid3}>
                <Field label="Target Cities">
                  {renderInput("targetCities", "e.g. New York, Los Angeles")}
                </Field>
                <Field label="Target States">
                  {renderInput("targetStates", "e.g. California, Texas")}
                </Field>
                <Field label="Target Countries">
                  {renderInput("targetCountries", "e.g. USA, Canada")}
                </Field>
              </div>
            </Section>

            <Section id="legal" title="Legal Policies" icon={Shield}>
              <div style={s.grid2}>
                <Field label="Refund Policy">
                  {renderTextarea("refundPolicy", "Describe refund policy...")}
                </Field>
                <Field label="Cancellation Policy">
                  {renderTextarea("cancellationPolicy", "Describe cancellation policy...")}
                </Field>
              </div>
              <div style={s.grid2}>
                <Field label="Brand Guidelines">
                  {renderTextarea("brandGuidelines", "Describe brand guidelines...")}
                </Field>
                <Field label="Trademark Rules">
                  {renderTextarea("trademarkRules", "Describe trademark rules...")}
                </Field>
              </div>
              <div style={s.grid2}>
                <Field label="Confidentiality Agreement">
                  {renderTextarea("confidentialityAgreement", "Describe confidentiality agreement...")}
                </Field>
                <Field label="Code of Conduct">
                  {renderTextarea("codeOfConduct", "Describe code of conduct...")}
                </Field>
              </div>
            </Section>
          </form>

          <Section id="faqs" title="Frequently Asked Questions" icon={HelpCircle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{faqs.length} FAQ{faqs.length !== 1 ? "s" : ""}</span>
              <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setFaqModal("add")}>
                Add FAQ
              </Button>
            </div>
            {faqs.length === 0 ? (
              <p style={{ fontSize: 14, color: "var(--text-muted)", textAlign: "center", padding: 32 }}>
                No FAQs yet. Add common questions franchisees ask.
              </p>
            ) : (
              faqs.map((faq, i) => (
                <div key={faq.id} style={s.faqCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <HelpCircle size={16} color="var(--primary)" />
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{faq.question}</span>
                      </div>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginLeft: 24 }}>{faq.answer}</p>
                    </div>
                    <button onClick={() => handleDeleteFaq(faq.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4, borderRadius: 4, display: "flex" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}

            <Modal isOpen={faqModal === "add"} onClose={() => setFaqModal(null)} title="Add FAQ">
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Field label="Question">
                  <input
                    value={faqForm.question}
                    onChange={(e) => setFaqForm(prev => ({ ...prev, question: e.target.value }))}
                    placeholder="e.g. How much investment is required?"
                    style={s.input}
                  />
                </Field>
                <Field label="Answer">
                  <textarea
                    value={faqForm.answer}
                    onChange={(e) => setFaqForm(prev => ({ ...prev, answer: e.target.value }))}
                    placeholder="Write a clear answer..."
                    style={s.textarea}
                    rows={4}
                  />
                </Field>
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <Button variant="secondary" size="sm" onClick={() => setFaqModal(null)}>Cancel</Button>
                  <Button variant="primary" size="sm" onClick={handleAddFaq} disabled={!faqForm.question.trim() || !faqForm.answer.trim() || faqSubmitting}>
                    {faqSubmitting ? "Adding..." : "Add FAQ"}
                  </Button>
                </div>
              </div>
            </Modal>
          </Section>

          <Section id="documents" title="Documents" icon={FileText}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
              {[
                { type: "franchise_agreement", label: "Franchise Agreement", icon: FileText },
                { type: "investment_brochure", label: "Investment Brochure", icon: FileText },
                { type: "company_brochure", label: "Company Brochure", icon: FileText },
                { type: "brand_guidelines", label: "Brand Guidelines", icon: FileText },
                { type: "fdd", label: "FDD", icon: FileText },
                { type: "image", label: "Images", icon: Camera },
                { type: "video", label: "Videos", icon: Play },
              ].map((docType) => {
                const existing = documents.filter(d => d.type === docType.type);
                return (
                  <div key={docType.type} style={{ padding: 16, borderRadius: 10, border: "1px solid var(--border)", backgroundColor: "var(--background)", textAlign: "center" }}>
                    <div style={{ marginBottom: 8, color: "var(--primary)" }}>{docType.icon({ size: 24 })}</div>
                    <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{docType.label}</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>{existing.length} file{existing.length !== 1 ? "s" : ""}</p>
                    <label style={{ cursor: "pointer" }}>
                      <input type="file" hidden onChange={(e) => handleDocUpload(e, docType.type)} accept={docType.type === "image" ? "image/*" : docType.type === "video" ? "video/*" : ".pdf,.doc,.docx" } />
                      <span style={{ fontSize: 12, color: "var(--primary)", fontWeight: 500 }}>+ Upload</span>
                    </label>
                  </div>
                );
              })}
            </div>

            {documents.length === 0 ? (
              <p style={{ fontSize: 14, color: "var(--text-muted)", textAlign: "center", padding: 16 }}>No documents uploaded yet.</p>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} style={s.docCard}>
                  <FileText size={20} color="var(--primary)" />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 500 }}>{doc.title}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {doc.fileName} {doc.fileSize ? `(${(doc.fileSize / 1024).toFixed(0)} KB)` : ""}
                    </p>
                  </div>
                  <Badge variant="default" style={{ fontSize: 10 }}>{doc.type.replace(/_/g, " ")}</Badge>
                  <button onClick={() => handleDeleteDoc(doc.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4, display: "flex" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
            {docUploading && <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center" }}>Uploading...</p>}
          </Section>

          <Section id="preview" title="Preview" icon={Eye}>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {[
                { id: "desktop", icon: Monitor, label: "Desktop" },
                { id: "tablet", icon: Tablet, label: "Tablet" },
                { id: "mobile", icon: Smartphone, label: "Mobile" },
              ].map((device) => (
                <button
                  key={device.id}
                  onClick={() => setPreviewDevice(device.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 14px", borderRadius: 100, fontSize: 13, fontWeight: 500,
                    border: "1px solid", cursor: "pointer",
                    borderColor: previewDevice === device.id ? "var(--primary)" : "var(--border)",
                    backgroundColor: previewDevice === device.id ? "var(--primary-light)" : "transparent",
                    color: previewDevice === device.id ? "var(--primary)" : "var(--text-secondary)",
                  }}
                >
                  <device.icon size={16} />
                  {device.label}
                </button>
              ))}
              <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                <Eye size={14} /> This is how franchisees will see your policy
              </span>
            </div>
            <div style={{
              ...s.previewFrame,
              maxWidth: previewDevice === "mobile" ? 375 : previewDevice === "tablet" ? 768 : "100%",
              margin: "0 auto",
            }}>
              {renderPreviewContent()}
            </div>
          </Section>

          <Section id="publish" title="Publish" icon={Globe}>
            <Card padding="32px" style={{ textAlign: "center" }}>
              <div style={{ marginBottom: 24 }}>
                {policy?.status === "published" ? (
                  <div style={{ color: "var(--success)" }}>
                    <BadgeCheck size={48} style={{ marginBottom: 12 }} />
                    <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Policy Published</h3>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 4 }}>
                      Version {policy.version} · Published {policy.publishedAt ? new Date(policy.publishedAt).toLocaleDateString() : ""}
                    </p>
                    <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                      {policy.acceptances?.length || 0} franchisee{policy.acceptances?.length !== 1 ? "s" : ""} have accepted these terms
                    </p>
                  </div>
                ) : policy?.status === "archived" ? (
                  <div>
                    <Archive size={48} style={{ marginBottom: 12, color: "var(--text-muted)" }} />
                    <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Policy Archived</h3>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>This policy is no longer active.</p>
                  </div>
                ) : (
                  <div>
                    <DraftingCompass size={48} style={{ marginBottom: 12, color: "var(--text-muted)" }} />
                    <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Draft Mode</h3>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 4 }}>
                      Your policy is in draft mode. Franchisees cannot see it yet.
                    </p>
                    <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                      Complete all sections ({progress}% done) then publish.
                    </p>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                {(!policy || policy.status === "draft") && (
                  <Button variant="primary" size="lg" icon={<Globe size={18} />} onClick={handlePublish} disabled={!policy?.id}>
                    Publish Policy
                  </Button>
                )}
                {policy?.status === "published" && (
                  <>
                    <Button variant="primary" size="lg" icon={<Globe size={18} />} onClick={handlePublish}>
                      Publish New Version
                    </Button>
                    <Button variant="secondary" size="lg" icon={<Archive size={18} />} onClick={handleArchive}>
                      Archive
                    </Button>
                  </>
                )}
                {policy?.status === "archived" && (
                  <Button variant="primary" size="lg" icon={<Globe size={18} />} onClick={handlePublish}>
                    Re-publish
                  </Button>
                )}
                {!policy?.id && (
                  <Button variant="primary" size="lg" icon={<Save size={18} />} onClick={handleSave} disabled={saving}>
                    Save & Continue
                  </Button>
                )}
              </div>
            </Card>
          </Section>
        </div>
      </div>

      <Modal isOpen={versionModal} onClose={() => setVersionModal(false)} title="Version History">
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 400, overflowY: "auto" }}>
          {versions.map((v, i) => (
            <div key={v.id} style={{ padding: 14, borderRadius: 10, border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>v{v.version}</span>
                <Badge variant={v.publishedAt ? "success" : "default"} style={{ fontSize: 10 }}>
                  {v.publishedAt ? "Published" : "Draft"}
                </Badge>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {v.description || ""} · {new Date(v.createdAt).toLocaleDateString()}
              </p>
              {v.publishedAt && (
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                  Published: {new Date(v.publishedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
          {versions.length === 0 && (
            <p style={{ fontSize: 14, color: "var(--text-muted)", textAlign: "center", padding: 24 }}>No versions yet.</p>
          )}
        </div>
      </Modal>
    </motion.div>
  );
}

function Section({ id, title, icon: Icon, children }) {
  return (
    <div id={`section-${id}`} style={s.section}>
      <div style={s.sectionCard}>
        <div style={s.sectionHeader}>
          <div style={s.sectionIcon}><Icon size={18} /></div>
          <h2 style={s.sectionTitle}>{title}</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function SectionPreview({ title, data }) {
  const items = data.filter(([, v]) => v);
  if (items.length === 0) return null;
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, paddingBottom: 8, borderBottom: "2px solid var(--primary)" }}>{title}</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {items.map(([label, value], i) => (
          <div key={i} style={{ padding: "6px 0" }}>
            <span style={{ fontWeight: 500, fontSize: 13, color: "var(--text-secondary)" }}>{label}: </span>
            <span style={{ fontSize: 13 }}>{String(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
