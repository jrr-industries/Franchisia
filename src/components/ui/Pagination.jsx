import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ current, total, onChange }) {
  const pages = [];
  for (let i = 1; i <= total; i++) {
    pages.push(i);
  }

  const btnStyle = (active) => ({
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    border: active ? 'none' : '1px solid var(--outline-variant)',
    backgroundColor: active ? 'var(--primary)' : 'transparent',
    color: active ? 'var(--on-primary)' : 'var(--on-surface-variant)',
    fontWeight: active ? 700 : 600,
    fontSize: 14,
    cursor: 'pointer',
    transition: 'all 0.15s',
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
      <button style={btnStyle(false)} onClick={() => onChange(Math.max(1, current - 1))}>
        <ChevronLeft size={16} />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          style={btnStyle(p === current)}
          onClick={() => onChange(p)}
          onMouseEnter={(e) => { if (p !== current) { e.currentTarget.style.backgroundColor = 'var(--surface-container-low)'; }}}
          onMouseLeave={(e) => { if (p !== current) { e.currentTarget.style.backgroundColor = 'transparent'; }}}
        >
          {p}
        </button>
      ))}
      <button style={btnStyle(false)} onClick={() => onChange(Math.min(total, current + 1))}>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
