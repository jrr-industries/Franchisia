import { useSite } from '../context/SiteContext';

export default function Statistics() {
  const { stats } = useSite();

  return (
    <section style={{ padding: '80px 0', backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
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
              key={s.label}
              style={{
                textAlign: 'center',
                padding: '20px 40px',
                minWidth: 180,
                flex: '0 1 auto',
                position: 'relative',
              }}
            >
              <div style={{
                fontSize: 36,
                fontWeight: 800,
                color: 'var(--primary)',
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: 1.2,
                marginBottom: 4,
              }}>
                {s.value}
              </div>
              <div style={{
                fontSize: 13,
                color: 'var(--text-muted)',
                fontWeight: 500,
                letterSpacing: '0.01em',
              }}>
                {s.label}
              </div>
              {i < stats.length - 1 && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 1,
                  height: 40,
                  backgroundColor: 'var(--border)',
                }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
