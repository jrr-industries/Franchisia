import { motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import { usePartners, usePublicSettings, getSectionContent } from "../hooks/useCMS";

export default function TrustedBrands() {
  const { data: partners } = usePartners();
  const { data: sectionSettings } = usePublicSettings();

  const hasPartners = partners?.length > 0;

  return (
    <section style={{ padding: '64px 0', borderTop: '1px solid var(--outline-variant)', borderBottom: '1px solid var(--outline-variant)', overflow: "hidden" }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: 'var(--on-surface)' }}>
            {getSectionContent(sectionSettings, 'global_network', { heading: 'One Platform. Endless Franchise Opportunities.' }).heading}
          </h2>
          <p style={{ fontSize: 16, color: 'var(--on-surface-variant)', maxWidth: 600, margin: '0 auto' }}>
            {getSectionContent(sectionSettings, 'global_network', { description: 'Connect with leading brands, investors, consultants, suppliers and entrepreneurs worldwide.' }).description}
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ display: 'flex', justifyContent: 'center', gap: 48, alignItems: 'center', flexWrap: 'wrap' }}>
          {hasPartners ? partners.map((p, i) => (
            <motion.div key={p.id || i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05, opacity: 1 }}
            >
              {p.logo ? (
                <img src={p.logo} alt={p.name} style={{ height: 36, opacity: 0.6, filter: "grayscale(1)", transition: "all 0.3s" }}
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
            <div style={{ display: 'flex', gap: 48, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', opacity: 0.5 }}>
              {['Franchise India', 'Brand Expand', 'Franchise Bazar', 'Global Franchise', 'Franchise Ready'].map((name, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  style={{ fontSize: 18, fontWeight: 700, color: 'var(--on-surface-variant)', letterSpacing: 1 }}
                >
                  {name}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
        {hasPartners && (
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--on-surface-variant)' }}>
            <BadgeCheck size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} color="var(--primary)" />
            {partners.filter(p => p.isVerified).length || partners.length} verified companies on the network
          </motion.p>
        )}
      </div>
    </section>
  );
}
