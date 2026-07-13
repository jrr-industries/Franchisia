import { Link } from 'react-router-dom';
import { ArrowRight, Store, Users, TrendingUp, Package } from 'lucide-react';

const types = [
  { icon: Store, title: 'Franchisor', desc: 'Scale your brand by connecting with qualified franchisees.' },
  { icon: Users, title: 'Franchisee', desc: 'Find and invest in the perfect franchise opportunity.' },
  { icon: null, emoji: '🔍', title: 'Consultor', desc: 'Connect franchisors with qualified investors.' },
  { icon: TrendingUp, title: 'Investor', desc: 'Discover high-potential investment opportunities.' },
  { icon: Package, title: 'Supplier', desc: 'Offer products and services to franchise brands.' },
];

export default function UserTypes() {
  return (
    <section style={{ padding: '80px 0', backgroundColor: 'var(--surface-container-lowest)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: 'var(--on-surface)' }}>Tailored for Every Stakeholder</h2>
          <p style={{ fontSize: 16, color: 'var(--on-surface-variant)', maxWidth: 600, margin: '0 auto' }}>
            Specialized tools and flows for your specific role.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {types.map((type) => (
            <div
              key={type.title}
              style={{
                padding: 24,
                border: '1px solid var(--outline-variant)',
                borderRadius: 12,
                backgroundColor: 'var(--surface)',
                textAlign: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
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
                  transition: 'all 0.2s',
                }}
                className="user-type-icon"
              >
                {type.icon ? <type.icon size={22} color="var(--primary)" /> : <span style={{ fontSize: 22 }}>{type.emoji}</span>}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--on-surface)' }}>{type.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', lineHeight: 1.6, marginBottom: 16 }}>{type.desc}</p>
              <Link to="/signup" style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none', transition: 'gap 0.2s' }} className="user-type-link">
                Learn More <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .user-type-link:hover { gap: 8px !important; }
      `}</style>
    </section>
  );
}
