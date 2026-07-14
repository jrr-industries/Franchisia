import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { MapPin, DollarSign, TrendingUp, Star, Users, Building2, ChevronRight, Search as SearchIcon, MessageSquare, Sparkles, Clock, ShieldCheck, ChevronLeft } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import VerifiedBadge from '../../components/ui/VerifiedBadge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { useIndustries } from '../../hooks/useCMS';

const API = '/api';

function formatCount(n) {
  if (!n && n !== 0) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n;
}

function formatLocation(l) {
  if (l.city || l.state || l.country) {
    return [l.city, l.state, l.country].filter(Boolean).join(', ');
  }
  return l.location || '';
}

function formatInvest(min, max) {
  if (!min && !max) return null;
  const f = (v) => '₹' + Number(v).toLocaleString();
  if (min && max) return `${f(min)} - ${f(max)}`;
  if (min) return `${f(min)}+`;
  return `Up to ${f(max)}`;
}

const roleLabels = {
  franchisor: 'Franchisor', franchisee: 'Franchisee',
  consultant: 'Consultant', investor: 'Investor', supplier: 'Supplier',
};
const isOnline = (lastActiveAt) => lastActiveAt && (Date.now() - new Date(lastActiveAt).getTime()) < 300000;

const s = {
  sectionTitle: { fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
  sectionSub: { fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 },
  scrollRow: { display: 'flex', gap: 12, overflow: 'auto', paddingBottom: 8, scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' },
  card: { padding: 16, cursor: 'pointer', transition: 'all 0.15s' },
  pill: {
    padding: '8px 18px',
    borderRadius: 100,
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    border: '1px solid var(--border)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    transition: 'all 0.15s',
    flexShrink: 0,
    userSelect: 'none',
  },
  listingCard: {
    padding: 20, cursor: 'pointer', transition: 'all 0.15s',
    display: 'flex', flexDirection: 'column', gap: 12,
  },
};

export default function Discover() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { addToast } = useToast();

  const { data: industriesData, isLoading: industriesLoading } = useIndustries();
  const industries = ['All', ...(Array.isArray(industriesData) ? industriesData.filter(Boolean) : [])];

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedIndustry, setSelectedIndustry] = useState(searchParams.get('industry') || 'All');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followStates, setFollowStates] = useState({});
  const [messageTarget, setMessageTarget] = useState(null);
  const [messageContent, setMessageContent] = useState('');
  const [messageSending, setMessageSending] = useState(false);
  const scrollRef = useRef(null);

  const buildParams = useCallback(() => {
    const params = new URLSearchParams({ page, limit: 12 });
    if (search) params.set('search', search);
    if (selectedIndustry && selectedIndustry !== 'All') params.set('industry', selectedIndustry);
    return params;
  }, [page, search, selectedIndustry]);

  useEffect(() => {
    const newParams = new URLSearchParams();
    if (search) newParams.set('search', search);
    if (selectedIndustry && selectedIndustry !== 'All') newParams.set('industry', selectedIndustry);
    setSearchParams(newParams, { replace: true });
  }, [search, selectedIndustry, setSearchParams]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/discover?${buildParams()}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load');
      const d = await res.json();
      setData(d);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [buildParams, addToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedIndustry]);

  const handleIndustryClick = (industry) => {
    setSelectedIndustry(industry);
    setPage(1);
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !messageTarget || messageSending) return;
    setMessageSending(true);
    try {
      const res = await fetch(`${API}/messages/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ recipientId: messageTarget.id, content: messageContent }),
      });
      if (res.ok) {
        addToast('Message request sent!', 'success');
        setMessageTarget(null);
        setMessageContent('');
      } else {
        const err = await res.json();
        addToast(err.error || 'Failed to send', 'error');
      }
    } catch {
      addToast('Failed to send message', 'error');
    } finally {
      setMessageSending(false);
    }
  };

  const handleFollow = async (companyId) => {
    setFollowStates(prev => ({ ...prev, [companyId]: { ...prev[companyId], loading: true } }));
    try {
      const res = await fetch(`${API}/follow/company/${companyId}`, { method: 'POST', credentials: 'include' });
      if (res.ok) {
        const result = await res.json();
        setData(prev => ({
          ...prev,
          companies: prev.companies.map(c => c.id === companyId ? { ...c, isFollowing: result.following } : c),
        }));
        addToast(result.following ? 'Following company' : 'Unfollowed', 'success');
      }
    } catch {} finally {
      setFollowStates(prev => ({ ...prev, [companyId]: { ...prev[companyId], loading: false } }));
    }
  };

  const scrollIndustries = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 240, behavior: 'smooth' });
    }
  };

  const renderListingCard = (l) => {
    const invest = formatInvest(l.investmentMin, l.investmentMax);
    return (
      <Card key={l.id} padding="20px" style={s.listingCard}
        onClick={() => navigate(`/company/${l.company.slug}`)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar name={l.title} src={l.company.logoUrl} size={48} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.title}</span>
              {l.company.isVerified && <VerifiedBadge size={14} />}
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{l.company.name}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 12, color: 'var(--text-secondary)' }}>
          {l.industry && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Building2 size={13} /> {l.industry}</span>}
          {formatLocation(l) && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} /> {formatLocation(l)}</span>}
          {invest && <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent)', fontWeight: 600 }}><DollarSign size={13} /> {invest}</span>}
          {l.roiPercentage && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><TrendingUp size={13} /> ROI: {Number(l.roiPercentage)}%</span>}
        </div>
        <Button variant="primary" size="sm" fullWidth onClick={(e) => { e.stopPropagation(); navigate(`/company/${l.company.slug}`); }}>
          View Details
        </Button>
      </Card>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Discover</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Explore franchise opportunities, companies, and industry professionals.</p>
      </div>

      <div style={{ position: 'relative', marginBottom: 28 }}>
        <SearchIcon size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search franchises, companies, people..."
          style={{
            width: '100%', padding: '14px 16px 14px 44px', fontSize: 15,
            backgroundColor: 'var(--surface)', border: '2px solid var(--border)',
            borderRadius: 'var(--radius-md)', color: 'var(--text)', outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>🏷 Industries</span>
          <div style={{ flex: 1 }} />
          <button onClick={() => scrollIndustries(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, display: 'flex' }} aria-label="Scroll left">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => scrollIndustries(1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, display: 'flex' }} aria-label="Scroll right">
            <ChevronRight size={18} />
          </button>
        </div>
        <div ref={scrollRef} style={{ display: 'flex', gap: 8, overflow: 'auto', paddingBottom: 4, WebkitOverflowScrolling: 'touch' }}>
          {industries.map((ind) => {
            const isActive = selectedIndustry === ind;
            const countData = data?.industryCounts?.find(c => c.industry === ind);
            return (
              <button
                key={ind}
                onClick={() => handleIndustryClick(ind)}
                style={{
                  ...s.pill,
                  backgroundColor: isActive ? 'var(--primary)' : 'var(--surface)',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  borderColor: isActive ? 'var(--primary)' : 'var(--border)',
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                {ind}
                {ind !== 'All' && countData && (
                  <span style={{
                    fontSize: 11,
                    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'var(--background)',
                    padding: '1px 7px',
                    borderRadius: 100,
                  }}>
                    {countData.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 64, textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          Loading opportunities...
        </div>
      ) : (
        <>
          {data?.featured?.length > 0 && (
            <div style={{ marginBottom: 36 }}>
              <h3 style={s.sectionTitle}>
                <Sparkles size={20} style={{ color: 'var(--warning)' }} />
                Featured Franchises
              </h3>
              <div style={s.scrollRow}>
                {data.featured.map((l) => {
                  const invest = formatInvest(l.investmentMin, l.investmentMax);
                  return (
                    <Card key={l.id} padding="16px" style={{ minWidth: 250, flexShrink: 0, cursor: 'pointer', scrollSnapAlign: 'start' }}
                      onClick={() => navigate(`/company/${l.company.slug}`)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <Avatar name={l.title} size={44} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{l.company.name}</div>
                        </div>
                        {l.company.isVerified && <VerifiedBadge size={14} />}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
                        {l.industry && <span>{l.industry}</span>}
                        {invest && <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{invest}</span>}
                        {formatLocation(l) && <span><MapPin size={12} style={{ verticalAlign: 'middle' }} /> {formatLocation(l)}</span>}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {data?.newListings?.length > 0 && (
            <div style={{ marginBottom: 36 }}>
              <h3 style={s.sectionTitle}>
                <Clock size={20} style={{ color: 'var(--info)' }} />
                New Opportunities
              </h3>
              <div style={s.scrollRow}>
                {data.newListings.map((l) => {
                  const invest = formatInvest(l.investmentMin, l.investmentMax);
                  return (
                    <Card key={l.id} padding="16px" style={{ minWidth: 240, flexShrink: 0, cursor: 'pointer', scrollSnapAlign: 'start' }}
                      onClick={() => navigate(`/company/${l.company.slug}`)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <Avatar name={l.title} size={40} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{l.company.name}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {l.industry}{invest ? ` • ${invest}` : ''}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {data?.trending?.length > 0 && (
            <div style={{ marginBottom: 36 }}>
              <h3 style={s.sectionTitle}>
                <TrendingUp size={20} style={{ color: 'var(--accent)' }} />
                Trending Franchises
              </h3>
              <div style={s.scrollRow}>
                {data.trending.map((l) => {
                  const invest = formatInvest(l.investmentMin, l.investmentMax);
                  return (
                    <Card key={l.id} padding="16px" style={{ minWidth: 240, flexShrink: 0, cursor: 'pointer', scrollSnapAlign: 'start' }}
                      onClick={() => navigate(`/company/${l.company.slug}`)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <Avatar name={l.title} size={40} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{l.company.name}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
                        <TrendingUp size={14} /> {l.viewCount || 0} views
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                        {l.industry}{invest ? ` • ${invest}` : ''}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {data?.companies?.length > 0 && (
            <div style={{ marginBottom: 36 }}>
              <h3 style={s.sectionTitle}>
                <ShieldCheck size={20} style={{ color: 'var(--primary)' }} />
                Verified Companies
              </h3>
              <div style={s.scrollRow}>
                {data.companies.map((c) => (
                  <Card key={c.id} padding="16px" style={{ minWidth: 220, flexShrink: 0, scrollSnapAlign: 'start' }}>
                    <Link to={`/company/${c.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <Avatar name={c.name} src={c.logoUrl} size={44} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                          {c.isVerified && <VerifiedBadge size={12} />}
                        </div>
                      </div>
                      {c.industry && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{c.industry}</div>}
                    </Link>
                    <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                      <span>{formatCount(c._count?.followers || 0)} followers</span>
                      <span>{c._count?.listings || 0} listings</span>
                    </div>
                    {user && (
                      <Button variant={c.isFollowing ? 'secondary' : 'primary'} size="sm" fullWidth
                        onClick={() => handleFollow(c.id)}
                        disabled={followStates[c.id]?.loading}>
                        {c.isFollowing ? 'Following' : 'Follow'}
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {data?.recommended?.length > 0 && user && (
            <div style={{ marginBottom: 36 }}>
              <h3 style={s.sectionTitle}>
                <Star size={20} style={{ color: 'var(--warning)' }} />
                Recommended For You
              </h3>
              <div style={s.scrollRow}>
                {data.recommended.map((l) => {
                  const invest = formatInvest(l.investmentMin, l.investmentMax);
                  return (
                    <Card key={l.id} padding="16px" style={{ minWidth: 240, flexShrink: 0, cursor: 'pointer', scrollSnapAlign: 'start' }}
                      onClick={() => navigate(`/company/${l.company.slug}`)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <Avatar name={l.title} size={40} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{l.company.name}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {l.industry}{invest ? ` • ${invest}` : ''}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h3 style={s.sectionTitle}>
              <Building2 size={20} />
              {selectedIndustry !== 'All' ? `${selectedIndustry} Listings` : 'All Listings'}
              {data?.total > 0 && (
                <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)' }}>
                  ({data.total} {data.total === 1 ? 'result' : 'results'})
                </span>
              )}
            </h3>
            {data?.listings?.length > 0 ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: 24 }}>
                  {data.listings.map(renderListingCard)}
                </div>
                {data.totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Pagination current={page} total={data.totalPages} onChange={setPage} />
                  </div>
                )}
              </>
            ) : (
              <Card hover={false} padding="60px 20px" style={{ textAlign: 'center' }}>
                <Building2 size={48} style={{ color: 'var(--text-muted)', marginBottom: 12, opacity: 0.4 }} />
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No listings found</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Try adjusting your filters or search query.</p>
              </Card>
            )}
          </div>
        </>
      )}

      <Modal isOpen={!!messageTarget} onClose={() => { setMessageTarget(null); setMessageContent(''); }} title={`Message ${messageTarget?.name || ''}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Send a message request to {messageTarget?.name}. They will be notified and can choose to accept.
          </p>
          <textarea
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            placeholder="Write your message..."
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)', backgroundColor: 'var(--background)',
              color: 'var(--text)', fontSize: 14, outline: 'none', resize: 'vertical',
              minHeight: 100, fontFamily: 'inherit', boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button variant="secondary" size="sm" onClick={() => { setMessageTarget(null); setMessageContent(''); }}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSendMessage} disabled={!messageContent.trim() || messageSending}>
              {messageSending ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
