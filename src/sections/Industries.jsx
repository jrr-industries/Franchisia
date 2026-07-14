import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useIndustries, usePublicSettings, getSectionContent } from "../hooks/useCMS";

export default function Industries() {
  const { data: industries, isLoading, isError } = useIndustries();
  const { data: sectionSettings } = usePublicSettings();

  if (isLoading) {
    return (
      <section style={{ padding: '80px 0', backgroundColor: 'var(--surface)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <Loader2 className="spin" size={32} color="var(--primary)" />
        </div>
      </section>
    );
  }

  if (isError || !industries || industries.length === 0) {
    return (
      <section style={{ padding: '80px 0', backgroundColor: 'var(--surface)' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: 'var(--on-surface)' }}>{getSectionContent(sectionSettings, 'industries', { heading: 'Explore by Industry' }).heading}</h2>
            <p style={{ fontSize: 16, color: 'var(--on-surface-variant)', maxWidth: 600, margin: '0 auto' }}>
              {getSectionContent(sectionSettings, 'industries', { description: 'Browse franchise opportunities across many thriving industries.' }).description}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
            {['Food & Beverage', 'Retail', 'Healthcare', 'Education', 'Technology', 'Automotive', 'Beauty', 'Hospitality', 'Logistics', 'Real Estate'].map((ind, i) => (
              <motion.div
                key={ind}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                style={{ padding: '10px 24px', fontSize: 13, fontWeight: 700, backgroundColor: 'var(--surface-container-low)', border: '1px dashed var(--outline-variant)', borderRadius: 100, color: 'var(--on-surface-variant)', letterSpacing: '0.02em', opacity: 0.5 }}
              >
                {ind}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: '80px 0', backgroundColor: 'var(--surface)' }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: 'var(--on-surface)' }}>{getSectionContent(sectionSettings, 'industries', { heading: 'Explore by Industry' }).heading}</h2>
          <p style={{ fontSize: 16, color: 'var(--on-surface-variant)', maxWidth: 600, margin: '0 auto' }}>
            {getSectionContent(sectionSettings, 'industries', { description: `Browse franchise opportunities across ${industries?.length || 10}+ thriving industries.` }).description}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
          {industries.map((ind, i) => (
            <motion.button
              key={ind}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ scale: 1.05, borderColor: 'var(--primary)', color: 'var(--primary)', backgroundColor: 'rgba(0,74,198,0.05)' }}
              style={{
                padding: '10px 24px',
                fontSize: 13,
                fontWeight: 700,
                backgroundColor: 'var(--surface-container-low)',
                border: '1px solid var(--outline-variant)',
                borderRadius: 100,
                color: 'var(--on-surface-variant)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                letterSpacing: '0.02em',
              }}
            >
              {ind}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
