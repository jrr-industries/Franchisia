import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Share2 } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";

function FooterLink({ to, children }) {
  return (
    <Link to={to} className="footer-link" style={{ fontSize: 14, color: 'var(--on-surface-variant)', transition: 'color 0.2s', textDecoration: 'none' }}>
      {children}
    </Link>
  );
}

function parseJSON(value) {
  if (!value) return null;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return null; }
  }
  return value;
}

export default function Footer() {
  const { data: footerSettings } = useQuery({
    queryKey: ["public", "footer"],
    queryFn: () => fetch("/api/public/footer").then(r => r.json()),
    staleTime: 10 * 60 * 1000,
  });

  const quickLinks = parseJSON(footerSettings?.quickLinks) || [];
  const socialLinks = parseJSON(footerSettings?.socialLinks) || [];
  const copyright = footerSettings?.copyright || `\u00a9 ${new Date().getFullYear()} Franchisia. All Rights Reserved.`;
  const aboutText = footerSettings?.aboutText || "India's professional network for the franchise ecosystem. Connect, discover, and grow with verified franchisors, franchisees, investors, consultants, and suppliers.";
  const brandLogo = footerSettings?.logo;
  const contactEmail = footerSettings?.email;
  const contactPhone = footerSettings?.phone;
  const contactAddress = footerSettings?.address;

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
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: `2fr ${quickLinks.length > 0 ? '1fr '.repeat(quickLinks.length).trim() : ''}`, gap: 48, marginBottom: 48 }}>
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 22, color: 'var(--primary)', marginBottom: 16, textDecoration: 'none' }}>
              {brandLogo ? (
                <img src={brandLogo} alt="Franchisia" style={{ height: 32 }} />
              ) : (
                <>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'inline-block' }} />
                  Franchisia
                </>
              )}
            </Link>
            <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', lineHeight: 1.7, marginBottom: 24, maxWidth: 320 }}>
              {aboutText}
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              {(contactEmail || socialLinks.length > 0) && (
                <a href={`mailto:${contactEmail || ''}`} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: 'var(--surface-hover)', color: 'var(--on-surface-variant)', transition: 'all 0.2s', textDecoration: 'none' }} title="Email us">
                  <Mail size={16} />
                </a>
              )}
              <button
                onClick={() => { navigator.share?.({ title: 'Franchisia', text: 'Join the professional franchise network', url: window.location.origin })?.catch(() => {}); }}
                style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: 'var(--surface-hover)', color: 'var(--on-surface-variant)', transition: 'all 0.2s', border: 'none', cursor: 'pointer' }}
                title="Share"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>

          {quickLinks.map((column) => (
            <div key={column.heading || column.title}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--on-surface)' }}>{column.heading || column.title}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(column.links || column.items || []).map((link) =>
                  link.external ? (
                    <a key={link.label || link.title} href={link.external} target="_blank" rel="noopener noreferrer" className="footer-link" style={{ fontSize: 14, color: 'var(--on-surface-variant)', transition: 'color 0.2s', textDecoration: 'none' }}>{link.label || link.title}</a>
                  ) : (
                    <FooterLink key={link.label || link.title} to={link.to || link.href || '#'}>{link.label || link.title}</FooterLink>
                  )
                )}
              </div>
            </div>
          ))}

          {socialLinks.length > 0 && (
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--on-surface)' }}>Community</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {socialLinks.map((link) => (
                  <a key={link.label || link.title} href={link.url || link.href} target="_blank" rel="noopener noreferrer" className="footer-link" style={{ fontSize: 14, color: 'var(--on-surface-variant)', transition: 'color 0.2s', textDecoration: 'none' }}>{link.label || link.title}</a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="footer-bottom" style={{ paddingTop: 24, borderTop: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>{copyright}</p>
          {(contactEmail || contactPhone || contactAddress) ? (
            <div className="footer-contact" style={{ display: 'flex', gap: 24 }}>
              {contactEmail && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--on-surface-variant)' }}>
                  <Mail size={14} />
                  <span>{contactEmail}</span>
                </div>
              )}
              {contactPhone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--on-surface-variant)' }}>
                  <Phone size={14} />
                  <span>{contactPhone}</span>
                </div>
              )}
              {contactAddress && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--on-surface-variant)' }}>
                  <MapPin size={14} />
                  <span>{contactAddress}</span>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
      <style>{`
        .footer-link { color: var(--on-surface-variant); text-decoration: none; }
        .footer-link:hover { color: var(--primary); }
        @media (max-width: 1024px) {
          .footer-grid { gap: 32px !important; }
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
