import { useSiteValue } from '../context/SiteContext';

export default function TrustedBrands() {
  const brands = useSiteValue('brands');

  return (
    <section style={{ padding: '48px 0', borderTop: '1px solid var(--outline-variant)', borderBottom: '1px solid var(--outline-variant)' }}>
      <div className="container">
        <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 32 }}>
          Verified Ecosystem Partners
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 48, alignItems: 'center', flexWrap: 'wrap' }}>
          {brands.map((brand, i) => (
            <div key={i} style={{ fontSize: 18, fontWeight: 700, color: 'var(--on-surface-variant)', opacity: 0.5, letterSpacing: 1 }}>
              {brand}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
