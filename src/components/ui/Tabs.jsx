import { useState } from 'react';

export default function Tabs({ tabs, defaultTab }) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          borderBottom: '2px solid var(--outline-variant)',
          gap: 0,
          overflowX: 'auto',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            style={{
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 600,
              background: 'none',
              border: 'none',
              borderBottom: active === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
              color: active === tab.id ? 'var(--primary)' : 'var(--on-surface-variant)',
              marginBottom: -2,
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = active === tab.id ? 'var(--primary)' : 'var(--on-surface)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = active === tab.id ? 'var(--primary)' : 'var(--on-surface-variant)'; }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ paddingTop: 24 }}>
        {tabs.find((t) => t.id === active)?.content}
      </div>
    </div>
  );
}
