import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Share2 } from 'lucide-react';
import { usePublicSettings, useSiteContact } from '../hooks/useCMS';

function FooterLink({ to, children }) {
  return (
    <Link to={to} className="footer-link" style={{ fontSize: 14, color: 'var(--on-surface-variant)', transition: 'color 0.2s', textDecoration: 'none' }}>
      {children}
    </Link>
  );
}

const platformLinks = [
  { label: 'Discover', to: '/discover' },
  { label: 'Marketplace', to: '/discover' },
  { label: 'Companies', to: '/companies' },
  { label: 'Pricing', to: '/pricing' },
];

const resourceLinks = [
  { label: 'Blog', to: '/blog' },
  { label: 'Events', to: '/events' },
  { label: 'Careers', to: '/careers' },
  { label: 'Partners', to: '/partners' },
];

const supportLinks = [
  { label: 'Help Center', to: '/faq' },
  { label: 'Contact', to: '/contact' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
];

const communityLinks = [
  { label: 'LinkedIn', to: '#', external: 'https://linkedin.com' },
  { label: 'Facebook', to: '#', external: 'https://facebook.com' },
  { label: 'Instagram', to: '#', external: 'https://instagram.com' },
  { label: 'X', to: '#', external: 'https://x.com' },
];

export default function Footer() {
  const { data: settings } = usePublicSettings();
  const { data: contact } = useSiteContact();

  const description = settings?.footerDescription || "India's professional network for the franchise ecosystem. Connect, discover, and grow with verified franchisors, franchisees, investors, consultants, and suppliers.";

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="site-footer"
      style={{ backgroundColor: 'var(--surface)', borderTop: '1px solid var(--outline-variant)', paddingTop: 64, paddingBottom: 32 }}
    >
      <div className="container">
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 22, color: 'var(--primary)', marginBottom: 16, textDecoration: 'none' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'inline-block' }} />
              Franchisia
            </Link>
            <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', lineHeight: 1.7, marginBottom: 24, maxWidth: 320 }}>
              {description}
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <a href={`mailto:${contact?.email || ''}`} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: 'var(--surface-hover)', color: 'var(--on-surface-variant)', transition: 'all 0.2s', textDecoration: 'none' }} title="Email us">
                <Mail size={16} />
              </a>
              <button
                onClick={() => { navigator.share?.({ title: 'Franchisia', text: 'Join the professional franchise network', url: window.location.origin })?.catch(() => {}); }}
                style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: 'var(--surface-hover)', color: 'var(--on-surface-variant)', transition: 'all 0.2s', border: 'none', cursor: 'pointer' }}
                title="Share"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--on-surface)' }}>Platform</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {platformLinks.map((link) => (
                <FooterLink key={link.label} to={link.to}>{link.label}</FooterLink>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--on-surface)' }}>Resources</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {resourceLinks.map((link) => (
                <FooterLink key={link.label} to={link.to}>{link.label}</FooterLink>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--on-surface)' }}>Support</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {supportLinks.map((link) => (
                <FooterLink key={link.label} to={link.to}>{link.label}</FooterLink>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--on-surface)' }}>Community</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {communityLinks.map((link) => (
                link.external ? (
                  <a key={link.label} href={link.external} target="_blank" rel="noopener noreferrer" className="footer-link" style={{ fontSize: 14, color: 'var(--on-surface-variant)', transition: 'color 0.2s', textDecoration: 'none' }}>{link.label}</a>
                ) : (
                  <FooterLink key={link.label} to={link.to}>{link.label}</FooterLink>
                )
              ))}
            </div>
          </div>
        </div>

        <div className="footer-bottom" style={{ paddingTop: 24, borderTop: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>&copy; {new Date().getFullYear()} Franchisia. All Rights Reserved.</p>
          <div className="footer-contact" style={{ display: 'flex', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--on-surface-variant)' }}>
              <Mail size={14} />
              <span>{contact?.email || ''}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--on-surface-variant)' }}>
              <Phone size={14} />
              <span>{contact?.phone || ''}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--on-surface-variant)' }}>
              <MapPin size={14} />
              <span>{contact?.address || ''}</span>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .footer-link { color: var(--on-surface-variant); text-decoration: none; }
        .footer-link:hover { color: var(--primary); }
        @media (max-width: 1024px) {
          .footer-grid { gap: 32px !important; grid-template-columns: 2fr 1fr 1fr !important; }
        }
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 24px !important; }
          .footer-grid > div:first-child { grid-column: 1 / -1; }
          .footer-contact { flex-wrap: wrap !important; gap: 12px !important; }
          .site-footer { padding-top: 48px !important; padding-bottom: 24px !important; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .footer-bottom { flex-direction: column !important; text-align: center !important; }
          .footer-contact { justify-content: center !important; }
        }
      `}</style>
    </motion.footer>
  );
}
