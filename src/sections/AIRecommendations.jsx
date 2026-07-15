import { motion } from "framer-motion";
import { Sparkles, Bell, Loader2, Brain, TrendingUp, Star } from "lucide-react";
import { useAISection, usePublicSettings, getSectionContent } from "../hooks/useCMS";

const iconMap = { Brain, TrendingUp, Star, Bell, Sparkles };

export default function AIRecommendations() {
  const { data: section, isLoading } = useAISection();
  const { data: sectionSettings } = usePublicSettings();

  if (isLoading) {
    return (
      <section style={{ padding: "80px 0", backgroundColor: "var(--surface-container-lowest)" }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
          <Loader2 size={32} className="spin" color="var(--primary)" />
        </div>
      </section>
    );
  }

  if (!section?.isActive || !section?.title) return null;

  const features = Array.isArray(section.features) ? section.features : [];

  return (
    <section style={{ padding: "80px 0", backgroundColor: "var(--surface-container-lowest)" }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: "var(--on-surface)" }}>{section.title}</h2>
          <p style={{ fontSize: 16, color: "var(--on-surface-variant)", maxWidth: 600, margin: "0 auto" }}>
            {section.subtitle || section.description || getSectionContent(sectionSettings, 'ai', { description: 'Receive personalized recommendations based on your interests and investment goals.' }).description}
          </p>
        </motion.div>

        {features.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, maxWidth: 900, margin: "0 auto 40px" }}>
            {features.map((f, i) => {
              const IconComponent = iconMap[f.icon] || Sparkles;
              return (
                <motion.div
                  key={f.title || i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                  style={{
                    padding: 24,
                    backgroundColor: "var(--surface)",
                    border: "1px solid var(--outline-variant)",
                    borderRadius: 12,
                    textAlign: "center",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--outline-variant)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <IconComponent size={32} color="var(--primary)" style={{ marginBottom: 16 }} />
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--on-surface)", marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: "var(--on-surface-variant)", lineHeight: 1.5 }}>{f.description}</p>
                </motion.div>
              );
            })}
          </div>
        )}

        {section.buttonText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            style={{ textAlign: "center" }}
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { if (section.buttonUrl) window.location.href = section.buttonUrl; }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "14px 32px",
                borderRadius: 10,
                border: "none",
                backgroundColor: "var(--primary)",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                transition: "box-shadow 0.2s",
              }}
            >
              <Bell size={18} />
              {section.buttonText}
            </motion.button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
