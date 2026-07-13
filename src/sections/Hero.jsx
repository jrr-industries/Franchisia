import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export default function Hero() {
  const { isAuthenticated, user } = useAuth();
  return (
    <section style={{ minHeight: '700px', display: 'flex', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
      <div className="container" style={{ position: 'relative', zIndex: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>
        <div>
          <div style={{ marginBottom: 16 }}>
            <svg width="64" height="64" viewBox="0 0 24 24" style={{ animation: 'spin 20s linear infinite' }}>
              <defs>
                <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#004ac6" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
              </defs>
              <rect width="24" height="24" rx="4" fill="url(#logo-grad)" />
              <path d="M7 12l3 3 7-7" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 16, letterSpacing: '-0.02em', color: 'var(--on-surface)' }}>
            Find the Perfect{' '}
            <span style={{ color: 'var(--primary)' }}>Franchise</span>{' '}
            Opportunity.
          </h1>
          <p style={{ fontSize: 18, color: 'var(--on-surface-variant)', lineHeight: 1.6, marginBottom: 32, maxWidth: 560 }}>
            Connect with franchisors, franchisees, brokers, investors, and suppliers on one professional platform.
          </p>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {isAuthenticated ? (
              user?.role && user?.role !== "none" ? (
                <Link to="/onboarding/status"><Button size="lg">View Status <ArrowRight size={18} /></Button></Link>
              ) : (
                <Link to="/onboarding/select-role"><Button size="lg">Complete Your Profile <ArrowRight size={18} /></Button></Link>
              )
            ) : (
              <>
                <Link to="/discover"><Button size="lg">Explore Franchises <ArrowRight size={18} /></Button></Link>
                <Link to="/signup"><Button variant="outline" size="lg">Register Company</Button></Link>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'none' }} className="hero-visual-lg">
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', inset: -16, background: 'rgba(0,74,198,0.08)', filter: 'blur(48px)', borderRadius: '50%', opacity: 0.5 }} />
            <div style={{ position: 'relative', borderRadius: 12, border: '1px solid var(--outline-variant)', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', backgroundColor: 'var(--surface)' }}>
              <div style={{ padding: 16 }}>
                <div style={{ maxWidth: '100%', aspectRatio: '4/3', background: 'linear-gradient(135deg, #e8eeff, #daf3e5)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface-variant)', fontSize: 18, fontWeight: 600 }}>
                  The Franchise Network
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .hero-visual-lg { display: block !important; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
