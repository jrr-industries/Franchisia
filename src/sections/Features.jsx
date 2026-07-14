import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";

const defaultIcon = "HelpCircle";

const features = [
  { icon: "BrainCircuit", title: "AI Matching", description: "Smart algorithms connect you with franchise opportunities that match your profile, preferences, and investment capacity." },
  { icon: "ShieldCheck", title: "Verified Listings", description: "Every franchise opportunity is thoroughly vetted to ensure authenticity, transparency, and quality standards." },
  { icon: "BarChart3", title: "Market Analytics", description: "Real-time data and insights help you evaluate market trends, competitor landscapes, and growth potential." },
  { icon: "MessageSquareShare", title: "Direct Connect", description: "Seamlessly communicate with franchisors, schedule meetings, and manage your entire franchise journey in one place." },
];

export default function Features() {
  return (
    <section style={{ padding: '80px 0', backgroundColor: 'var(--surface-container-lowest)' }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: 'var(--on-surface)' }}>Platform Infrastructure</h2>
          <p style={{ fontSize: 16, color: 'var(--on-surface-variant)', maxWidth: 600, margin: '0 auto' }}>
            Powerful tools to find, evaluate, and connect with franchise opportunities.
          </p>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {features.map((f, i) => {
            const IconComponent = LucideIcons[f.icon] || LucideIcons[defaultIcon];
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                style={{
                  padding: 24,
                  backgroundColor: i === 0 ? 'rgba(0,74,198,0.04)' : 'var(--surface)',
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
                  {i === 0 && (
                    <span style={{ display: 'inline-block', marginTop: 8, padding: '2px 8px', fontSize: 11, fontWeight: 700, backgroundColor: '#fef3c7', color: '#b45309', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.05em' }}>New</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
