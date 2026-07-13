import { useState, useEffect } from "react";
import { Star, Loader2 } from "lucide-react";
import Avatar from "../components/ui/Avatar";

const defaultTestimonials = [
  { name: "Rajesh Kumar", role: "Franchise Owner", text: "Franchisia helped me find the perfect franchise opportunity. The platform made it easy to connect with franchisors.", rating: 5 },
  { name: "Priya Sharma", role: "Investor", text: "The verification process gave me confidence in the listings. Found my best investment through Franchisia.", rating: 5 },
  { name: "Amit Patel", role: "Business Consultant", text: "An excellent platform for franchise professionals. The networking features are world-class.", rating: 4 },
];

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState(defaultTestimonials);

  useEffect(() => {
    fetch("/api/public/testimonials", { credentials: "include" })
      .then((r) => { if (r.ok) return r.json(); throw new Error(); })
      .then((data) => {
        if (data.items?.length) {
          setTestimonials(data.items.map((t) => ({ ...t, text: t.review || t.text })));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section style={{ padding: "80px 0", backgroundColor: "var(--surface-container-lowest)" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: "var(--on-surface)" }}>What Our Users Say</h2>
          <p style={{ fontSize: 16, color: "var(--on-surface-variant)", maxWidth: 600, margin: "0 auto" }}>
            Join thousands of professionals who have found success on Franchisia.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {testimonials.map((t, i) => (
            <div key={i} style={{ padding: 24, backgroundColor: "var(--surface)", border: "1px solid var(--outline-variant)", borderRadius: 12, transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--outline-variant)"; }}
            >
              <div style={{ display: "flex", gap: 2, marginBottom: 12 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} fill={i < (t.rating || 5) ? "#F59E0B" : "none"} color={i < (t.rating || 5) ? "#F59E0B" : "var(--outline-variant)"} />
                ))}
              </div>
              <p style={{ fontSize: 14, color: "var(--on-surface-variant)", lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>"{t.text}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar name={t.name} size={36} />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--on-surface)" }}>{t.name}</p>
                  <p style={{ fontSize: 12, color: "var(--on-surface-variant)" }}>{t.role || t.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
