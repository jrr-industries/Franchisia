import { useState, useRef, useEffect } from 'react';

export default function Dropdown({ trigger, children, align = 'left' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: align === 'left' ? 0 : 'auto',
            right: align === 'right' ? 0 : 'auto',
            marginTop: 8,
            backgroundColor: 'var(--surface-container-high)',
            border: '1px solid var(--outline-variant)',
            borderRadius: 12,
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            minWidth: 200,
            zIndex: 100,
            overflow: 'hidden',
          }}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ children, icon, onClick, style, ...props }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '10px 16px',
        fontSize: 14,
        color: 'var(--text)',
        backgroundColor: 'transparent',
        border: 'none',
        textAlign: 'left',
        transition: 'background 0.15s',
        ...style,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
      {...props}
    >
      {icon && <span style={{ display: 'flex', color: 'var(--text-muted)' }}>{icon}</span>}
      {children}
    </button>
  );
}
