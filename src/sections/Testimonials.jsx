import { motion } from "framer-motion";
import { Star, Loader2 } from "lucide-react";
import { useTestimonials, usePublicSettings, getSectionContent } from "../hooks/useCMS";
import Avatar from "../components/ui/Avatar";

export default function Testimonials() {
  const { data: testimonials, isLoading, isError } = useTestimonials();
  const { data: sectionSettings } = usePublicSettings();

  if (isLoading || isError || !testimonials?.length) return null;

  return (
    <section style={{ padding: "80px 0", backgroundColor: "var(--surface-container-lowest)" }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: "var(--on-surface)" }}>{getSectionContent(sectionSettings, 'testimonials', { heading: 'Success Stories' }).heading}</h2>
          <p style={{ fontSize: 16, color: "var(--on-surface-variant)", maxWidth: 600, margin: "0 auto" }}>
            {getSectionContent(sectionSettings, 'testimonials', { description: 'Hear from professionals growing with Franchisia.' }).description}
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id || i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              style={{ padding: 24, backgroundColor: "var(--surface)", border: "1px solid var(--outline-variant)", borderRadius: 12, transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--outline-variant)"; }}
            >
              <div style={{ display: "flex", gap: 2, marginBottom: 12 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} fill={i < (t.rating || 5) ? "#F59E0B" : "none"} color={i < (t.rating || 5) ? "#F59E0B" : "var(--outline-variant)"} />
                ))}
              </div>
              <p style={{ fontSize: 14, color: "var(--on-surface-variant)", lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>"{t.review || t.text}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar name={t.name} src={t.photo} size={36} />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--on-surface)" }}>{t.name}</p>
                  <p style={{ fontSize: 12, color: "var(--on-surface-variant)" }}>{t.role || t.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
