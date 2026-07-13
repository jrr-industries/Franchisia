import { memo } from "react";

const variants = {
  default: { backgroundColor: 'var(--primary-container)', color: 'var(--on-primary-container)' },
  success: { backgroundColor: 'var(--tertiary-container)', color: 'var(--on-tertiary-container)' },
  warning: { backgroundColor: '#FEF3C7', color: '#D97706' },
  danger: { backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)' },
  info: { backgroundColor: '#DBEAFE', color: '#2563EB' },
};

const Badge = memo(function Badge({ variant = 'default', children, style, ...props }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 100,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        letterSpacing: '0.02em',
        ...variants[variant] || variants.default,
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
});

export default Badge;
