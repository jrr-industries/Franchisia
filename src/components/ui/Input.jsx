import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, icon, rightIcon, onRightIconClick, ...props }, ref) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
    {label && (
      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>{label}</label>
    )}
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {icon && (
        <span style={{ position: 'absolute', left: 12, color: 'var(--text-muted)', display: 'flex', pointerEvents: 'none', zIndex: 1 }}>
          {icon}
        </span>
      )}
      <input
        ref={ref}
        style={{
          width: '100%',
          padding: icon && rightIcon ? '11px 40px 11px 40px'
                 : icon ? '11px 16px 11px 40px'
                 : rightIcon ? '11px 40px 11px 16px'
                 : '11px 16px',
          fontSize: 14,
          color: 'var(--text)',
          backgroundColor: 'var(--surface-container-low)',
          border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-md)',
          outline: 'none',
          transition: 'border-color 0.2s',
          fontFamily: 'Inter, sans-serif',
          lineHeight: 1.5,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--primary)';
          e.currentTarget.style.backgroundColor = 'var(--surface)';
        }}
        onBlur={(e) => {
          if (!error) e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.backgroundColor = 'var(--surface-container-low)';
        }}
        {...props}
      />
      {rightIcon && (
        <button
          type="button"
          onClick={onRightIconClick}
          style={{
            position: 'absolute',
            right: 12,
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            display: 'flex',
            padding: 0,
            cursor: 'pointer',
            zIndex: 1,
          }}
        >
          {rightIcon}
        </button>
      )}
    </div>
    {error && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</span>}
  </div>
));

Input.displayName = 'Input';
export default Input;