import { Link } from 'react-router-dom';
import { Search, ArrowRight, TrendingUp, UserCheck } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export default function Hero() {
  const { isAuthenticated, user } = useAuth();
  return (
    <section style={{ padding: '80px 0', position: 'relative', overflow: 'hidden' }}>
      <div className="container hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
        <div>
          <div className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '6px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
            <TrendingUp size={16} />
            #1 Franchise Networking Platform
          </div>
          <h1 className="hero-title" style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.02em' }}>
            Find the Perfect{' '}
            <span style={{ color: 'var(--primary)' }}>Franchise</span>{' '}
            Opportunity
          </h1>
          <p className="hero-subtitle" style={{ fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 32, maxWidth: 520 }}>
            Connect with franchisors, franchisees, brokers, investors, and suppliers on one professional platform.
          </p>

          <div style={{ display: 'flex', gap: 24, marginBottom: 40, flexWrap: 'wrap' }}>
            <div className="hero-search" style={{ flex: 1, minWidth: 280, position: 'relative' }}>
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

          <div className="hero-cta" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {isAuthenticated ? (
              user?.role && user?.role !== "none" ? (
                <Link to="/onboarding/status"><Button size="lg" icon={<ArrowRight size={18} />}>View Status</Button></Link>
              ) : (
                <Link to="/onboarding/select-role"><Button size="lg" icon={<UserCheck size={18} />}>Complete Your Profile</Button></Link>
              )
            ) : (
              <>
                <Link to="/discover"><Button size="lg" icon={<ArrowRight size={18} />}>Explore Franchises</Button></Link>
                <Link to="/signup"><Button variant="outline" size="lg">Register Company</Button></Link>
              </>
            )}
          </div>

          <div className="hero-stats" style={{ display: 'flex', gap: 40, marginTop: 48 }}>
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

        <div className="hero-visual" style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
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
      <style>{`
        @media (max-width: 1024px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .hero-visual { display: none !important; }
          .hero-stats { gap: 24px !important; }
          .hero-stats p:first-child { font-size: 24px !important; }
        }
        @media (max-width: 768px) {
          .hero-grid { gap: 32px !important; }
          .hero-title { font-size: 36px !important; }
          .hero-subtitle { font-size: 16px !important; }
          .hero-search { min-width: 100% !important; }
          .hero-stats { margin-top: 32px !important; flex-wrap: wrap !important; gap: 16px !important; }
          .hero-stats > div { flex: 1; min-width: 100px; }
        }
        @media (max-width: 480px) {
          .hero-title { font-size: 28px !important; }
          .hero-badge { font-size: 12px !important; }
          .hero-cta { flex-direction: column !important; width: 100% !important; }
          .hero-cta a { width: 100% !important; }
          .hero-cta a button { width: 100% !important; justify-content: center !important; }
        }
      `}</style>
    </section>
  );
}
