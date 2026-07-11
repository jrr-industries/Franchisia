import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import logoLightSrc from '../assets/logo-light-theme.png';
import logoDarkSrc from '../assets/logo-dark-theme.png';

export default function Logo({ size = 44, showText = true, collapsed = false, onClick }) {
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();

  const linkTo = isAuthenticated ? '/dashboard' : '/';

  return (
    <Link
      to={linkTo}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        textDecoration: 'none',
        flexShrink: 0,
      }}
    >
      <img
        src={isDark ? logoDarkSrc : logoLightSrc}
        alt="Franchisia"
        style={{ height: size, width: 'auto' }}
      />
      {showText && !collapsed && (
        <span
          style={{
            fontSize: collapsed ? 16 : 20,
            fontWeight: 800,
            color: 'var(--text)',
            whiteSpace: 'nowrap',
          }}
        >
          Franchisia
        </span>
      )}
    </Link>
  );
}
