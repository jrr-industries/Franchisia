import { forwardRef, memo } from 'react';

const variants = {
  primary: {
    backgroundColor: 'var(--primary)',
    color: '#fff',
    border: 'none',
    fontWeight: 700,
  },
  secondary: {
    backgroundColor: 'transparent',
    color: 'var(--primary)',
    border: '1px solid var(--primary)',
    fontWeight: 700,
  },
  outline: {
    backgroundColor: 'var(--surface)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    fontWeight: 500,
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    border: 'none',
    fontWeight: 500,
  },
  danger: {
    backgroundColor: 'var(--danger)',
    color: '#fff',
    border: 'none',
    fontWeight: 700,
  },
  accent: {
    backgroundColor: 'var(--accent)',
    color: '#fff',
    border: 'none',
    fontWeight: 700,
  },
};

const sizes = {
  sm: { padding: '6px 16px', fontSize: '13px', height: '36px' },
  md: { padding: '10px 24px', fontSize: '14px', height: '44px' },
  lg: { padding: '12px 32px', fontSize: '15px', height: '48px' },
  xl: { padding: '16px 40px', fontSize: '16px', height: '56px' },
};

const Button = forwardRef(({ variant = 'primary', size = 'md', fullWidth, icon, children, style, ...props }, ref) => (
  <button
    ref={ref}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      transition: 'all 0.2s',
      whiteSpace: 'nowrap',
      width: fullWidth ? '100%' : undefined,
      opacity: props.disabled ? 0.5 : 1,
      lineHeight: 1,
      fontFamily: 'Inter, sans-serif',
      ...variants[variant] || variants.primary,
      ...sizes[size] || sizes.md,
      ...style,
    }}
    onMouseEnter={(e) => {
      if (!props.disabled) {
        if (variant === 'primary' || variant === 'danger' || variant === 'accent') {
          e.currentTarget.style.opacity = '0.9';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,74,198,0.25)';
        } else if (variant === 'secondary') {
          e.currentTarget.style.backgroundColor = 'var(--primary-light)';
        } else if (variant === 'outline') {
          e.currentTarget.style.borderColor = 'var(--primary)';
          e.currentTarget.style.color = 'var(--primary)';
        }
      }
    }}
    onMouseLeave={(e) => {
      if (!props.disabled) {
        if (variant === 'primary' || variant === 'danger' || variant === 'accent') {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.boxShadow = 'none';
        } else if (variant === 'secondary') {
          e.currentTarget.style.backgroundColor = 'transparent';
        } else if (variant === 'outline') {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.color = 'var(--text)';
        }
      }
    }}
    {...props}
  >
    {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
    {children}
  </button>
));

Button.displayName = 'Button';
export default memo(Button);