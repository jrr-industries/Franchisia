import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ current, total, onChange }) {
  const pages = [];
  for (let i = 1; i <= total; i++) {
    pages.push(i);
  }

  const btnStyle = (active) => ({
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-sm)',
    border: active ? 'none' : '1px solid var(--border)',
    backgroundColor: active ? 'var(--primary)' : 'transparent',
    color: active ? '#fff' : 'var(--text)',
    fontWeight: active ? 600 : 400,
    fontSize: 14,
    cursor: 'pointer',
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
      <button style={btnStyle(false)} onClick={() => onChange(Math.max(1, current - 1))}>
        <ChevronLeft size={16} />
      </button>
      {pages.map((p) => (
        <button key={p} style={btnStyle(p === current)} onClick={() => onChange(p)}>
          {p}
        </button>
      ))}
      <button style={btnStyle(false)} onClick={() => onChange(Math.min(total, current + 1))}>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
