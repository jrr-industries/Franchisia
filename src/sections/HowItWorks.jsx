import { motion } from "framer-motion";
import { UserPlus, FileText, Search, MessageSquareText, FileCheck, TrendingUp } from 'lucide-react';

const steps = [
  { title: "Create Your Account", description: "Sign up and join India's fastest-growing franchise ecosystem.", icon: UserPlus },
  { title: "Build Your Profile", description: "Showcase your experience, preferences, and investment capacity.", icon: FileText },
  { title: "Discover Opportunities", description: "Browse and compare franchise opportunities across industries and locations.", icon: Search },
  { title: "Connect with Professionals", description: "Network with franchisors, investors, consultants, and peers.", icon: MessageSquareText },
  { title: "Apply or Recruit", description: "Submit applications or review candidates directly on the platform.", icon: FileCheck },
  { title: "Grow Together", description: "Build lasting relationships and scale your franchise journey.", icon: TrendingUp },
];

export default function HowItWorks() {
  const mid = Math.ceil(steps.length / 2);
  const firstRow = steps.slice(0, mid);
  const secondRow = steps.slice(mid);

  return (
    <section style={{ padding: '80px 0', backgroundColor: 'var(--surface-container-lowest)' }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: 'var(--on-surface)' }}>How It Works</h2>
          <p style={{ fontSize: 16, color: 'var(--on-surface-variant)', maxWidth: 600, margin: '0 auto' }}>
            Six simple steps to find, connect, and grow in the franchise ecosystem.
          </p>
        </motion.div>

        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {[firstRow, secondRow].map((row, rowIndex) => (
            <div key={rowIndex} className="how-it-works-row" style={{ display: 'flex', alignItems: 'flex-start', gap: 0, marginBottom: rowIndex === 0 ? 0 : 0, position: 'relative' }}>
              {row.map((s, i) => {
                const Icon = s.icon;
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
