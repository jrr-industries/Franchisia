import { motion } from "framer-motion";
import { Map, MapPin, Navigation, Globe, Compass } from "lucide-react";

const badges = [
  { icon: MapPin, label: "Nearby Branches", desc: "Find branches close to you" },
  { icon: Navigation, label: "Company Locations", desc: "Explore company presence" },
  { icon: Globe, label: "Available Territories", desc: "Discover open territories" },
  { icon: Compass, label: "Future Expansion", desc: "Ready for growth" },
];

export default function InteractiveMap() {
  return (
    <section style={{ padding: "80px 0", backgroundColor: "var(--surface-container-lowest)" }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: "var(--on-surface)" }}>Discover Opportunities Near You</h2>
          <p style={{ fontSize: 16, color: "var(--on-surface-variant)", maxWidth: 600, margin: "0 auto" }}>
            Explore nearby branches, expansion territories and franchise opportunities.
          </p>
        </motion.div>

        <div style={{ position: "relative", maxWidth: 800, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              position: "relative",
              borderRadius: 16,
              border: "1px solid var(--outline-variant)",
              overflow: "hidden",
              backgroundColor: "var(--surface)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
            }}
          >
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{ padding: 48, textAlign: "center" }}
            >
              <div style={{
                position: "relative",
                width: "100%",
                aspectRatio: "16/9",
                borderRadius: 12,
                background: "radial-gradient(ellipse at 50% 50%, rgba(0,74,198,0.08), transparent 70%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}>
                <Map size={120} color="var(--outline-variant)" style={{ opacity: 0.3 }} />
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "radial-gradient(circle at 30% 40%, rgba(0,74,198,0.06), transparent 50%), radial-gradient(circle at 70% 60%, rgba(0,74,198,0.04), transparent 50%)",
                }} />
                <div style={{
                  position: "absolute",
                  bottom: 24,
                  left: "50%",
                  transform: "translateX(-50%)",
                  backgroundColor: "var(--surface)",
                  padding: "8px 20px",
                  borderRadius: 20,
                  border: "1px solid var(--outline-variant)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--on-surface-variant)",
                }}>
                  <Globe size={16} color="var(--primary)" />
                  Interactive Map — Coming Soon
                </div>
              </div>
            </motion.div>
          </motion.div>

          <div className="map-badges" style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            marginTop: 24,
          }}>
            {badges.map((badge, i) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                style={{
                  padding: 20,
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--outline-variant)",
                  borderRadius: 12,
                  textAlign: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--outline-variant)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <badge.icon size={24} color="var(--primary)" style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--on-surface)", marginBottom: 2 }}>{badge.label}</div>
                <div style={{ fontSize: 11, color: "var(--on-surface-variant)" }}>{badge.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .map-badges { grid-template-columns: repeat(2, 1fr) !important; }
          }
          @media (max-width: 480px) {
            .map-badges { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </section>
  );
}
