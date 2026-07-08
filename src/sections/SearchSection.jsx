import { Search } from 'lucide-react';
import Button from '../components/ui/Button';

export default function SearchSection() {
  return (
    <section style={{ padding: '80px 0' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>Find Your Next Opportunity</h2>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 40, maxWidth: 600, margin: '0 auto 40px' }}>
          Search through thousands of verified franchise opportunities across every industry.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 20, maxWidth: 900, margin: '0 auto' }}>
          {[
            { placeholder: 'Industry', options: ['All Industries', 'Food & Beverage', 'Retail', 'Health & Fitness', 'Education', 'Technology', 'Services'] },
            { placeholder: 'Location', options: ['All Locations', 'United States', 'Canada', 'United Kingdom', 'Australia'] },
            { placeholder: 'Investment Range', options: ['Any Investment', 'Under $50K', '$50K - $100K', '$100K - $500K', '$500K+'] },
            { placeholder: 'Business Type', options: ['All Types', 'Single Unit', 'Multi Unit', 'Master Franchise', 'Area Development'] },
          ].map((field) => (
            <select
              key={field.placeholder}
              style={{
                flex: 1,
                minWidth: 160,
                padding: '12px 16px',
                fontSize: 14,
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text)',
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
          <Button icon={<Search size={18} />}>Search</Button>
        </div>
      </div>
    </section>
  );
}
