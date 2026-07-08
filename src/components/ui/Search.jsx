import { Search as SearchIcon, SlidersHorizontal } from 'lucide-react';

export default function Search({ value, onChange, placeholder = 'Search...', onFilter, style, ...props }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', ...style }}>
      <SearchIcon size={18} style={{ position: 'absolute', left: 14, color: 'var(--text-muted)' }} />
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '12px 16px 12px 44px',
          fontSize: 14,
          color: 'var(--text)',
          backgroundColor: 'var(--surface)',
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          outline: 'none',
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
        {...props}
      />
      {onFilter && (
        <button
          onClick={onFilter}
          style={{
            position: 'absolute',
            right: 8,
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            padding: 6,
            borderRadius: 6,
            display: 'flex',
          }}
        >
          <SlidersHorizontal size={18} />
        </button>
      )}
    </div>
  );
}
