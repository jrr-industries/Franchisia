import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Check, DollarSign, Scale, BookOpen, MapPin, Shield,
  HelpCircle, FileText, ChevronDown, ChevronRight, BadgeCheck,
  AlertCircle, Loader2, ExternalLink,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { useToast } from "../../components/ui/Toast";

const API = "/api";

const s = {
  page: { maxWidth: 900, margin: "0 auto", padding: "24px 0" },
  header: {
    textAlign: "center", marginBottom: 32, padding: "32px 24px",
    borderRadius: "var(--radius-lg)", background: "linear-gradient(135deg, var(--primary-light), var(--surface))",
    border: "1px solid var(--border)",
  },
  title: { fontSize: 26, fontWeight: 700, marginBottom: 8 },
  subtitle: { fontSize: 14, color: "var(--text-secondary)", maxWidth: 500, margin: "0 auto", lineHeight: 1.6 },
  metaRow: { display: "flex", justifyContent: "center", gap: 16, marginTop: 16, fontSize: 13, color: "var(--text-muted)" },
  section: {
    marginBottom: 24, scrollMarginTop: 80,
  },
  sectionCard: {
    padding: 24, borderRadius: "var(--radius-lg)",
    border: "1px solid var(--border)", backgroundColor: "var(--surface)",
  },
  sectionHeader: {
    display: "flex", alignItems: "center", gap: 10, marginBottom: 16,
    paddingBottom: 12, borderBottom: "1px solid var(--border)",
  },
  sectionIcon: {
    width: 32, height: 32, borderRadius: 8,
    display: "flex", alignItems: "center", justifyContent: "center",
    backgroundColor: "var(--primary-light)", color: "var(--primary)",
  },
  sectionTitle: { fontSize: 16, fontWeight: 600 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  fieldRow: {
    display: "flex", justifyContent: "space-between", padding: "8px 12px",
    borderRadius: 8, backgroundColor: "var(--background)", gap: 12,
  },
  fieldLabel: { fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 },
  fieldValue: { fontSize: 13, fontWeight: 500, textAlign: "right", flex: 1 },
  faqItem: {
    padding: 16, borderRadius: 10, border: "1px solid var(--border)",
    marginBottom: 10, backgroundColor: "var(--background)",
  },
  docItem: {
    display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
    borderRadius: 10, border: "1px solid var(--border)", marginBottom: 8,
    backgroundColor: "var(--background)", cursor: "pointer",
    transition: "all 0.15s",
  },
  acceptBox: {
    marginTop: 32, padding: 24, borderRadius: "var(--radius-lg)",
    border: "2px solid var(--primary)", backgroundColor: "var(--primary-light)",
    textAlign: "center",
  },
};

function FieldRow({ label, value }) {
  if (!value) return null;
  return (
    <div style={s.fieldRow}>
      <span style={s.fieldLabel}>{label}</span>
      <span style={s.fieldValue}>{String(value)}</span>
    </div>
  );
}

export default function CompanyPoliciesView({ companyId, listingId, onAccept, accepted }) {
  const { addToast } = useToast();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [checked, setChecked] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [activeSection, setActiveSection] = useState("eligibility");

  const fetchPolicy = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/policies/company/${companyId}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setPolicy(data.policy);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { fetchPolicy(); }, [fetchPolicy]);

  const handleAccept = async () => {
    if (!policy?.id) return;
    setAccepting(true);
    try {
      const res = await fetch(`${API}/policies/${policy.id}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ listingId }),
      });
      if (res.ok) {
        const data = await res.json();
        onAccept?.(data);
        addToast("Terms accepted!", "success");
      } else {
        const err = await res.json();
        addToast(err.error || "Failed to accept", "error");
      }
    } catch {
      addToast("Network error", "error");
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
        <Loader2 size={28} className="spin" color="var(--primary)" />
      </div>
    );
  }

  if (!policy) {
    return (
      <div style={{ textAlign: "center", padding: 60 }}>
        <AlertCircle size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Policies Not Available</h3>
        <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
          The company has not published their franchise policies yet.
        </p>
      </div>
    );
  }

  const p = policy;
  const sections = [
    {
      id: "eligibility", icon: Check, title: "Eligibility Requirements",
      fields: [
        ["Minimum Age", p.minimumAge],
        ["Minimum Education", p.minimumEducation],
        ["Business Experience Required", p.businessExperienceRequired],
        ["Net Worth Required", p.netWorthRequired],
        ["Commercial Space Required", p.commercialSpaceRequired ? "Yes" : null],
        ["Business Registration Required", p.businessRegistrationRequired ? "Yes" : null],
        ["GST Required", p.gstRequired ? "Yes" : null],
        ["Local License Required", p.localLicenseRequired ? "Yes" : null],
        ["Additional Requirements", p.additionalRequirements],
      ],
    },
    {
      id: "investment", icon: DollarSign, title: "Investment",
      fields: [
        ["Minimum Investment", p.minimumInvestment],
        ["Maximum Investment", p.maximumInvestment],
        ["Franchise Fee", p.franchiseFee],
        ["Royalty Fee", p.royaltyFee],
        ["Marketing Fee", p.marketingFee],
        ["Working Capital", p.workingCapital],
        ["Security Deposit", p.securityDeposit],
        ["Expected ROI", p.expectedROI],
        ["Break Even Period", p.breakEvenPeriod],
      ],
    },
    {
      id: "agreement", icon: Scale, title: "Agreement",
      fields: [
        ["Agreement Duration", p.agreementDuration],
        ["Renewal Available", p.renewalAvailable ? "Yes" : null],
        ["Termination Conditions", p.terminationConditions],
        ["Exit Policy", p.exitPolicy],
        ["Transfer Policy", p.transferPolicy],
        ["Renewal Charges", p.renewalCharges],
      ],
    },
    {
      id: "support", icon: BookOpen, title: "Training & Support",
      fields: [
        ["Initial Training", p.initialTraining],
        ["On-site Support", p.onSiteSupport],
        ["Marketing Support", p.marketingSupport],
        ["Technology Support", p.technologySupport],
        ["Operations Manual", p.operationsManual],
        ["Store Setup Support", p.storeSetupSupport],
        ["Hiring Support", p.hiringSupport],
        ["Supply Chain Support", p.supplyChainSupport],
      ],
    },
    {
      id: "territory", icon: MapPin, title: "Territory",
      fields: [
        ["Exclusive Territory", p.exclusiveTerritory ? "Yes" : null],
        ["Non-Exclusive Territory", p.nonExclusiveTerritory ? "Yes" : null],
        ["Expansion Plans", p.expansionPlans],
        ["Target Cities", p.targetCities?.join(", ")],
        ["Target States", p.targetStates?.join(", ")],
        ["Target Countries", p.targetCountries?.join(", ")],
      ],
    },
    {
      id: "legal", icon: Shield, title: "Legal Policies",
      fields: [
        ["Refund Policy", p.refundPolicy],
        ["Cancellation Policy", p.cancellationPolicy],
        ["Brand Guidelines", p.brandGuidelines],
        ["Trademark Rules", p.trademarkRules],
        ["Confidentiality Agreement", p.confidentialityAgreement],
        ["Code of Conduct", p.codeOfConduct],
      ],
    },
  ];

  const tocSections = [
    ...sections,
    ...(p.faqs?.length ? [{ id: "faqs", icon: HelpCircle, title: "FAQs" }] : []),
    ...(p.documents?.length ? [{ id: "documents", icon: FileText, title: "Documents" }] : []),
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={s.page}>
      <div style={s.header}>
        <BadgeCheck size={40} color="var(--primary)" style={{ marginBottom: 12 }} />
        <h1 style={s.title}>Franchise Policies & Terms</h1>
        <p style={s.subtitle}>
          Please review the company's franchise policies, requirements, and terms before applying.
          Make sure you understand all conditions.
        </p>
        <div style={s.metaRow}>
          <span>Version {p.version}</span>
          <span>·</span>
          <span>Updated {new Date(p.updatedAt).toLocaleDateString()}</span>
          {p.status === "published" && <Badge variant="success" style={{ fontSize: 10 }}>Active</Badge>}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
        {tocSections.map((sec) => {
          const Icon = sec.icon;
          return (
            <button
              key={sec.id}
              onClick={() => {
                setActiveSection(sec.id);
                document.getElementById(`view-section-${sec.id}`)?.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 14px", borderRadius: 100, fontSize: 13, fontWeight: 500,
                border: "1px solid", cursor: "pointer",
                borderColor: activeSection === sec.id ? "var(--primary)" : "var(--border)",
                backgroundColor: activeSection === sec.id ? "var(--primary-light)" : "transparent",
                color: activeSection === sec.id ? "var(--primary)" : "var(--text-secondary)",
                transition: "all 0.15s",
              }}
            >
              <Icon size={14} />
              {sec.title}
            </button>
          );
        })}
      </div>

      {sections.map((sec) => {
        const Icon = sec.icon;
        const validFields = sec.fields.filter(([, v]) => v);
        if (validFields.length === 0 && sec.id !== "support") return null;

        return (
          <div key={sec.id} id={`view-section-${sec.id}`} style={s.section}>
            <Card padding="24px">
              <div style={s.sectionHeader}>
                <div style={s.sectionIcon}><Icon size={16} /></div>
                <h2 style={s.sectionTitle}>{sec.title}</h2>
              </div>
              {validFields.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={s.grid2}>
                    {validFields.map(([label, value], i) => (
                      <FieldRow key={i} label={label} value={value} />
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: 16 }}>
                  No information provided for this section.
                </p>
              )}
            </Card>
          </div>
        );
      })}

      {p.faqs?.length > 0 && (
        <div id="view-section-faqs" style={s.section}>
          <Card padding="24px">
            <div style={s.sectionHeader}>
              <div style={s.sectionIcon}><HelpCircle size={16} /></div>
              <h2 style={s.sectionTitle}>Frequently Asked Questions</h2>
            </div>
            {p.faqs.map((faq) => (
              <div key={faq.id} style={s.faqItem}>
                <div
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                >
                  <span style={{ fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                    <HelpCircle size={16} color="var(--primary)" />
                    {faq.question}
                  </span>
                  {expandedFaq === faq.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
                {expandedFaq === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    style={{ marginTop: 12, paddingLeft: 24 }}
                  >
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{faq.answer}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </Card>
        </div>
      )}

      {p.documents?.length > 0 && (
        <div id="view-section-documents" style={s.section}>
          <Card padding="24px">
            <div style={s.sectionHeader}>
              <div style={s.sectionIcon}><FileText size={16} /></div>
              <h2 style={s.sectionTitle}>Documents</h2>
            </div>
            {p.documents.filter(d => !d.isHidden).map((doc) => (
              <a
                key={doc.id}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div style={s.docItem}>
                  <FileText size={20} color="var(--primary)" />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 500 }}>{doc.title}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{doc.type.replace(/_/g, " ")}</p>
                  </div>
                  <ExternalLink size={16} color="var(--text-muted)" />
                </div>
              </a>
            ))}
          </Card>
        </div>
      )}

      {onAccept && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={s.acceptBox}
        >
          {accepted ? (
            <div>
              <BadgeCheck size={40} color="var(--success)" style={{ marginBottom: 12 }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--success)", marginBottom: 4 }}>Terms Accepted</h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                You accepted version {accepted.policyVersion} on {new Date(accepted.acceptedAt).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Accept Terms & Conditions</h3>
              <label
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  cursor: "pointer", marginBottom: 16, fontSize: 14,
                }}
              >
                <div
                  onClick={() => setChecked(!checked)}
                  style={{
                    width: 20, height: 20, borderRadius: 4, border: "2px solid",
                    borderColor: checked ? "var(--primary)" : "var(--border)",
                    backgroundColor: checked ? "var(--primary)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, transition: "all 0.15s", cursor: "pointer",
                  }}
                >
                  {checked && <Check size={14} color="#fff" />}
                </div>
                <span>
                  I have read and agree to the company's Franchise Terms & Conditions.
                </span>
              </label>
              <Button
                variant="primary"
                size="lg"
                icon={<BadgeCheck size={18} />}
                onClick={handleAccept}
                disabled={!checked || accepting}
              >
                {accepting ? "Accepting..." : "Continue Application"}
              </Button>
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
