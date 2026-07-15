import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Check, X, Eye, Loader2, ChevronLeft, ChevronRight, Briefcase, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';

const API = '/api/admin/marketplace';

const statusColors = {
  pending: { bg: '#FEF3C7', color: '#92400E' },
  reviewing: { bg: '#DBEAFE', color: '#1E40AF' },
  shortlisted: { bg: '#D1FAE5', color: '#065F46' },
  interview: { bg: '#F3E8FF', color: '#6B21A8' },
  accepted: { bg: '#D1FAE5', color: '#065F46' },
  rejected: { bg: '#FEE2E2', color: '#991B1B' },
  withdrawn: { bg: '#F3F4F6', color: '#374151' },
};

export default function AdminApplications() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const perPage = 10;

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: perPage });
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);
      const res = await fetch(`${API}/applications?${params}`, { credentials: 'include' });
      if (res.ok) { const d = await res.json(); setItems(d.applications || []); setTotal(d.total || 0); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, [page, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => { if (search !== undefined) setPage(1); fetchItems(); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/applications/${id}/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify({ status }),
      });
      if (res.ok) {
        addToast(`Application ${status}`, 'success');
        fetchItems();
      }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this application permanently?')) return;
    try {
      const res = await fetch(`${API}/applications/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { addToast('Application deleted', 'success'); fetchItems(); }
      else addToast('Failed to delete', 'error');
    } catch { addToast('Network error', 'error'); }
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Applications</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Review and manage franchise applications</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{total} total</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <SearchIcon size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by applicant name, email, or listing title..."
            style={{ width: '100%', padding: '10px 16px 10px 36px', fontSize: 14, color: 'var(--text)', backgroundColor: 'var(--surface)', border: '2px solid var(--border)', borderRadius: 8, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ padding: '10px 16px', fontSize: 14, borderRadius: 8, border: '2px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text)', outline: 'none' }}>
          <option value="">All Status</option>
          {Object.keys(statusColors).map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div style={{ backgroundColor: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Applicant', 'Email', 'Listing', 'Company', 'Status', 'Date', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, borderBottom: '2px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
              </td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>No applications found</td></tr>
            ) : items.map((a) => {
              const sc = statusColors[a.status] || { bg: '#F3F4F6', color: '#374151' };
              return (
                <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 16px', fontSize: 14 }}>
                    <span style={{ fontWeight: 500 }}>{a.applicant?.name || a.personalInfo?.fullName || a.applicant?.email || 'Unknown'}</span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{a.applicant?.email || a.personalInfo?.email || '—'}</td>
                  <td style={{ padding: '14px 16px', fontSize: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Briefcase size={14} color="var(--primary)" />
                      <span>{a.listing?.title || '—'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{a.listing?.company?.name || a.company?.name || '—'}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13 }}>
                    <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 100, fontSize: 12, fontWeight: 500, backgroundColor: sc.bg, color: sc.color }}>
                      {a.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(a.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14 }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => navigate(`/dashboard/application/${a.id}`)}
                        style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Eye size={14} /> View
                      </button>
                      {a.status === 'pending' && (
                        <>
                          <button onClick={() => handleStatus(a.id, 'reviewing')}
                            style={{ padding: '6px 10px', borderRadius: 6, border: 'none', backgroundColor: '#DBEAFE', color: '#1E40AF', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Check size={14} /> Review
                          </button>
                          <button onClick={() => handleStatus(a.id, 'rejected')}
                            style={{ padding: '6px 10px', borderRadius: 6, border: 'none', backgroundColor: '#FEE2E2', color: '#991B1B', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <X size={14} /> Reject
                          </button>
                        </>
                      )}
                      {(a.status === 'reviewing' || a.status === 'shortlisted') && (
                        <>
                          <button onClick={() => handleStatus(a.id, 'accepted')}
                            style={{ padding: '6px 10px', borderRadius: 6, border: 'none', backgroundColor: '#D1FAE5', color: '#065F46', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Check size={14} /> Accept
                          </button>
                          <button onClick={() => handleStatus(a.id, 'rejected')}
                            style={{ padding: '6px 10px', borderRadius: 6, border: 'none', backgroundColor: '#FEE2E2', color: '#991B1B', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <X size={14} /> Reject
                          </button>
                        </>
                      )}
                      <button onClick={() => handleDelete(a.id)}
                        style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #FEE2E2', backgroundColor: 'transparent', color: '#991B1B', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 24 }}>
          <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}
            style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text)', cursor: page > 1 ? 'pointer' : 'not-allowed', fontSize: 13, opacity: page > 1 ? 1 : 0.5 }}>
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text)', cursor: page < totalPages ? 'pointer' : 'not-allowed', fontSize: 13, opacity: page < totalPages ? 1 : 0.5 }}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}