import { motion } from "framer-motion";
import { UserPlus, Search, MessageSquareText, Handshake } from 'lucide-react';

const steps = [
  { title: "Create Account", description: "Sign up and set up your profile to get started with personalized franchise recommendations.", icon: UserPlus },
  { title: "Discover Brands", description: "Browse and compare franchise opportunities across industries, investment levels, and locations.", icon: Search },
  { title: "Connect & Evaluate", description: "Reach out to franchisors, schedule meetings, and evaluate opportunities with confidence.", icon: MessageSquareText },
  { title: "Secure Your Future", description: "Finalize agreements, access resources, and launch your franchise journey successfully.", icon: Handshake },
];

export default function HowItWorks() {
  return (
    <section style={{ padding: '80px 0', backgroundColor: 'var(--surface)' }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: 'var(--on-surface)' }}>How It Works</h2>
          <p style={{ fontSize: 16, color: 'var(--on-surface-variant)', maxWidth: 600, margin: '0 auto' }}>
            Four simple steps to find and secure your franchise opportunity.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32, position: 'relative' }}>
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', position: 'relative' }}>
                  <Icon size={26} color="var(--primary)" />
                  <span style={{ position: 'absolute', top: -2, right: -2, width: 24, height: 24, borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--on-surface)' }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', lineHeight: 1.6, maxWidth: 240, margin: '0 auto' }}>{s.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
