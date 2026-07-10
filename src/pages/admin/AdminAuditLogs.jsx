import { useState, useEffect } from 'react';
import { Search, Filter, Shield, Users, Building2, AlertTriangle, Ban, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Pagination from '../../components/ui/Pagination';
import Select from '../../components/ui/Select';

const API = '/api';

const actionIcons = {
  VERIFY_USER: { icon: CheckCircle, color: '#10B981', label: 'Verified User' },
  REJECT_USER: { icon: XCircle, color: '#EF4444', label: 'Rejected User' },
  SUSPEND_USER: { icon: Ban, color: '#F59E0B', label: 'Suspended User' },
  DELETE_USER: { icon: XCircle, color: '#DC2626', label: 'Deleted User' },
  MAKE_ADMIN: { icon: Shield, color: '#8B5CF6', label: 'Made Admin' },
  RESOLVE_REPORT: { icon: CheckCircle, color: '#10B981', label: 'Resolved Report' },
  DISMISS_REPORT: { icon: XCircle, color: '#6B7280', label: 'Dismissed Report' },
  UPDATE_COMPANY: { icon: Building2, color: '#3B82F6', label: 'Updated Company' },
};

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const perPage = 30;

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page, limit: perPage });
        if (actionFilter) params.set('action', actionFilter);
        const res = await fetch(`${API}/admin/audit-logs?${params}`, { credentials: 'include' });
        const data = await res.json();
        if (res.ok) { setLogs(data.logs || []); setTotal(data.total || 0); }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchLogs();
  }, [page, actionFilter]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Audit Logs</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Every administrative action is logged ({total} total)</p>
        </div>
        <div style={{ minWidth: 200 }}>
          <Select
            options={[
              { value: '', label: 'All Actions' },
              { value: 'VERIFY_USER', label: 'Verify User' },
              { value: 'REJECT_USER', label: 'Reject User' },
              { value: 'SUSPEND_USER', label: 'Suspend User' },
              { value: 'DELETE_USER', label: 'Delete User' },
              { value: 'MAKE_ADMIN', label: 'Make Admin' },
              { value: 'RESOLVE_REPORT', label: 'Resolve Report' },
              { value: 'DISMISS_REPORT', label: 'Dismiss Report' },
            ]}
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            placeholder="Filter by action"
          />
        </div>
      </div>

      <Card hover={false} padding="0">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Admin', 'Action', 'Target', 'IP Address', 'Timestamp'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, borderBottom: '2px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>No audit logs yet</td></tr>
              ) : logs.map((log) => {
                const actionInfo = actionIcons[log.action] || { icon: Eye, color: '#6B7280', label: log.action };
                const Icon = actionInfo.icon;
                return (
                  <tr key={log.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar name={log.user?.name || 'Admin'} size={28} />
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{log.user?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon size={14} color={actionInfo.color} />
                        <Badge variant="info">{actionInfo.label}</Badge>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)' }}>{log.recordId || '—'}</td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 13, color: 'var(--text-muted)' }}>{log.ipAddress || '—'}</td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
            <Pagination current={page} total={totalPages} onChange={setPage} />
          </div>
        )}
      </Card>

      {selectedLog && (
        <Card hover={false} padding="20px" style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Action Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14 }}>
            <div><strong>Action:</strong> {selectedLog.action}</div>
            <div><strong>Admin:</strong> {selectedLog.user?.name} ({selectedLog.user?.email})</div>
            <div><strong>Target:</strong> {selectedLog.recordId}</div>
            <div><strong>Table:</strong> {selectedLog.tableName}</div>
            <div><strong>IP:</strong> {selectedLog.ipAddress || '—'}</div>
            <div><strong>Time:</strong> {new Date(selectedLog.createdAt).toLocaleString()}</div>
          </div>
          {selectedLog.newData && (
            <div style={{ marginTop: 12 }}>
              <strong style={{ fontSize: 14 }}>New Data:</strong>
              <pre style={{ marginTop: 8, padding: 12, backgroundColor: 'var(--bg)', borderRadius: 8, fontSize: 12, overflow: 'auto', maxHeight: 200 }}>
                {JSON.stringify(selectedLog.newData, null, 2)}
              </pre>
            </div>
          )}
          {selectedLog.oldData && (
            <div style={{ marginTop: 12 }}>
              <strong style={{ fontSize: 14 }}>Old Data:</strong>
              <pre style={{ marginTop: 8, padding: 12, backgroundColor: 'var(--bg)', borderRadius: 8, fontSize: 12, overflow: 'auto', maxHeight: 200 }}>
                {JSON.stringify(selectedLog.oldData, null, 2)}
              </pre>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
