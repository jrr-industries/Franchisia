import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({ label, error, options, placeholder, ...props }, ref) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
    {label && (
      <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{label}</label>
    )}
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <select
        ref={ref}
        style={{
          width: '100%',
          padding: '10px 40px 10px 16px',
          fontSize: 14,
          color: 'var(--text)',
          backgroundColor: 'var(--surface)',
          border: `2px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-sm)',
          outline: 'none',
          appearance: 'none',
          cursor: 'pointer',
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => { if (!error) e.currentTarget.style.borderColor = 'var(--primary)'; }}
        onBlur={(e) => { if (!error) e.currentTarget.style.borderColor = 'var(--border)'; }}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown size={16} style={{ position: 'absolute', right: 12, color: 'var(--text-muted)', pointerEvents: 'none' }} />
    </div>
    {error && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</span>}
  </div>
));

Select.displayName = 'Select';
export default Select;
