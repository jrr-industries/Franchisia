import { Loader2, AlertCircle, Inbox, UserPlus, Search, MessageSquareText, Handshake } from 'lucide-react';
import { usePublicSettings } from "../hooks/useCMS";

const iconMap = { UserPlus, Search, MessageSquareText, Handshake };

function resolveIcon(name) {
  return iconMap[name] || Inbox;
}

export default function HowItWorks() {
  const { data: settings, isLoading, isError } = usePublicSettings();
  const steps = settings?.howItWorks;

  if (isLoading) {
    return (
      <section style={{ padding: '80px 0', backgroundColor: 'var(--surface)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <Loader2 size={32} className="animate-spin" color="var(--primary)" />
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section style={{ padding: '80px 0', backgroundColor: 'var(--surface)' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: 12 }}>
          <AlertCircle size={32} color="var(--error)" />
          <p style={{ color: 'var(--on-surface-variant)', fontSize: 14 }}>Failed to load section. Please try again later.</p>
        </div>
      </section>
    );
  }

  if (!steps || steps.length === 0) {
    return (
      <section style={{ padding: '80px 0', backgroundColor: 'var(--surface)' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: 12 }}>
          <Inbox size={32} color="var(--on-surface-variant)" />
          <p style={{ color: 'var(--on-surface-variant)', fontSize: 14 }}>No steps available yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: '80px 0', backgroundColor: 'var(--surface)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: 'var(--on-surface)' }}>How It Works</h2>
          <p style={{ fontSize: 16, color: 'var(--on-surface-variant)', maxWidth: 600, margin: '0 auto' }}>
            Four simple steps to find and secure your franchise opportunity.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32, position: 'relative' }}>
          {steps.map((s, i) => {
            const Icon = resolveIcon(s.icon);
            return (
              <div key={s.title || i} style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', position: 'relative' }}>
                  <Icon size={26} color="var(--primary)" />
                  <span style={{ position: 'absolute', top: -2, right: -2, width: 24, height: 24, borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--on-surface)' }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', lineHeight: 1.6, maxWidth: 240, margin: '0 auto' }}>{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
