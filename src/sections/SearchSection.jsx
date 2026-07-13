import { Search } from 'lucide-react';
import Button from '../components/ui/Button';

export default function SearchSection() {
  return (
    <section style={{ padding: '80px 0' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: 'var(--on-surface)' }}>Find Your Next Opportunity</h2>
        <p style={{ fontSize: 16, color: 'var(--on-surface-variant)', marginBottom: 40, maxWidth: 600, margin: '0 auto 40px' }}>
          Search through thousands of verified franchise opportunities across every industry.
        </p>

        <div className="search-section-inner" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', backgroundColor: 'var(--surface)', border: '1px solid var(--outline-variant)', borderRadius: 12, padding: 24, maxWidth: 900, margin: '0 auto' }}>
          {[
            { placeholder: 'Industry', options: ['All Industries', 'Food & Beverage', 'Retail', 'Health & Fitness', 'Education', 'Technology', 'Services'] },
            { placeholder: 'Location', options: ['All Locations', 'United States', 'Canada', 'United Kingdom', 'Australia'] },
            { placeholder: 'Investment Range', options: ['Any Investment', 'Under $50K', '$50K - $100K', '$100K - $500K', '$500K+'] },
          ].map((field) => (
            <select
              key={field.placeholder}
              style={{
                flex: 1,
                minWidth: 160,
                padding: '12px 16px',
                fontSize: 14,
                backgroundColor: 'var(--surface-container-low)',
                border: '1px solid var(--outline-variant)',
                borderRadius: 8,
                color: 'var(--on-surface)',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="">{field.placeholder}</option>
              {field.options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ))}
          <Button className="search-btn" icon={<Search size={18} />}>Search Marketplace</Button>
        </div>
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
