import { memo } from "react";

function Avatar({ src, name, size = 40, style, ...props }) {
  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        backgroundColor: src ? 'transparent' : 'var(--primary-container)',
        color: src ? 'inherit' : 'var(--on-primary-container)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: size * 0.4,
        flexShrink: 0,
        border: size > 40 ? '2px solid var(--border)' : '1px solid var(--border)',
        ...style,
      }}
      {...props}
    >
      {src ? (
        <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        initials
      )}
    </div>
  );
}

export default memo(Avatar);
