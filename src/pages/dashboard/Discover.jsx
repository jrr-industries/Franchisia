import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, DollarSign, TrendingUp, Star, Users, Building2, ChevronRight, Search as SearchIcon, MessageSquare } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import VerifiedBadge from '../../components/ui/VerifiedBadge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';

const API = '/api';

function formatCount(n) {
  if (!n && n !== 0) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n;
}

function formatInvest(min, max) {
  if (!min && !max) return null;
  const f = (v) => '$' + Number(v).toLocaleString();
  if (min && max) return `${f(min)} - ${f(max)}`;
  if (min) return `${f(min)}+`;
  return `Up to ${f(max)}`;
}

const roleLabels = {
  franchisor: 'Franchisor', franchisee: 'Franchisee',
  consultant: 'Consultant', investor: 'Investor', supplier: 'Supplier',
};

export default function Discover() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ industry: '', investment: '', country: '', city: '', verified: '', role: '' });
  const [followStates, setFollowStates] = useState({});

  const buildParams = useCallback(() => {
    const params = new URLSearchParams({ page, limit: 12 });
    if (search) params.set('search', search);
    if (filters.industry) params.set('industry', filters.industry);
    if (filters.country) params.set('country', filters.country);
    if (filters.city) params.set('city', filters.city);
    if (filters.verified) params.set('verified', filters.verified);
    if (filters.role) params.set('role', filters.role);
    if (filters.investment === 'under-50k') params.set('maxInvestment', '50000');
    else if (filters.investment === '50k-150k') { params.set('minInvestment', '50000'); params.set('maxInvestment', '150000'); }
    else if (filters.investment === '150k-500k') { params.set('minInvestment', '150000'); params.set('maxInvestment', '500000'); }
    else if (filters.investment === '500k-plus') params.set('minInvestment', '500000');
    return params;
  }, [page, search, filters]);

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
  }, [search]);

  const handleFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleFollow = async (companyId) => {
    setFollowStates(prev => ({ ...prev, [companyId]: { ...prev[companyId], loading: true } }));
    const wasFollowing = data?.companies?.find(c => c.id === companyId)?.isFollowing;
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

  const s = {
    sectionTitle: { fontSize: 16, fontWeight: 700, marginBottom: 16 },
    sectionSub: { fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 },
    card: { padding: 16, cursor: 'pointer', transition: 'all 0.15s' },
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Discover</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Find franchise opportunities, companies, and industry professionals.</p>
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ width: 240, flexShrink: 0 }}>
          <Card hover={false}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Filters</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Select label="Industry" options={[
                { value: '', label: 'All Industries' }, { value: 'Fast Food', label: 'Fast Food' },
                { value: 'Retail', label: 'Retail' }, { value: 'Fitness', label: 'Fitness' },
                { value: 'Hospitality', label: 'Hospitality' }, { value: 'Technology', label: 'Technology' },
                { value: 'Healthcare', label: 'Healthcare' }, { value: 'Education', label: 'Education' },
              ]} value={filters.industry} onChange={(e) => handleFilter('industry', e.target.value)} />
              <Select label="Investment" options={[
                { value: '', label: 'Any' }, { value: 'under-50k', label: 'Under $50K' },
                { value: '50k-150k', label: '$50K - $150K' }, { value: '150k-500k', label: '$150K - $500K' },
                { value: '500k-plus', label: '$500K+' },
              ]} value={filters.investment} onChange={(e) => handleFilter('investment', e.target.value)} />
              <Select label="Country" options={[
                { value: '', label: 'All Countries' }, { value: 'USA', label: 'United States' },
                { value: 'Canada', label: 'Canada' }, { value: 'UK', label: 'United Kingdom' },
                { value: 'Australia', label: 'Australia' },
              ]} value={filters.country} onChange={(e) => handleFilter('country', e.target.value)} />
              <Select label="City" options={[
                { value: '', label: 'All Cities' }, { value: 'New York', label: 'New York' },
                { value: 'Los Angeles', label: 'Los Angeles' }, { value: 'Chicago', label: 'Chicago' },
                { value: 'Miami', label: 'Miami' }, { value: 'Houston', label: 'Houston' },
              ]} value={filters.city} onChange={(e) => handleFilter('city', e.target.value)} />
              <Select label="Verification" options={[
                { value: '', label: 'All' }, { value: 'true', label: 'Verified Only' },
              ]} value={filters.verified} onChange={(e) => handleFilter('verified', e.target.value)} />
              <Select label="Role" options={[
                { value: '', label: 'All Roles' }, { value: 'franchisor', label: 'Franchisor' },
                { value: 'investor', label: 'Investor' }, { value: 'supplier', label: 'Supplier' },
                { value: 'consultant', label: 'Consultant' },
              ]} value={filters.role} onChange={(e) => handleFilter('role', e.target.value)} />
              <Button variant="secondary" size="sm" fullWidth onClick={() => { setFilters({ industry: '', investment: '', country: '', city: '', verified: '', role: '' }); setPage(1); }}>
                Clear Filters
              </Button>
            </div>
          </Card>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <SearchIcon size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search franchises, companies, people..." style={{ width: '100%', padding: '10px 16px 10px 36px', fontSize: 14, backgroundColor: 'var(--surface)', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', outline: 'none' }} />
          </div>

          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          ) : (
            <>
              {data?.featured?.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                  <h3 style={s.sectionTitle}>Featured Franchises</h3>
                  <div style={{ display: 'flex', gap: 12, overflow: 'auto', paddingBottom: 8 }}>
                    {data.featured.map((l) => {
                      const invest = formatInvest(l.investmentMin, l.investmentMax);
                      return (
                        <Card key={l.id} padding="16px" style={{ minWidth: 240, flexShrink: 0, cursor: 'pointer' }}
                          onClick={() => navigate(`/company/${l.company.slug}`)}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                            <Avatar name={l.title} size={40} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.title}</div>
                              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{l.company.name}</div>
                            </div>
                            {l.company.isVerified && <VerifiedBadge size={14} />}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
                            {l.industry && <span>{l.industry}</span>}
                            {invest && <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{invest}</span>}
                            {l.location && <span><MapPin size={12} style={{ verticalAlign: 'middle' }} /> {l.location}</span>}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {data?.recommendedUsers?.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                  <h3 style={s.sectionTitle}>Recommended Professionals</h3>
                  <div style={{ display: 'flex', gap: 12, overflow: 'auto', paddingBottom: 8 }}>
                    {data.recommendedUsers.map((u) => (
                      <Card key={u.id} padding="16px" style={{ minWidth: 210, flexShrink: 0, cursor: 'default' }}>
                        <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate(`/profile?id=${u.id}`)}>
                          <Avatar name={u.name} src={u.image} size={48} style={{ margin: '0 auto 8px' }} />
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                          {u.verified && <VerifiedBadge size={12} />}
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{roleLabels[u.role] || u.role}</div>
                          {u.headline && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.3 }}>{u.headline}</div>}
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{formatCount(u.followerCount)} followers</div>
                        </div>
                        {user && u.id !== user.id && (
                          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                            <Button variant={u._isFollowing ? 'secondary' : 'primary'} size="sm"
                              style={{ flex: 1 }}
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  const res = await fetch(`${API}/follow/user/${u.id}`, { method: 'POST', credentials: 'include' });
                                  if (res.ok) {
                                    const d = await res.json();
                                    setData(prev => ({
                                      ...prev,
                                      recommendedUsers: prev.recommendedUsers.map(x => x.id === u.id ? { ...x, _isFollowing: d.following } : x),
                                    }));
                                    addToast(d.following ? 'Following user' : 'Unfollowed', 'success');
                                  }
                                } catch {}
                              }}>
                              {u._isFollowing ? 'Following' : 'Follow'}
                            </Button>
                            <Button variant="outline" size="sm"
                              style={{ padding: '0 8px', minWidth: 0 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/messages?userId=${u.id}`);
                              }}
                              title="Send message">
                              <MessageSquare size={14} />
                            </Button>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {data?.companies?.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                  <h3 style={s.sectionTitle}>Recommended Companies</h3>
                  <div style={{ display: 'flex', gap: 12, overflow: 'auto', paddingBottom: 8 }}>
                    {data.companies.map((c) => (
                      <Card key={c.id} padding="16px" style={{ minWidth: 220, flexShrink: 0 }}>
                        <Link to={`/company/${c.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                            <Avatar name={c.name} src={c.logoUrl} size={40} />
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

              {data?.trending?.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                  <h3 style={s.sectionTitle}>Trending Franchises</h3>
                  <div style={{ display: 'flex', gap: 12, overflow: 'auto', paddingBottom: 8 }}>
                    {data.trending.map((l) => {
                      const invest = formatInvest(l.investmentMin, l.investmentMax);
                      return (
                        <Card key={l.id} padding="16px" style={{ minWidth: 240, flexShrink: 0, cursor: 'pointer' }}
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
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                            {l.industry}{invest ? ` • ${invest}` : ''}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <h3 style={s.sectionTitle}>All Listings</h3>
                {data?.listings?.length > 0 ? (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
                      {data.listings.map((l) => {
                        const invest = formatInvest(l.investmentMin, l.investmentMax);
                        return (
                          <Card key={l.id} padding="20px" style={{ cursor: 'pointer' }}
                            onClick={() => navigate(`/company/${l.company.slug}`)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                              <Avatar name={l.title} src={l.company.logoUrl} size={52} />
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ fontWeight: 600, fontSize: 15 }}>{l.title}</span>
                                  {l.company.isVerified && <VerifiedBadge size={14} />}
                                </div>
                                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{l.company.name}</span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                              {l.industry && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}><Building2 size={14} /> {l.industry}</div>}
                              {l.location && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}><MapPin size={14} /> {l.location}</div>}
                              {invest && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}><DollarSign size={14} /> {invest}</div>}
                              {l.roiPercentage && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}><TrendingUp size={14} /> ROI: {Number(l.roiPercentage)}%</div>}
                            </div>
                            <Button variant="primary" size="sm" fullWidth onClick={(e) => { e.stopPropagation(); navigate(`/company/${l.company.slug}`); }}>
                              View Details
                            </Button>
                          </Card>
                        );
                      })}
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
        </div>
      </div>
    </div>
  );
}
