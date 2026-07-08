import { Link } from 'react-router-dom';
import { ArrowRight, Store, Users, TrendingUp, Package } from 'lucide-react';
import Card from '../components/ui/Card';

const types = [
  { icon: Store, title: 'Franchisor', desc: 'List your franchise opportunities and connect with qualified investors.', color: 'var(--primary)' },
  { icon: Users, title: 'Franchisee', desc: 'Find the perfect franchise opportunity to invest in and grow.', color: 'var(--accent)' },
  { icon: null, emoji: '🗺️', title: 'Consultor', desc: 'Connect franchisors with qualified investors and earn commissions.', color: '#F59E0B' },
  { icon: TrendingUp, title: 'Investor', desc: 'Discover high-potential franchise investments with verified ROI data.', color: '#8B5CF6' },
  { icon: Package, title: 'Supplier', desc: 'Offer products and services to franchise brands across the network.', color: '#EC4899' },
];

export default function UserTypes() {
  return (
    <section style={{ padding: '80px 0', backgroundColor: 'var(--background)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>Who Is Franchisia For?</h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
            One platform for every role in the franchise ecosystem.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {types.map((type) => {
            return (
              <Card key={type.title} padding="28px" style={{ textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-sm)', backgroundColor: `${type.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  {type.icon ? <type.icon size={24} color={type.color} /> : <span style={{ fontSize: 28 }}>{type.emoji}</span>}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{type.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>{type.desc}</p>
                <Link to="/signup" style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Get Started <ArrowRight size={14} />
                </Link>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
