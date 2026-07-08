import { Link } from 'react-router-dom';
import { Search, ArrowRight, TrendingUp } from 'lucide-react';
import Button from '../components/ui/Button';

export default function Hero() {
  return (
    <section style={{ padding: '80px 0', position: 'relative', overflow: 'hidden' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '6px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
            <TrendingUp size={16} />
            #1 Franchise Networking Platform
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.02em' }}>
            Find the Perfect{' '}
            <span style={{ color: 'var(--primary)' }}>Franchise</span>{' '}
            Opportunity
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 32, maxWidth: 520 }}>
            Connect with franchisors, franchisees, brokers, investors, and suppliers on one professional platform.
          </p>

          <div style={{ display: 'flex', gap: 24, marginBottom: 40, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 280, position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', left: 16, top: 18, color: 'var(--text-muted)' }} />
              <input
                placeholder="Search by industry, location, or brand..."
                style={{
                  width: '100%',
                  padding: '16px 20px 16px 48px',
                  fontSize: 16,
                  border: '2px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text)',
                  outline: 'none',
                }}
              />
            </div>
            <Button size="lg" icon={<ArrowRight size={18} />}>Search</Button>
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link to="/discover"><Button size="lg" icon={<ArrowRight size={18} />}>Explore Franchises</Button></Link>
            <Link to="/signup"><Button variant="outline" size="lg">Register Company</Button></Link>
          </div>

          <div style={{ display: 'flex', gap: 40, marginTop: 48 }}>
            {[
              { value: '10K+', label: 'Franchises' },
              { value: '50K+', label: 'Professionals' },
              { value: '$2B+', label: 'Investment' },
            ].map((stat) => (
              <div key={stat.label}>
                <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)', fontFamily: "'JetBrains Mono', monospace" }}>{stat.value}</p>
                <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: '100%',
            maxWidth: 480,
            aspectRatio: '1',
            borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, var(--primary-light), var(--accent-light))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}>
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🗺️</div>
              <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--primary)' }}>The Franchise Network</p>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Where opportunities connect</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
