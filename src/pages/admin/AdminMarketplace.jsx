import { useState, useEffect } from 'react';
import {
  Briefcase, Search as SearchIcon, Check, X, Star, StarOff, Eye, Trash2,
  FileText, Users, Clock, ChevronDown,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';

const API = '/api';

const statusLabels = {
  pending: { label: 'Pending', variant: 'warning' },
  active: { label: 'Active', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'danger' },
  inactive: { label: 'Inactive', variant: 'default' },
  filled: { label: 'Filled', variant: 'info' },
};

export default function AdminMarketplace() {
  const [tab, setTab] = useState('listings');
  const [listings, setListings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('');
  const perPage = 10;

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: perPage });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (featuredFilter) params.set('featured', featuredFilter);
      const res = await fetch(`${API}/admin/marketplace/listings?${params}`, { credentials: 'include' });
      if (res.ok) { const d = await res.json(); setListings(d.listings || []); setTotal(d.total || 0); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: perPage });
      if (appStatusFilter) params.set('status', appStatusFilter);
      const res = await fetch(`${API}/admin/marketplace/applications?${params}`, { credentials: 'include' });
      if (res.ok) { const d = await res.json(); setApplications(d.applications || []); setTotal(d.total || 0); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (tab === 'listings') fetchListings();
    else fetchApplications();
  }, [tab, page, statusFilter, featuredFilter, appStatusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); if (tab === 'listings') fetchListings(); else fetchApplications(); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleStatus = async (id, status) => {
    try { await fetch(`${API}/admin/marketplace/listings/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ status }) }); fetchListings(); }
    catch (e) { console.error(e); }
  };

  const handleFeature = async (id) => {
    try { await fetch(`${API}/admin/marketplace/listings/${id}/feature`, { method: 'POST', credentials: 'include' }); fetchListings(); }
    catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    try { await fetch(`${API}/admin/marketplace/listings/${id}`, { method: 'DELETE', credentials: 'include' }); fetchListings(); }
    catch (e) { console.error(e); }
  };

  const handleAppStatus = async (id, status) => {
    try { await fetch(`${API}/admin/marketplace/applications/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ status }) }); fetchApplications(); }
    catch (e) { console.error(e); }
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Marketplace</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Manage franchise listings and applications</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        <button onClick={() => { setTab('listings'); setPage(1); }}
          style={{ padding: '10px 20px', fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer', borderRadius: 10, backgroundColor: tab === 'listings' ? 'var(--primary)' : 'transparent', color: tab === 'listings' ? '#fff' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Briefcase size={16} /> Listings
        </button>
        <button onClick={() => { setTab('applications'); setPage(1); }}
          style={{ padding: '10px 20px', fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer', borderRadius: 10, backgroundColor: tab === 'applications' ? 'var(--primary)' : 'transparent', color: tab === 'applications' ? '#fff' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Users size={16} /> Applications
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 250 }}>
          <SearchIcon size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={tab === 'listings' ? 'Search listings...' : 'Search applications...'}
            style={{ width: '100%', padding: '10px 16px 10px 36px', fontSize: 14, color: 'var(--text)', backgroundColor: 'var(--surface)', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)', outline: 'none' }} />
        </div>
        {tab === 'listings' ? (
          <>
            <div style={{ minWidth: 150 }}>
              <Select options={[{ value: '', label: 'All Status' }, { value: 'pending', label: 'Pending' }, { value: 'active', label: 'Active' }, { value: 'rejected', label: 'Rejected' }, { value: 'inactive', label: 'Inactive' }, { value: 'filled', label: 'Filled' }]}
                value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} />
            </div>
            <div style={{ minWidth: 150 }}>
              <Select options={[{ value: '', label: 'All Listings' }, { value: 'true', label: 'Featured' }, { value: 'false', label: 'Not Featured' }]}
                value={featuredFilter} onChange={(e) => { setFeaturedFilter(e.target.value); setPage(1); }} />
            </div>
          </>
        ) : (
          <div style={{ minWidth: 150 }}>
            <Select options={[{ value: '', label: 'All Status' }, { value: 'submitted', label: 'Submitted' }, { value: 'reviewing', label: 'Reviewing' }, { value: 'accepted', label: 'Accepted' }, { value: 'rejected', label: 'Rejected' }, { value: 'withdrawn', label: 'Withdrawn' }]}
              value={appStatusFilter} onChange={(e) => { setAppStatusFilter(e.target.value); setPage(1); }} />
          </div>
        )}
      </div>

      {/* Table */}
      <Card hover={false} padding="0">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {tab === 'listings'
                  ? ['Title', 'Company', 'Status', 'Featured', 'Applications', 'Created', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, borderBottom: '2px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))
                  : ['Applicant', 'Listing', 'Company', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, borderBottom: '2px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : tab === 'listings' && listings.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>No listings found</td></tr>
              ) : tab === 'applications' && applications.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>No applications found</td></tr>
              ) : tab === 'listings' ? (
                listings.map((l) => {
                  const sb = statusLabels[l.status] || { label: l.status, variant: 'default' };
                  return (
                    <tr key={l.id}>
                      <td style={{ padding: '14px 16px', fontSize: 14, borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Briefcase size={16} color="var(--primary)" />
                          <span style={{ fontWeight: 500 }}>{l.title}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 14, borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{l.company?.name || '—'}</td>
                      <td style={{ padding: '14px 16px', fontSize: 14, borderBottom: '1px solid var(--border)' }}><Badge variant={sb.variant}>{sb.label}</Badge></td>
                      <td style={{ padding: '14px 16px', fontSize: 14, borderBottom: '1px solid var(--border)' }}>{l.isFeatured ? <Star size={16} color="#F59E0B" fill="#F59E0B" /> : <StarOff size={16} color="var(--text-muted)" />}</td>
                      <td style={{ padding: '14px 16px', fontSize: 14, borderBottom: '1px solid var(--border)' }}>{l._count?.applications || 0}</td>
                      <td style={{ padding: '14px 16px', fontSize: 13, borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(l.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '14px 16px', fontSize: 14, borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {l.status === 'pending' && (
                            <>
                              <Button variant="primary" size="sm" icon={<Check size={12} />} onClick={() => handleStatus(l.id, 'active')}>Approve</Button>
                              <Button variant="danger" size="sm" icon={<X size={12} />} onClick={() => handleStatus(l.id, 'rejected')}>Reject</Button>
                            </>
                          )}
                          {l.status === 'active' && (
                            <Button variant="ghost" size="sm" onClick={() => handleStatus(l.id, 'inactive')}>Hide</Button>
                          )}
                          <Button variant="ghost" size="sm" icon={l.isFeatured ? <StarOff size={12} /> : <Star size={12} />} onClick={() => handleFeature(l.id)}>
                            {l.isFeatured ? 'Unfeature' : 'Feature'}
                          </Button>
                          <Button variant="ghost" size="sm" icon={<Trash2 size={12} />} onClick={() => handleDelete(l.id)} style={{ color: 'var(--danger)' }}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                applications.map((a) => (
                  <tr key={a.id}>
                    <td style={{ padding: '14px 16px', fontSize: 14, borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontWeight: 500 }}>{a.applicant?.name || a.applicant?.email || 'Unknown'}</span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 14, borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{a.listing?.title || '—'}</td>
                    <td style={{ padding: '14px 16px', fontSize: 14, borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{a.listing?.company?.name || '—'}</td>
                    <td style={{ padding: '14px 16px', fontSize: 14, borderBottom: '1px solid var(--border)' }}><Badge variant={a.status === 'accepted' ? 'success' : a.status === 'rejected' ? 'danger' : a.status === 'reviewing' ? 'info' : 'warning'}>{a.status}</Badge></td>
                    <td style={{ padding: '14px 16px', fontSize: 13, borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '14px 16px', fontSize: 14, borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {a.status === 'submitted' && (
                          <>
                            <Button variant="primary" size="sm" icon={<Check size={12} />} onClick={() => handleAppStatus(a.id, 'accepted')}>Accept</Button>
                            <Button variant="danger" size="sm" icon={<X size={12} />} onClick={() => handleAppStatus(a.id, 'rejected')}>Reject</Button>
                          </>
                        )}
                        {a.status === 'reviewing' && (
                          <>
                            <Button variant="primary" size="sm" onClick={() => handleAppStatus(a.id, 'accepted')}>Accept</Button>
                            <Button variant="danger" size="sm" onClick={() => handleAppStatus(a.id, 'rejected')}>Reject</Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
            <Pagination current={page} total={totalPages} onChange={setPage} />
          </div>
        )}
      </Card>
    </div>
  );
}
