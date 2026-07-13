import { useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { useFAQ } from "../hooks/useCMS";

export default function FAQSection() {
  const [open, setOpen] = useState(null);
  const { data: faqs, isLoading, isError } = useFAQ();

  if (isLoading) {
    return (
      <section style={{ padding: "80px 0", backgroundColor: "var(--surface)" }} id="faq">
        <div className="container" style={{ maxWidth: 700, display: "flex", justifyContent: "center" }}>
          <Loader2 size={32} className="spin" color="var(--primary)" />
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section style={{ padding: "80px 0", backgroundColor: "var(--surface)" }} id="faq">
        <div className="container" style={{ maxWidth: 700, textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "var(--danger)" }}>Failed to load FAQ.</p>
        </div>
      </section>
    );
  }

  if (!faqs?.length) return null;

  return (
    <section style={{ padding: "80px 0", backgroundColor: "var(--surface)" }} id="faq">
      <div className="container" style={{ maxWidth: 700 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: "var(--on-surface)" }}>Frequently Asked Questions</h2>
          <p style={{ fontSize: 16, color: "var(--on-surface-variant)" }}>
            Got questions? We've got answers.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {faqs.map((faq, i) => (
            <div
              key={faq.id || i}
              style={{
                padding: "16px 20px", borderRadius: 12,
                border: "1px solid var(--outline-variant)",
                backgroundColor: "var(--surface)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onClick={() => setOpen(open === (faq.id || i) ? null : (faq.id || i))}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--outline-variant)"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <span style={{ fontWeight: 600, fontSize: 15, color: "var(--on-surface)" }}>{faq.question}</span>
                <ChevronDown
                  size={18}
                  color="var(--on-surface-variant)"
                  style={{
                    transition: "transform 0.2s",
                    transform: open === (faq.id || i) ? "rotate(180deg)" : "rotate(0deg)",
                    flexShrink: 0,
                  }}
                />
              </div>
              {open === (faq.id || i) && (
                <p style={{ marginTop: 16, fontSize: 14, color: "var(--on-surface-variant)", lineHeight: 1.7 }}>
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
