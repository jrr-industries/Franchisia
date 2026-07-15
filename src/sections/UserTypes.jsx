import { Link } from 'react-router-dom';
import { motion } from "framer-motion";
import { ArrowRight, Store, Users, TrendingUp, Briefcase, Package, Loader2 } from 'lucide-react';
import { useUserTypes, usePublicSettings, getSectionContent } from "../hooks/useCMS";

const iconMap = { Store, Users, TrendingUp, Briefcase, Package };

export default function UserTypes() {
  const { data: types, isLoading } = useUserTypes();
  const { data: sectionSettings } = usePublicSettings();

  if (isLoading) {
    return (
      <section style={{ padding: '80px 0', backgroundColor: 'var(--surface)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
          <Loader2 size={32} className="spin" color="var(--primary)" />
        </div>
      </section>
    );
  }

  const items = (types || []).filter(t => t.isPublished !== false);

  if (!items.length) return null;

  return (
    <section style={{ padding: '80px 0', backgroundColor: 'var(--surface)' }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: 'var(--on-surface)' }}>{getSectionContent(sectionSettings, 'user_types', { heading: 'Built for Every Stakeholder' }).heading}</h2>
          <p style={{ fontSize: 16, color: 'var(--on-surface-variant)', maxWidth: 600, margin: '0 auto' }}>
            {getSectionContent(sectionSettings, 'user_types', { description: 'Specialized tools and experiences designed for every role in the franchise ecosystem.' }).description}
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {items.map((type, i) => {
            const Icon = iconMap[type.icon] || Store;
            return (
              <motion.div
                                key={type.id || type.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                style={{
                  padding: 24,
                  border: '1px solid var(--outline-variant)',
                  borderRadius: 12,
                  backgroundColor: 'var(--surface)',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                }}

  
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    backgroundColor: 'rgba(0,74,198,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <Icon size={22} color="var(--primary)" />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--on-surface)' }}>{type.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', lineHeight: 1.6, marginBottom: 16 }}>{type.description}</p>
                <Link to="/signup" style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none', transition: 'gap 0.2s' }} className="user-type-link">
                  Learn More <ArrowRight size={14} />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      <style>{`
        .user-type-link:hover { gap: 8px !important; }
      `}</style>
    </section>
  );
}
