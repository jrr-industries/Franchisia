import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({ label, error, options, placeholder, ...props }, ref) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
    {label && (
      <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)' }}>{label}</label>
    )}
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <select
        ref={ref}
        style={{
          width: '100%',
          padding: '10px 40px 10px 16px',
          fontSize: 14,
          color: 'var(--on-surface)',
          backgroundColor: 'var(--surface-container-low)',
          border: `1px solid ${error ? 'var(--error)' : 'var(--outline-variant)'}`,
          borderRadius: 10,
          outline: 'none',
          appearance: 'none',
          cursor: 'pointer',
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => { if (!error) e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(0,74,198,0.15)'; }}
        onBlur={(e) => { if (!error) e.currentTarget.style.borderColor = 'var(--outline-variant)'; e.currentTarget.style.boxShadow = 'none'; }}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown size={16} style={{ position: 'absolute', right: 12, color: 'var(--on-surface-variant)', pointerEvents: 'none' }} />
    </div>
    {error && <span style={{ fontSize: 12, color: 'var(--error)' }}>{error}</span>}
  </div>
));

Select.displayName = 'Select';
export default Select;
