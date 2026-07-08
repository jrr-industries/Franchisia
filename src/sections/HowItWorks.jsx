import { UserPlus, Search as SearchIcon, MessageSquareText } from 'lucide-react';

const steps = [
  { icon: UserPlus, title: 'Create Account', desc: 'Sign up in minutes and build your professional profile.', step: '01' },
  { icon: SearchIcon, title: 'Discover Opportunities', desc: 'Browse thousands of franchise listings with advanced filters.', step: '02' },
  { icon: MessageSquareText, title: 'Connect & Communicate', desc: 'Message franchisors, investors, and consultors directly.', step: '03' },
  { icon: null, emoji: '🗺️', title: 'Close the Deal', desc: 'Evaluate, negotiate, and secure your franchise investment.', step: '04' },
];

export default function HowItWorks() {
  return (
    <section style={{ padding: '80px 0', backgroundColor: 'var(--background)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>How It Works</h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
            Four simple steps to find and secure your franchise opportunity.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32, position: 'relative' }}>
          {steps.map((s) => {
            return (
              <div key={s.step} style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', position: 'relative' }}>
                  {s.icon ? <s.icon size={28} color="var(--primary)" /> : <span style={{ fontSize: 28 }}>{s.emoji}</span>}
                  <span style={{ position: 'absolute', top: -4, right: -4, width: 28, height: 28, borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.step}</span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 240, margin: '0 auto' }}>{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
