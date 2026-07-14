import { useState, useEffect } from 'react';
import { Search as SearchIcon, Check, X, Eye, Loader2, ChevronLeft, ChevronRight, Briefcase, Users } from 'lucide-react';

const API = '/api/admin/marketplace';

const statusColors = {
  submitted: { bg: '#FEF3C7', color: '#92400E' },
  reviewing: { bg: '#DBEAFE', color: '#1E40AF' },
  accepted: { bg: '#D1FAE5', color: '#065F46' },
  rejected: { bg: '#FEE2E2', color: '#991B1B' },
  withdrawn: { bg: '#F3F4F6', color: '#374151' },
};

export default function AdminApplications() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
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
    const timer = setTimeout(() => { setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleStatus = async (id, status) => {
    try {
      const res = await fetch(`${API}/applications/${id}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify({ status }),
      });
      if (res.ok) { fetchItems(); setSelectedApp(null); }
    } catch (e) { console.error(e); }
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
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search applicants..."
            style={{ width: '100%', padding: '10px 16px 10px 36px', fontSize: 14, color: 'var(--text)', backgroundColor: 'var(--surface)', border: '2px solid var(--border)', borderRadius: 8, outline: 'none' }} />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ padding: '10px 16px', fontSize: 14, borderRadius: 8, border: '2px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text)', outline: 'none' }}>
          <option value="">All Status</option>
          <option value="submitted">Submitted</option>
          <option value="reviewing">Reviewing</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="withdrawn">Withdrawn</option>
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
                    <span style={{ fontWeight: 500 }}>{a.applicant?.name || a.applicant?.email || 'Unknown'}</span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{a.applicant?.email || '—'}</td>
                  <td style={{ padding: '14px 16px', fontSize: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Briefcase size={14} color="var(--primary)" />
                      <span>{a.listing?.title || '—'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{a.listing?.company?.name || '—'}</td>
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
                      <button onClick={() => setSelectedApp(a)}
                        style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Eye size={14} /> View
                      </button>
                      {a.status === 'submitted' && (
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
                      {a.status === 'reviewing' && (
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

      {selectedApp && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
          onClick={() => setSelectedApp(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--surface)', borderRadius: 16, padding: 32, width: '100%', maxWidth: 520 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>Application Details</h2>
              <button onClick={() => setSelectedApp(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, fontSize: 20 }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div><label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Applicant</label><p style={{ fontSize: 15, fontWeight: 600, margin: '4px 0 0' }}>{selectedApp.applicant?.name || 'Unknown'}</p></div>
              <div><label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Email</label><p style={{ fontSize: 14, margin: '4px 0 0' }}>{selectedApp.applicant?.email || '—'}</p></div>
              <div><label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Listing</label><p style={{ fontSize: 14, margin: '4px 0 0' }}>{selectedApp.listing?.title || '—'}</p></div>
              <div><label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Company</label><p style={{ fontSize: 14, margin: '4px 0 0' }}>{selectedApp.listing?.company?.name || '—'}</p></div>
              <div><label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Cover Message</label><p style={{ fontSize: 14, margin: '4px 0 0', color: 'var(--text-secondary)' }}>{selectedApp.coverMessage || 'No message'}</p></div>
              <div><label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Status</label>
                <span style={{ display: 'inline-block', marginTop: 4, padding: '2px 10px', borderRadius: 100, fontSize: 12, fontWeight: 500, backgroundColor: statusColors[selectedApp.status]?.bg || '#F3F4F6', color: statusColors[selectedApp.status]?.color || '#374151' }}>
                  {selectedApp.status}
                </span>
              </div>
              <div><label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Submitted</label><p style={{ fontSize: 14, margin: '4px 0 0' }}>{new Date(selectedApp.createdAt).toLocaleString()}</p></div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 24 }}>
              {selectedApp.status === 'submitted' && (
                <>
                  <button onClick={() => handleStatus(selectedApp.id, 'reviewing')} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', backgroundColor: '#DBEAFE', color: '#1E40AF', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Mark Reviewing</button>
                  <button onClick={() => handleStatus(selectedApp.id, 'rejected')} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', backgroundColor: '#FEE2E2', color: '#991B1B', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Reject</button>
                </>
              )}
              {selectedApp.status === 'reviewing' && (
                <>
                  <button onClick={() => handleStatus(selectedApp.id, 'accepted')} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', backgroundColor: '#D1FAE5', color: '#065F46', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Accept</button>
                  <button onClick={() => handleStatus(selectedApp.id, 'rejected')} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', backgroundColor: '#FEE2E2', color: '#991B1B', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Reject</button>
                </>
              )}
              <button onClick={() => setSelectedApp(null)} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text)', cursor: 'pointer', fontWeight: 500, fontSize: 14 }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
