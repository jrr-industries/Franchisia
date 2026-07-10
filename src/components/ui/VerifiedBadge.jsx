import { ShieldCheck } from 'lucide-react';

export default function VerifiedBadge({ size = 16, showTooltip = true }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
      }}
      title={showTooltip ? 'Verified by Franchisia' : undefined}
    >
      <ShieldCheck
        size={size}
        style={{
          fill: '#3B82F6',
          color: '#fff',
          filter: 'drop-shadow(0 1px 2px rgba(59,130,246,0.3))',
        }}
      />
      {showTooltip && (
        <span
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: 4,
            padding: '4px 8px',
            fontSize: 11,
            fontWeight: 500,
            color: '#fff',
            backgroundColor: '#1F2937',
            borderRadius: 4,
            whiteSpace: 'nowrap',
            opacity: 0,
            pointerEvents: 'none',
            transition: 'opacity 0.15s',
            zIndex: 10,
          }}
          className="verified-tooltip"
        >
          Verified by Franchisia
        </span>
      )}
      <style>{`
        .verified-tooltip {
          opacity: 0;
          pointer-events: none;
        }
        span:hover > .verified-tooltip {
          opacity: 1;
        }
      `}</style>
    </span>
  );
}
