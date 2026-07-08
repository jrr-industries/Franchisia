const brands = ['McDonald\'s', 'Subway', 'KFC', 'Starbucks', 'Domino\'s', 'Burger King', 'Pizza Hut', 'Dunkin\''];

export default function TrustedBrands() {
  return (
    <section style={{ padding: '48px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div className="container">
        <p style={{ textAlign: 'center', fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 32 }}>
          Trusted by leading franchise brands
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 48, alignItems: 'center', flexWrap: 'wrap' }}>
          {brands.map((brand) => (
            <div key={brand} style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-muted)', opacity: 0.6, letterSpacing: 1 }}>
              {brand}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
