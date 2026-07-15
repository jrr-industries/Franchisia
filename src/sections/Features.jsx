import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { useFeatures, usePublicSettings, getSectionContent } from "../hooks/useCMS";
import { Loader2 } from "lucide-react";

const defaultIcon = "HelpCircle";

export default function Features() {
  const { data: features, isLoading, isError } = useFeatures();
  const { data: sectionSettings } = usePublicSettings();

  if (isLoading) {
    return (
      <section style={{ padding: '80px 0', backgroundColor: 'var(--surface-container-lowest)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
          <Loader2 size={32} className="spin" color="var(--primary)" />
        </div>
      </section>
    );
  }

  const items = (features || []).filter(f => f.isPublished !== false);

  if (!items.length && !isError) return null;

  return (
    <section style={{ padding: '80px 0', backgroundColor: 'var(--surface-container-lowest)' }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: 'var(--on-surface)' }}>{getSectionContent(sectionSettings, 'features', { heading: 'Why Choose Franchisia?' }).heading}</h2>
          <p style={{ fontSize: 16, color: 'var(--on-surface-variant)', maxWidth: 600, margin: '0 auto' }}>
            {getSectionContent(sectionSettings, 'features', { description: 'Everything you need to discover, evaluate, and secure the perfect franchise opportunity.' }).description}
          </p>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {items.map((f, i) => {
            const IconComponent = LucideIcons[f.icon] || LucideIcons[defaultIcon];
            return (
              <motion.div
                key={f.id || f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                style={{
                  padding: 24,
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--outline-variant)',
                  borderRadius: 12,
                  transition: 'all 0.2s',
                  display: 'flex',
                  gap: 16,
                  alignItems: 'flex-start',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--outline-variant)'; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconComponent size={20} color="var(--primary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: 'var(--on-surface)' }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>{f.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
