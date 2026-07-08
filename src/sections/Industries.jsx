const industries = [
  'Food & Beverage', 'Retail', 'Health & Fitness', 'Education', 'Technology',
  'Services', 'Hospitality', 'Automotive', 'Real Estate', 'Logistics',
  'Beauty & Wellness', 'Home Services', 'Pet Care', 'Senior Care', 'Entertainment',
];

export default function Industries() {
  return (
    <section style={{ padding: '80px 0', backgroundColor: 'var(--background)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>Explore by Industry</h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
            Browse franchise opportunities across 15+ thriving industries.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
          {industries.map((ind) => (
            <button
              key={ind}
              style={{
                padding: '10px 24px',
                fontSize: 14,
                fontWeight: 500,
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 100,
                color: 'var(--text)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)'; }}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
