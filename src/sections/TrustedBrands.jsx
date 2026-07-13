import { usePartners } from "../hooks/useCMS";

export default function TrustedBrands() {
  const { data: partners } = usePartners();

  if (!partners?.length) return null;

  return (
    <section style={{ padding: '48px 0', borderTop: '1px solid var(--outline-variant)', borderBottom: '1px solid var(--outline-variant)' }}>
      <div className="container">
        <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 32 }}>
          Verified Ecosystem Partners
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 48, alignItems: 'center', flexWrap: 'wrap' }}>
          {partners.map((p, i) => (
            p.logo ? (
              <img key={p.id || i} src={p.logo} alt={p.name} style={{ height: 32, opacity: 0.6, filter: "grayscale(1)" }} />
            ) : (
              <div key={p.id || i} style={{ fontSize: 18, fontWeight: 700, color: 'var(--on-surface-variant)', opacity: 0.5, letterSpacing: 1 }}>
                {p.name}
              </div>
            )
          ))}
        </div>
      </div>
    </section>
  );
}
