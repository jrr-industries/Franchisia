import { motion } from "framer-motion";
import { Map, MapPin, Navigation, Globe, Compass, Loader2 } from "lucide-react";
import { useMapLocation, usePublicSettings, getSectionContent } from "../hooks/useCMS";

export default function InteractiveMap() {
  const { data: mapSettings, isLoading } = useMapLocation();
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

  if (!mapSettings?.isActive) return null;

  const title = mapSettings.title || getSectionContent(sectionSettings, 'map', { heading: 'Discover Opportunities Near You' }).heading;
  const subtitle = mapSettings.subtitle || getSectionContent(sectionSettings, 'map', { description: 'Explore nearby branches, expansion territories and franchise opportunities.' }).description;

  return (
    <section style={{ padding: "80px 0", backgroundColor: "var(--surface-container-lowest)" }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: "var(--on-surface)" }}>{title}</h2>
          <p style={{ fontSize: 16, color: "var(--on-surface-variant)", maxWidth: 600, margin: "0 auto" }}>
            {subtitle}
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
              </div>
            </motion.div>
          </motion.div>

          <div className="map-badges" style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            marginTop: 24,
          }}>
            {mapSettings.enableMap !== false && (
              <MapBadge icon={MapPin} label="Nearby Branches" desc="Find branches close to you" />
            )}
            {mapSettings.enableNearbyBranches !== false && (
              <MapBadge icon={Navigation} label="Company Locations" desc="Explore company presence" />
            )}
            {mapSettings.enableTerritories && (
              <MapBadge icon={Globe} label="Available Territories" desc="Discover open territories" />
            )}
            <MapBadge icon={Compass} label="Future Expansion" desc="Ready for growth" />
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

function MapBadge({ icon: Icon, label, desc }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
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
      <Icon size={24} color="var(--primary)" style={{ marginBottom: 8 }} />
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--on-surface)", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 11, color: "var(--on-surface-variant)" }}>{desc}</div>
    </motion.div>
  );
}
