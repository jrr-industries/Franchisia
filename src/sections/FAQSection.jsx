import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: 'What is Franchisia?', a: 'Franchisia is the leading professional network for the franchise industry. We connect franchisors, franchisees, brokers, investors, and suppliers on one platform.' },
  { q: 'Is Franchisia free to use?', a: 'Yes! Our Starter plan is completely free. You can browse franchises, create a profile, and explore opportunities at no cost. Premium features are available with our Professional and Enterprise plans.' },
  { q: 'How do I find franchise opportunities?', a: 'Use our advanced search to filter by industry, location, investment range, and business type. You can also browse curated listings and get personalized recommendations.' },
  { q: 'Are the companies verified?', a: 'Yes, every company on Franchisia goes through a verification process to ensure legitimacy and authenticity.' },
  { q: 'Can I message franchisors directly?', a: 'Absolutely! Direct messaging is available for all users. Premium plans include unlimited messaging with additional features.' },
  { q: 'What makes Franchisia different?', a: 'Franchisia combines professional networking with franchise marketplace features, including CRM tools, analytics, investment calculators, and AI-powered matching.' },
];

export default function FAQSection() {
  const [open, setOpen] = useState(null);

  return (
    <section style={{ padding: '80px 0', backgroundColor: 'var(--surface)' }} id="faq">
      <div className="container" style={{ maxWidth: 700 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: 'var(--on-surface)' }}>Frequently Asked Questions</h2>
          <p style={{ fontSize: 16, color: 'var(--on-surface-variant)' }}>
            Got questions? We've got answers.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              style={{
                backgroundColor: 'var(--surface-container-low)',
                border: '1px solid var(--outline-variant)',
                borderRadius: 12,
                overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '18px 20px',
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--on-surface)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                {faq.q}
                <ChevronDown
                  size={18}
                  style={{
                    transition: 'transform 0.2s',
                    transform: open === i ? 'rotate(180deg)' : 'rotate(0)',
                    color: 'var(--on-surface-variant)',
                    flexShrink: 0,
                  }}
                />
              </button>
              {open === i && (
                <div style={{ padding: '0 20px 18px', fontSize: 14, color: 'var(--on-surface-variant)', lineHeight: 1.7 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
