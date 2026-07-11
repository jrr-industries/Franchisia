import { forwardRef, memo } from 'react';

const variants = {
  primary: {
    backgroundColor: 'var(--primary)',
    color: '#fff',
    border: '2px solid var(--primary)',
  },
  secondary: {
    backgroundColor: 'transparent',
    color: 'var(--text)',
    border: '2px solid var(--border)',
  },
  outline: {
    backgroundColor: 'transparent',
    color: 'var(--primary)',
    border: '2px solid var(--primary)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--text)',
    border: '2px solid transparent',
  },
  danger: {
    backgroundColor: 'var(--danger)',
    color: '#fff',
    border: '2px solid var(--danger)',
  },
  accent: {
    backgroundColor: 'var(--accent)',
    color: '#fff',
    border: '2px solid var(--accent)',
  },
};

const sizes = {
  sm: { padding: '6px 16px', fontSize: '13px' },
  md: { padding: '10px 24px', fontSize: '14px' },
  lg: { padding: '14px 32px', fontSize: '16px' },
  xl: { padding: '16px 40px', fontSize: '18px' },
};

const Button = forwardRef(({ variant = 'primary', size = 'md', fullWidth, icon, children, style, ...props }, ref) => (
  <button
    ref={ref}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 'var(--radius-sm)',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s',
      whiteSpace: 'nowrap',
      width: fullWidth ? '100%' : undefined,
      opacity: props.disabled ? 0.5 : 1,
      ...variants[variant] || variants.primary,
      ...sizes[size] || sizes.md,
      ...style,
    }}
    onMouseEnter={(e) => {
      if (!props.disabled) {
        e.currentTarget.style.opacity = '0.9';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }
    }}
    onMouseLeave={(e) => {
      if (!props.disabled) {
        e.currentTarget.style.opacity = '1';
        e.currentTarget.style.transform = 'translateY(0)';
      }
    }}
    {...props}
  >
    {icon && <span style={{ display: 'flex' }}>{icon}</span>}
    {children}
  </button>
));

Button.displayName = 'Button';
export default memo(Button);
