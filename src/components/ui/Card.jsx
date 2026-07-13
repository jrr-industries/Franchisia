import { memo } from "react";

const Card = memo(function Card({ children, style, hover = true, padding = '24px', variant = 'default', ...props }) {
  const baseStyle = variant === 'glass'
    ? { backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', border: '1px solid var(--border)' }
    : { backgroundColor: 'var(--surface)', border: '1px solid var(--border)' };

  return (
    <div
      style={{
        borderRadius: 'var(--radius-lg)',
        padding,
        transition: hover ? 'all 0.2s' : undefined,
        cursor: hover ? 'pointer' : undefined,
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        ...baseStyle,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (hover) {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
          e.currentTarget.style.borderColor = 'var(--primary)';
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
          e.currentTarget.style.borderColor = 'var(--border)';
        }
      }}
      {...props}
    >
      {children}
    </div>
  );
});

export default Card;