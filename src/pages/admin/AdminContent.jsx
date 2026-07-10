import { useState, useEffect } from 'react';
import { Flag, Search as SearchIcon, Eye, EyeOff, Check, X, FileText, Building2, User } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';

const API = '/api';

export default function AdminContent() {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const perPage = 20;

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: perPage });
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`${API}/admin/content/reported?${params}`, { credentials: 'include' });
      if (res.ok) { const d = await res.json(); setReports(d.reports || []); setTotal(d.total || 0); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, [page, statusFilter]);

  const handleHide = async (type, id) => {
    try { await fetch(`${API}/admin/content/${type}/${id}/hide`, { method: 'PATCH', credentials: 'include' }); fetchReports(); }
    catch (e) { console.error(e); }
  };

  const handleShow = async (type, id) => {
    try { await fetch(`${API}/admin/content/${type}/${id}/show`, { method: 'PATCH', credentials: 'include' }); fetchReports(); }
    catch (e) { console.error(e); }
  };

  const handleResolve = async (id, action) => {
    try { await fetch(`${API}/admin/reports/${id}/resolve`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ action }) }); fetchReports(); }
    catch (e) { console.error(e); }
  };

  const targetIcon = (type) => {
    if (type === 'listing') return <FileText size={14} color="#3B82F6" />;
    if (type === 'company') return <Building2 size={14} color="#EC4899" />;
    return <User size={14} color="#8B5CF6" />;
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h1 style={{ fontSize: 24, fontWeight: 700 }}>Content Moderation</h1><p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Review and moderate reported content</p></div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ minWidth: 180 }}>
          <Select options={[{ value: '', label: 'All Status' }, { value: 'pending', label: 'Pending' }, { value: 'resolved', label: 'Resolved' }, { value: 'dismissed', label: 'Dismissed' }]}
            value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} />
        </div>
      </div>

      <Card hover={false} padding="0">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Reporter', 'Target Type', 'Target', 'Reason', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, borderBottom: '2px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>No reported content</td></tr>
              ) : reports.map((r) => (
                <tr key={r.id}>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 13 }}>{r.reporter?.name || r.reporterId}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {targetIcon(r.targetType)} {r.targetType}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)' }}>
                    {r.target?.name || r.target?.title || r.targetId}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <div><strong>{r.reason}</strong></div>
                    {r.description && <div style={{ color: 'var(--text-muted)', fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</div>}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <Badge variant={r.status === 'pending' ? 'warning' : r.status === 'resolved' ? 'success' : 'default'}>{r.status}</Badge>
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {r.targetType !== 'user' && (
                        r.target?.status === 'inactive' || r.target?.status === 'suspended'
                          ? <Button variant="ghost" size="sm" icon={<Eye size={12} />} onClick={() => handleShow(r.targetType, r.targetId)}>Show</Button>
                          : <Button variant="ghost" size="sm" icon={<EyeOff size={12} />} onClick={() => handleHide(r.targetType, r.targetId)}>Hide</Button>
                      )}
                      {r.status === 'pending' && (
                        <>
                          <Button variant="primary" size="sm" icon={<Check size={12} />} onClick={() => handleResolve(r.id, 'resolve')}>Resolve</Button>
                          <Button variant="ghost" size="sm" icon={<X size={12} />} onClick={() => handleResolve(r.id, 'dismiss')}>Dismiss</Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
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
