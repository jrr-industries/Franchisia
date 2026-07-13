import { useState } from 'react';
import { Search } from 'lucide-react';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const sampleCompanies = [
  { name: 'McDonald\'s', industry: 'Food & Beverage', location: 'United States', investment: '$500K+' },
  { name: 'Subway', industry: 'Food & Beverage', location: 'United States', investment: '$100K - $500K' },
  { name: '7-Eleven', industry: 'Retail', location: 'Asia', investment: '$100K - $500K' },
  { name: 'KFC', industry: 'Food & Beverage', location: 'Africa', investment: '$500K+' },
  { name: 'Anytime Fitness', industry: 'Health & Fitness', location: 'Europe', investment: '$100K - $500K' },
  { name: 'Jamba Juice', industry: 'Food & Beverage', location: 'United States', investment: 'Under $100K' },
];

const locations = [
  'All Locations', 'United States', 'Canada', 'United Kingdom', 'Europe',
  'Asia', 'Africa', 'Australia', 'South America', 'Middle East',
];

const industries = [
  'All Industries', 'Food & Beverage', 'Retail', 'Health & Fitness', 'Education',
  'Technology', 'Services', 'Hospitality', 'Automotive', 'Real Estate',
];

const investments = [
  'Any Investment', 'Under $50K', '$50K - $100K', '$100K - $500K', '$500K+',
];

export default function SearchSection() {
  const navigate = useNavigate();
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [investment, setInvestment] = useState('');
  const [showResults, setShowResults] = useState(false);

  const filtered = sampleCompanies.filter((c) => {
    if (industry && c.industry !== industry) return false;
    if (location && c.location !== location) return false;
    if (investment && c.investment !== investment) return false;
    return true;
  });

  return (
    <section style={{ padding: '80px 0' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: 'var(--on-surface)' }}>Find Your Next Opportunity</h2>
        <p style={{ fontSize: 16, color: 'var(--on-surface-variant)', marginBottom: 40, maxWidth: 600, margin: '0 auto 40px' }}>
          Search through thousands of verified franchise opportunities across every industry.
        </p>

        <div className="search-section-inner" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', backgroundColor: 'var(--surface)', border: '1px solid var(--outline-variant)', borderRadius: 12, padding: 24, maxWidth: 900, margin: '0 auto' }}>
          <select
            value={industry}
            onChange={(e) => { setIndustry(e.target.value); setShowResults(true); }}
            style={{
              flex: 1, minWidth: 160, padding: '12px 16px', fontSize: 14,
              backgroundColor: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)',
              borderRadius: 8, color: 'var(--on-surface)', cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="">Industry</option>
            {industries.filter(i => i !== 'All Industries').map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <select
            value={location}
            onChange={(e) => { setLocation(e.target.value); setShowResults(true); }}
            style={{
              flex: 1, minWidth: 160, padding: '12px 16px', fontSize: 14,
              backgroundColor: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)',
              borderRadius: 8, color: 'var(--on-surface)', cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="">Location</option>
            {locations.filter(l => l !== 'All Locations').map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <select
            value={investment}
            onChange={(e) => { setInvestment(e.target.value); setShowResults(true); }}
            style={{
              flex: 1, minWidth: 160, padding: '12px 16px', fontSize: 14,
              backgroundColor: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)',
              borderRadius: 8, color: 'var(--on-surface)', cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="">Investment Range</option>
            {investments.filter(i => i !== 'Any Investment').map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <Button
            className="search-btn"
            icon={<Search size={18} />}
            onClick={() => setShowResults(true)}
          >
            Search Marketplace
          </Button>
        </div>

        {showResults && (
          <div style={{ marginTop: 32, maxWidth: 900, margin: '32px auto 0', textAlign: 'left' }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: 16 }}>
              {filtered.length > 0 ? `Showing ${filtered.length} franchise opportunity${filtered.length > 1 ? 'ies' : 'y'}` : 'No matching opportunities found. Try different filters.'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map((c) => (
                <div
                  key={c.name}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: 16, backgroundColor: 'var(--surface)', border: '1px solid var(--outline-variant)',
                    borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onClick={() => navigate('/discover')}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--outline-variant)'; }}
                >
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 4 }}>{c.name}</p>
                    <p style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>{c.industry} &middot; {c.location}</p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>{c.investment}</span>
                </div>
              ))}
            </div>
            <p style={{ marginTop: 16, fontSize: 13, color: 'var(--on-surface-variant)', textAlign: 'center' }}>
              <a href="/signup" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign up</a> to see all {sampleCompanies.length}+ opportunities
            </p>
          </div>
        )}
        <style>{`
          @media (max-width: 768px) {
            .search-section-inner { flex-direction: column !important; align-items: stretch !important; padding: 16px !important; }
            .search-section-inner select { min-width: 100% !important; }
            .search-btn { width: 100% !important; justify-content: center !important; }
          }
        `}</style>
      </div>
    </section>
  );
}
