import { usePublicSettings } from "../hooks/useCMS";
import * as LucideIcons from "lucide-react";

const defaultIcon = "HelpCircle";

export default function Features() {
  const { data: settings, isLoading, isError } = usePublicSettings();

  if (isLoading) {
    return (
      <section style={{ padding: '80px 0', backgroundColor: 'var(--surface-container-lowest)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ width: 300, height: 32, margin: '0 auto 12px', backgroundColor: 'var(--surface-container-high)', borderRadius: 8 }} />
            <div style={{ width: 400, height: 16, margin: '0 auto', backgroundColor: 'var(--surface-container-high)', borderRadius: 8 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ padding: 24, border: '1px solid var(--outline-variant)', borderRadius: 12, backgroundColor: 'var(--surface)' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'var(--surface-container-high)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ width: '60%', height: 16, marginBottom: 8, backgroundColor: 'var(--surface-container-high)', borderRadius: 8 }} />
                    <div style={{ width: '90%', height: 14, backgroundColor: 'var(--surface-container-high)', borderRadius: 8 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section style={{ padding: '80px 0', backgroundColor: 'var(--surface-container-lowest)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ padding: 48, border: '1px solid var(--outline-variant)', borderRadius: 12, backgroundColor: 'var(--surface)' }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8, color: 'var(--on-surface)' }}>Unable to load features</h3>
            <p style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  const features = Array.isArray(settings?.features) ? settings.features : [];

  return (
    <section style={{ padding: '80px 0', backgroundColor: 'var(--surface-container-lowest)' }}>
      <div className="container">
        {features.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, border: '1px solid var(--outline-variant)', borderRadius: 12, backgroundColor: 'var(--surface)' }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8, color: 'var(--on-surface)' }}>Features coming soon</h3>
            <p style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>We are working on something exciting. Check back later!</p>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: 'var(--on-surface)' }}>Platform Infrastructure</h2>
              <p style={{ fontSize: 16, color: 'var(--on-surface-variant)', maxWidth: 600, margin: '0 auto' }}>
                Powerful tools to find, evaluate, and connect with franchise opportunities.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
              {features.map((f, i) => {
                const IconComponent = LucideIcons[f.icon] || LucideIcons[defaultIcon];
                const isWide = i === features.length - 1;
                return (
                  <div
                    key={i}
                    style={{
                      gridColumn: isWide ? '1 / -1' : undefined,
                      padding: 24,
                      backgroundColor: isWide ? 'rgba(0,74,198,0.04)' : 'var(--surface)',
                      border: '1px solid var(--outline-variant)',
                      borderRadius: 12,
                      transition: 'all 0.2s',
                      display: 'flex',
                      gap: 16,
                      alignItems: isWide ? 'center' : 'flex-start',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--outline-variant)'; }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <IconComponent size={20} color="var(--primary)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: 'var(--on-surface)' }}>{f.title}</h3>
                      <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>{f.desc}</p>
                      {isWide && f.title === 'AI Matching' && (
                        <span style={{ display: 'inline-block', marginTop: 8, padding: '2px 8px', fontSize: 11, fontWeight: 700, backgroundColor: '#fef3c7', color: '#b45309', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Coming Soon</span>
                      )}
                    </div>
                    {isWide && (
                      <button style={{ padding: '10px 20px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer', flexShrink: 0, transition: 'box-shadow 0.2s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,74,198,0.3)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                      >
                        Start Matching
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
