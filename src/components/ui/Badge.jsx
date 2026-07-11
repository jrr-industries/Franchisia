const variants = {
  default: { backgroundColor: 'var(--primary-light)', color: 'var(--primary)' },
  success: { backgroundColor: 'var(--accent-light)', color: 'var(--accent)' },
  warning: { backgroundColor: '#FEF3C7', color: '#D97706' },
  danger: { backgroundColor: '#FEE2E2', color: '#DC2626' },
  info: { backgroundColor: '#DBEAFE', color: '#2563EB' },
};

import { memo } from "react";

const Badge = memo(function Badge({ variant = 'default', children, style, ...props }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 12px',
        borderRadius: 100,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
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
