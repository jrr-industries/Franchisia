import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Search as SearchIcon } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import Select from '../../components/ui/Select';

const API = '/api';

export default function AdminReports() {
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
      const res = await fetch(`${API}/admin/reports?${params}`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok) { setReports(data.reports || []); setTotal(data.total || 0); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, [page, statusFilter]);

  const handleAction = async (id, action) => {
    try {
      await fetch(`${API}/admin/reports/${id}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action }),
      });
      fetchReports();
    } catch (e) { console.error(e); }
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Reports</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Manage user reports and platform issues ({total} total)</p>
        </div>
        <div style={{ minWidth: 180 }}>
          <Select
            options={[
              { value: '', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'dismissed', label: 'Dismissed' },
            ]}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <Card hover={false} padding="0">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Reporter', 'Target', 'Reason', 'Status', 'Date', 'Actions'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, borderBottom: '2px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>No reports found</td></tr>
              ) : reports.map((r) => (
                <tr key={r.id}>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)' }}>{r.reporterId}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)' }}>
                    {r.targetType}: {r.targetId}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <div><strong>{r.reason}</strong></div>
                    {r.description && <div style={{ color: 'var(--text-muted)', marginTop: 2, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</div>}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <Badge variant={r.status === 'pending' ? 'warning' : r.status === 'resolved' ? 'success' : 'default'}>{r.status}</Badge>
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {r.status === 'pending' && (
                        <>
                          <Button variant="primary" size="sm" icon={<CheckCircle size={14} />} onClick={() => handleAction(r.id, 'resolve')}>Resolve</Button>
                          <Button variant="ghost" size="sm" icon={<XCircle size={14} />} onClick={() => handleAction(r.id, 'dismiss')}>Dismiss</Button>
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
