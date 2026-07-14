import { useState } from 'react';
import { motion } from "framer-motion";
import { Search, Building2, Users, MapPin, BadgeCheck, Loader2 } from 'lucide-react';
import Button from '../components/ui/Button';
import { useNavigate, Link } from 'react-router-dom';
import { useIndustries, usePartners, usePublicSettings, getSectionContent } from '../hooks/useCMS';
import { useQuery } from "@tanstack/react-query";

const API = '/api';

async function fetchJSON(url) {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
}

export default function SearchSection() {
  const navigate = useNavigate();
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [investment, setInvestment] = useState('');

  const { data: industriesData, isLoading } = useIndustries();
  const { data: locationsData } = useQuery({
    queryKey: ["cms", "locations-list"],
    queryFn: () => fetchJSON(`${API}/public/locations`),
    staleTime: 30 * 60 * 1000,
    select: (d) => ['All Locations', ...Object.keys(d || {})],
  });
  const { data: investmentsData } = useQuery({
    queryKey: ["cms", "investment-ranges"],
    queryFn: () => fetchJSON(`${API}/public/investment-ranges`),
    staleTime: 30 * 60 * 1000,
  });
  const { data: partners, isLoading: partnersLoading } = usePartners();
  const { data: sectionSettings } = usePublicSettings();

  const locations = locationsData || ['All Locations'];
  const investments = investmentsData || [];
  const industryList = industriesData?.items || industriesData || [];

  const hasFilters = industry || location || investment;
  const filteredPartners = hasFilters ? (partners || []).filter((p) => {
    if (industry && p.industry !== industry) return false;
    if (location && p.city !== location) return false;
    if (investment && p.investmentRange !== investment) return false;
    return true;
  }) : [];

  return (
    <section style={{ padding: '80px 0' }}>
      <div className="container" style={{ textAlign: 'center' }}>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: 'var(--on-surface)' }}>{getSectionContent(sectionSettings, 'search', { heading: 'Find Your Next Opportunity' }).heading}</h2>
          <p style={{ fontSize: 16, color: 'var(--on-surface-variant)', maxWidth: 600, margin: '0 auto' }}>
            {getSectionContent(sectionSettings, 'search', { description: 'Browse hundreds of franchise opportunities. Filter by industry, location, and investment range.' }).description}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
          className="search-section-inner" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', backgroundColor: 'var(--surface)', border: '1px solid var(--outline-variant)', borderRadius: 12, padding: 24, maxWidth: 900, margin: '0 auto' }}>
          <select
            value={industry}
            onChange={(e) => { setIndustry(e.target.value); }}
            disabled={isLoading}
            style={{
              flex: 1, minWidth: 160, padding: '12px 16px', fontSize: 14,
              backgroundColor: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)',
              borderRadius: 8, color: 'var(--on-surface)', cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="">Industry</option>
            {industryList.map((opt) => {
              const label = typeof opt === 'string' ? opt : opt.name || opt.label || opt;
              const value = typeof opt === 'string' ? opt : opt.slug || opt.name || opt;
              return <option key={value} value={value}>{label}</option>;
            })}
          </select>
          <select
            value={location}
            onChange={(e) => { setLocation(e.target.value); }}
            style={{
              flex: 1, minWidth: 160, padding: '12px 16px', fontSize: 14,
              backgroundColor: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)',
              borderRadius: 8, color: 'var(--on-surface)', cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="">Location</option>
            {locations.filter(l => l !== 'All Locations').map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <select
            value={investment}
            onChange={(e) => { setInvestment(e.target.value); }}
            style={{
              flex: 1, minWidth: 160, padding: '12px 16px', fontSize: 14,
              backgroundColor: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)',
              borderRadius: 8, color: 'var(--on-surface)', cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="">Investment Range</option>
            {(Array.isArray(investments) ? investments : []).filter(i => {
              const label = typeof i === 'string' ? i : i.label || '';
              return label !== 'Any Investment';
            }).map((opt) => {
              const label = typeof opt === 'string' ? opt : opt.label || opt;
              const value = typeof opt === 'string' ? opt : opt.value || opt;
              return <option key={value} value={value}>{label}</option>;
            })}
          </select>
          <Button
            className="search-btn"
            icon={<Search size={18} />}
            onClick={() => navigate('/discover')}
          >
            Search Marketplace
          </Button>
        </motion.div>

        {hasFilters && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginTop: 48 }}>
            {partnersLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <Loader2 size={28} className="spin" color="var(--primary)" />
              </div>
            ) : filteredPartners.length > 0 ? (
              <>
                <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20, color: 'var(--on-surface)', textAlign: 'left' }}>
                  Matching Partners ({filteredPartners.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                  {filteredPartners.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.04 }}
                      whileHover={{ y: -3 }}
                      style={{ padding: 20, borderRadius: 12, border: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface)', textAlign: 'left' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        {p.logoUrl ? (
                          <img src={p.logoUrl} alt={p.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Building2 size={18} color="var(--primary)" />
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                            {p.isVerified && <BadgeCheck size={13} color="var(--primary)" />}
                          </div>
                          <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{p.industry}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', lineHeight: 1.5, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {p.description || 'Franchise opportunity partner.'}
                      </p>
                      <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--on-surface-variant)', marginBottom: 12 }}>
                        {p._count?.followers !== undefined && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Users size={13} /> {p._count.followers}</span>}
                        {p.city && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={13} /> {p.city}</span>}
                      </div>
                      <Link to={`/company/${p.slug}`} style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
                        View Profile &rarr;
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--on-surface-variant)' }}>
                <Building2 size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <p style={{ fontSize: 15 }}>No partners match your current filters. Try adjusting your criteria.</p>
              </div>
            )}
          </motion.div>
        )}

        <style>{`
          @media (max-width: 768px) {
            .search-section-inner { flex-direction: column !important; align-items: stretch !important; padding: 16px !important; }
            .search-section-inner select { min-width: 100% !important; }
            .search-btn { width: 100% !important; justify-content: center !important; }
          }
        `}</style>
      </div>
    </section>
  );
}
