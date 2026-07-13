import { Shield, MessageSquare, Search, Calculator, BarChart3, Star, Users, Network, Brain } from 'lucide-react';

const features = [
  { icon: Shield, title: 'Verified Companies', desc: 'Every entity undergoes a rigorous verification process for authenticity.' },
  { icon: MessageSquare, title: 'Secure Messaging', desc: 'Communicate directly with franchisors and investors.' },
  { icon: Search, title: 'Advanced Search', desc: 'Filter by industry, location, investment, and more.' },
  { icon: Calculator, title: 'Investment Calculator', desc: 'Calculate ROI, breakeven, and projected earnings.' },
  { icon: BarChart3, title: 'Analytics', desc: 'Track views, applications, and engagement metrics.' },
  { icon: Star, title: 'Reviews & Ratings', desc: 'Read and leave reviews for franchise opportunities.' },
  { icon: Users, title: 'Community', desc: 'Join industry groups and discuss franchise topics.' },
  { icon: Network, title: 'Networking', desc: 'Connect with professionals across the franchise ecosystem.' },
  { icon: Brain, title: 'AI Matching', desc: 'Smart recommendations powered by AI.' },
];

export default function Features() {
  return (
    <section style={{ padding: '80px 0', backgroundColor: 'var(--surface-container-lowest)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: 'var(--on-surface)' }}>Platform Infrastructure</h2>
          <p style={{ fontSize: 16, color: 'var(--on-surface-variant)', maxWidth: 600, margin: '0 auto' }}>
            Powerful tools to find, evaluate, and connect with franchise opportunities.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {features.map((f, i) => {
            const Icon = f.icon;
            const isWide = i === features.length - 1;
            return (
              <div
                key={f.title}
                style={{
                  gridColumn: isWide ? '1 / -1' : undefined,
                  padding: 24,
                  backgroundColor: isWide ? 'rgba(0,74,198,0.04)' : 'var(--surface)',
                  border: '1px solid var(--outline-variant)',
                  borderRadius: 12,
                  transition: 'all 0.2s',
                  display: 'flex',
                  gap: 16,
                  alignItems: isWide ? 'center' : 'flex-start',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--outline-variant)'; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} color="var(--primary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: 'var(--on-surface)' }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>{f.desc}</p>
                  {f.title === 'AI Matching' && (
                    <span style={{ display: 'inline-block', marginTop: 8, padding: '2px 8px', fontSize: 11, fontWeight: 700, backgroundColor: '#fef3c7', color: '#b45309', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Coming Soon</span>
                  )}
                </div>
                {isWide && (
                  <button style={{ padding: '10px 20px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer', flexShrink: 0, transition: 'box-shadow 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,74,198,0.3)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    Start Matching
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
