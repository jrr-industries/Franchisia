import { motion } from "framer-motion";
import { usePartners, usePublicSettings, getSectionContent } from "../hooks/useCMS";

export default function TrustedBrands() {
  const { data: partners } = usePartners();
  const { data: sectionSettings } = usePublicSettings();

  const hasPartners = partners?.length > 0;

  return (
    <section style={{ padding: '48px 0', borderTop: '1px solid var(--outline-variant)', borderBottom: '1px solid var(--outline-variant)', overflow: "hidden" }}>
      <div className="container">
        <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 32 }}>
          {getSectionContent(sectionSettings, 'trusted_brands', { heading: 'Verified Ecosystem Partners' }).heading}
        </motion.p>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ display: 'flex', justifyContent: 'center', gap: 48, alignItems: 'center', flexWrap: 'wrap' }}>
          {hasPartners ? partners.map((p, i) => (
            <motion.div key={p.id || i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05, opacity: 1 }}
            >
              {p.logo ? (
                <img src={p.logo} alt={p.name} style={{ height: 32, opacity: 0.6, filter: "grayscale(1)", transition: "all 0.3s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.filter = "grayscale(0)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.6"; e.currentTarget.style.filter = "grayscale(1)"; }}
                />
              ) : (
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--on-surface-variant)', opacity: 0.5, letterSpacing: 1 }}>
                  {p.name}
                </div>
              )}
            </motion.div>
          )) : (
            <div style={{ display: 'flex', gap: 48, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', opacity: 0.4 }}>
              {['Partner 1', 'Partner 2', 'Partner 3', 'Partner 4'].map((name, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  style={{ fontSize: 18, fontWeight: 700, color: 'var(--on-surface-variant)', letterSpacing: 1 }}
                >
                  {name}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
