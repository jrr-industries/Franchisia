import { Shield, MessageSquare, Search, Calculator, BarChart3, Star, Users, Network, Brain } from 'lucide-react';

const features = [
  { icon: Shield, title: 'Verified Companies', desc: 'Every franchise and company is verified for authenticity.' },
  { icon: MessageSquare, title: 'Secure Messaging', desc: 'Communicate directly with franchisors and investors.' },
  { icon: Search, title: 'Advanced Search', desc: 'Filter by industry, location, investment, and more.' },
  { icon: Calculator, title: 'Investment Calculator', desc: 'Calculate ROI, breakeven, and projected earnings.' },
  { icon: BarChart3, title: 'Analytics', desc: 'Track views, applications, and engagement metrics.' },
  { icon: Star, title: 'Reviews & Ratings', desc: 'Read and leave reviews for franchise opportunities.' },
  { icon: Users, title: 'Community', desc: 'Join industry groups and discuss franchise topics.' },
  { icon: Network, title: 'Networking', desc: 'Connect with professionals across the franchise ecosystem.' },
  { icon: Brain, title: 'AI Matching', desc: 'Smart recommendations powered by AI. (Coming Soon)' },
];

export default function Features() {
  return (
    <section style={{ padding: '80px 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>Everything You Need</h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
            Powerful tools to find, evaluate, and connect with franchise opportunities.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} style={{ padding: 24, backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', transition: 'all 0.2s' }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Icon size={20} color="var(--primary)" />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
                {f.title === 'AI Matching' && (
                  <span style={{ display: 'inline-block', marginTop: 8, padding: '2px 10px', fontSize: 11, fontWeight: 600, backgroundColor: '#FEF3C7', color: '#D97706', borderRadius: 100 }}>Coming Soon</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
