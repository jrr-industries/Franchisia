import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const defaultFaqs = [
  { question: "What is Franchisia?", answer: "Franchisia is the leading professional network for the franchise industry. We connect franchisors, franchisees, brokers, investors, and suppliers on one platform." },
  { question: "Is Franchisia free to use?", answer: "Yes! Our Starter plan is completely free. You can browse franchises, create a profile, and explore opportunities at no cost." },
  { question: "How do I find franchise opportunities?", answer: "Use our advanced search to filter by industry, location, investment range, and business type." },
  { question: "Are the companies verified?", answer: "Yes, every company on Franchisia goes through a verification process to ensure legitimacy and authenticity." },
  { question: "What makes Franchisia different?", answer: "Franchisia combines professional networking with franchise marketplace features, including CRM tools, analytics, and AI-powered matching." },
];

export default function FAQSection() {
  const [open, setOpen] = useState(null);
  const [faqs, setFaqs] = useState(defaultFaqs);

  useEffect(() => {
    fetch("/api/public/faq", { credentials: "include" })
      .then((r) => { if (r.ok) return r.json(); throw new Error(); })
      .then((data) => {
        if (data.items?.length) setFaqs(data.items);
      })
      .catch(() => {});
  }, []);

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
