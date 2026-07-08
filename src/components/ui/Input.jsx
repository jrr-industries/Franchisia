import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, icon, rightIcon, onRightIconClick, ...props }, ref) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
    {label && (
      <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{label}</label>
    )}
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {icon && (
        <span style={{ position: 'absolute', left: 12, color: 'var(--text-muted)', display: 'flex', pointerEvents: 'none' }}>
          {icon}
        </span>
      )}
      <input
        ref={ref}
        style={{
          width: '100%',
          padding: icon && rightIcon ? '10px 40px 10px 40px'
                 : icon ? '10px 16px 10px 40px'
                 : rightIcon ? '10px 40px 10px 16px'
                 : '10px 16px',
          fontSize: 14,
          color: 'var(--text)',
          backgroundColor: 'var(--surface)',
          border: `2px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-sm)',
          outline: 'none',
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => {
          if (!error) e.currentTarget.style.borderColor = 'var(--primary)';
        }}
        onBlur={(e) => {
          if (!error) e.currentTarget.style.borderColor = 'var(--border)';
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
