import { UserPlus, Search as SearchIcon, MessageSquareText, Handshake } from 'lucide-react';

const steps = [
  { icon: UserPlus, title: 'Create Account', desc: 'Sign up in minutes and build your professional profile.' },
  { icon: SearchIcon, title: 'Discover Opportunities', desc: 'Browse thousands of franchise listings with advanced filters.' },
  { icon: MessageSquareText, title: 'Connect & Communicate', desc: 'Message franchisors, investors, and consultors directly.' },
  { icon: Handshake, title: 'Close the Deal', desc: 'Evaluate, negotiate, and secure your franchise investment.' },
];

export default function HowItWorks() {
  return (
    <section style={{ padding: '80px 0', backgroundColor: 'var(--surface)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: 'var(--on-surface)' }}>How It Works</h2>
          <p style={{ fontSize: 16, color: 'var(--on-surface-variant)', maxWidth: 600, margin: '0 auto' }}>
            Four simple steps to find and secure your franchise opportunity.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32, position: 'relative' }}>
          {steps.map((s, i) => (
            <div key={s.title} style={{ textAlign: 'center', position: 'relative' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', position: 'relative' }}>
                <s.icon size={26} color="var(--primary)" />
                <span style={{ position: 'absolute', top: -2, right: -2, width: 24, height: 24, borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--on-surface)' }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', lineHeight: 1.6, maxWidth: 240, margin: '0 auto' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
