import { useStats } from "../hooks/useCMS";

export default function Statistics() {
  const { data: stats } = useStats();

  if (!stats?.length) return null;

  return (
    <section style={{ padding: '80px 0', backgroundColor: 'var(--inverse-surface)', color: 'var(--inverse-on-surface)' }}>
      <div className="container">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          maxWidth: 960,
          margin: '0 auto',
        }}>
          {stats.map((s, i) => (
            <div
              key={s.label || i}
              className="stat-item"
              style={{
                textAlign: 'center',
                padding: '20px 40px',
                minWidth: 180,
                flex: '0 1 auto',
                position: 'relative',
              }}
            >
              <div className="stat-value" style={{
                fontSize: 48,
                fontWeight: 700,
                color: 'var(--primary-fixed)',
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: 1.2,
                marginBottom: 4,
              }}>
                {s.value}
              </div>
              <div style={{
                fontSize: 13,
                color: 'var(--on-surface-variant)',
                fontWeight: 500,
                letterSpacing: '0.01em',
              }}>
                {s.label}
              </div>
              {i < stats.length - 1 && (
                <div className="stat-divider" style={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 1,
                  height: 40,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                }} />
              )}
            </div>
          ))}
        </div>
        <style>{`
          @media (max-width: 768px) {
            .stat-item { min-width: 140px !important; padding: 16px 20px !important; }
            .stat-value { font-size: 36px !important; }
            .stat-divider { display: none !important; }
          }
          @media (max-width: 480px) {
            .stat-item { min-width: 50% !important; padding: 12px 16px !important; }
            .stat-item:nth-child(2n) .stat-divider { display: none !important; }
          }
        `}</style>
      </div>
    </section>
  );
}
