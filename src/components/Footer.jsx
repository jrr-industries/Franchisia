import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Globe, MessageSquare, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';

const footerLinks = [
  {
    title: 'Platform',
    links: [
      { label: 'Discover', path: '/discover' },
      { label: 'Companies', path: '/companies' },
      { label: 'Pricing', path: '/pricing' },
      { label: 'About', path: '/about' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact', path: '/contact' },
      { label: 'FAQ', path: '/faq' },
      { label: 'Privacy', path: '/privacy' },
      { label: 'Terms', path: '/terms' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Blog', path: '/blog' },
      { label: 'Careers', path: '/careers' },
      { label: 'Partners', path: '/partners' },
      { label: 'Events', path: '/events' },
    ],
  },
];

function FooterLink({ to, children }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate('/login');
    }
  };

  return (
    <Link to={to} onClick={handleClick} style={{ fontSize: 14, color: 'var(--text-secondary)', transition: 'color 0.2s' }}>
      {children}
    </Link>
  );
}

export default function Footer() {
  const { contact } = useSite();

  return (
    <footer style={{ backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)', paddingTop: 64, paddingBottom: 32 }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 22, color: 'var(--primary)', marginBottom: 16 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'inline-block' }} />
              Franchisia
            </Link>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24, maxWidth: 360 }}>
              The professional network for the franchise industry. Connect with franchisors, franchisees, consultors, investors, and suppliers.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              {[Globe, MessageSquare, Share2].map((Icon, i) => (
                <a key={i} href="#" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: 'var(--surface-hover)', color: 'var(--text-secondary)', transition: 'all 0.2s' }}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {footerLinks.map((col) => (
            <div key={col.title}>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text)' }}>{col.title}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map((link) => (
                  <FooterLink key={link.label} to={link.path}>{link.label}</FooterLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ paddingTop: 24, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>&copy; {new Date().getFullYear()} Franchisia. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
              <Mail size={14} />
              <span>{contact.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
              <Phone size={14} />
              <span>{contact.phone}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
              <MapPin size={14} />
              <span>{contact.address}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
