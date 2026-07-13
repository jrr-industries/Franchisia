import { Loader2 } from "lucide-react";
import { useIndustries } from "../hooks/useCMS";

export default function Industries() {
  const { data: industries, isLoading, isError } = useIndustries();

  return (
    <section style={{ padding: '80px 0', backgroundColor: 'var(--surface)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: 'var(--on-surface)' }}>Explore by Industry</h2>
          <p style={{ fontSize: 16, color: 'var(--on-surface-variant)', maxWidth: 600, margin: '0 auto' }}>
            Browse franchise opportunities across {industries ? industries.length : "…"}+ thriving industries.
          </p>
        </div>

        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <Loader2 className="animate-spin" size={32} style={{ color: 'var(--primary)' }} />
          </div>
        )}

        {isError && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--error, #d32f2f)' }}>
            Failed to load industries.
          </div>
        )}

        {!isLoading && !isError && industries && industries.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--on-surface-variant)' }}>
            No industries available yet.
          </div>
        )}

        {!isLoading && !isError && industries && industries.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
            {industries.map((ind) => (
              <button
                key={ind}
                style={{
                  padding: '10px 24px',
                  fontSize: 13,
                  fontWeight: 700,
                  backgroundColor: 'var(--surface-container-low)',
                  border: '1px solid var(--outline-variant)',
                  borderRadius: 100,
                  color: 'var(--on-surface-variant)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  letterSpacing: '0.02em',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.backgroundColor = 'rgba(0,74,198,0.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--outline-variant)'; e.currentTarget.style.color = 'var(--on-surface-variant)'; e.currentTarget.style.backgroundColor = 'var(--surface-container-low)'; }}
              >
                {ind}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
