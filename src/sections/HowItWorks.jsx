import { motion } from "framer-motion";
import { useHowItWorks, usePublicSettings, getSectionContent } from "../hooks/useCMS";
import { Loader2, UserPlus, FileText, Search, MessageSquareText, FileCheck, TrendingUp } from 'lucide-react';

const iconMap = { UserPlus, FileText, Search, MessageSquareText, FileCheck, TrendingUp };

export default function HowItWorks() {
  const { data: steps, isLoading } = useHowItWorks();
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

  const items = (steps || []).filter(s => s.isPublished !== false);

  if (!items.length) return null;

  const mid = Math.ceil(items.length / 2);
  const firstRow = items.slice(0, mid);
  const secondRow = items.slice(mid);

  return (
    <section style={{ padding: '80px 0', backgroundColor: 'var(--surface-container-lowest)' }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: 'var(--on-surface)' }}>{getSectionContent(sectionSettings, 'how_it_works', { heading: 'How It Works' }).heading}</h2>
          <p style={{ fontSize: 16, color: 'var(--on-surface-variant)', maxWidth: 600, margin: '0 auto' }}>
            {getSectionContent(sectionSettings, 'how_it_works', { description: 'Simple steps to find, connect, and grow in the franchise ecosystem.' }).description}
          </p>
        </motion.div>

        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {[firstRow, secondRow].map((row, rowIndex) => (
            <div key={rowIndex} className="how-it-works-row" style={{ display: 'flex', alignItems: 'flex-start', gap: 0, marginBottom: rowIndex === 0 ? 0 : 0, position: 'relative' }}>
              {row.map((s, i) => {
                const Icon = iconMap[s.icon] || iconMap[Object.keys(iconMap)[i % Object.keys(iconMap).length]];
                const globalIndex = rowIndex * mid + i;
                const isLast = i === row.length - 1;
                return (
                  <motion.div
                    key={s.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: globalIndex * 0.1 }}
                    whileHover={{ y: -4 }}
                    style={{ textAlign: 'center', position: 'relative', flex: 1, padding: '0 12px' }}
                  >
                    <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'var(--surface)', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', position: 'relative', boxShadow: '0 4px 12px rgba(0,74,198,0.1)' }}>
                      <Icon size={26} color="var(--primary)" />
                      <span style={{
                        position: 'absolute', top: -4, right: -4, width: 24, height: 24, borderRadius: '50%',
                        backgroundColor: 'var(--primary)', color: '#fff', fontSize: 11, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {String(globalIndex + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: 'var(--on-surface)' }}>{s.title}</h3>
                    <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', lineHeight: 1.6, maxWidth: 220, margin: '0 auto' }}>{s.description}</p>
                    {!isLast && (
                      <div className="step-arrow" style={{
                        position: 'absolute', right: -16, top: 32, fontSize: 20, color: 'var(--primary)', opacity: 0.4,
                      }}>
                        →
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>

        <style>{`
          @media (max-width: 768px) {
            .how-it-works-row { flex-direction: column !important; align-items: center !important; gap: 32px !important; margin-bottom: 32px !important; }
            .step-arrow { display: none !important; }
          }
        `}</style>
      </div>
    </section>
  );
}
