import { useState, useEffect } from 'react';
import {
  ShieldCheck, Check, X, Eye, FileText, Clock, AlertCircle, MessageSquare,
  Search as SearchIcon, RotateCw, ZoomIn, ZoomOut, Download, ChevronLeft, ChevronRight,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';

const API = '/api';

const roleLabels = {
  franchisor: 'Franchisor', franchisee: 'Franchisee',
  consultant: 'Consultant', investor: 'Investor', supplier: 'Supplier',
};

const rejectionReasons = [
  'Incomplete documentation',
  'Unable to verify identity',
  'Suspicious activity detected',
  'Business not registered',
  'Invalid credentials',
  'Duplicate account',
];

function TabButton({ active, onClick, count, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', fontSize: 14, fontWeight: 500,
        border: 'none', cursor: 'pointer', borderRadius: 10,
        backgroundColor: active ? 'var(--primary)' : 'transparent',
        color: active ? '#fff' : 'var(--text-secondary)',
        transition: 'all 0.2s',
      }}
    >
      {label}
      {count !== undefined && (
        <span style={{
          backgroundColor: active ? 'rgba(255,255,255,0.2)' : 'var(--border)',
          padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600,
        }}>
          {count}
        </span>
      )}
    </button>
  );
}

export default function AdminVerification() {
  const [tab, setTab] = useState('pending');
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [docModal, setDocModal] = useState(null);
  const [docZoom, setDocZoom] = useState(1);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [infoModal, setInfoModal] = useState(null);
  const [infoNotes, setInfoNotes] = useState('');
  const [historyModal, setHistoryModal] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [notification, setNotification] = useState(null);
  const perPage = 10;

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const statusMap = {
    pending: 'pending_admin_review',
    approved: 'verified',
    rejected: 'rejected',
    needs_info: 'need_more_information',
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: perPage, status: statusMap[tab] });
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      const [usersRes, statsRes] = await Promise.all([
        fetch(`${API}/admin/verification/all?${params}`, { credentials: 'include' }),
        fetch(`${API}/admin/verification/stats`, { credentials: 'include' }),
      ]);
      if (usersRes.ok) { const d = await usersRes.json(); setUsers(d.users || []); setTotal(d.total || 0); }
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [tab, page, roleFilter]);
  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchData(); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleReview = async (userId, action, notes) => {
    try {
      const res = await fetch(`${API}/admin/verification/${userId}/review`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ action, notes: notes || null }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        showNotification(err.error || `Failed to ${action}`, 'error');
        return;
      }
      showNotification(action === 'approve' ? 'User verified successfully' : action === 'reject' ? 'User rejected' : 'Info request sent');
      setRejectModal(null);
      setInfoModal(null);
      setSelectedUser(null);
      fetchData();
    } catch (e) {
      showNotification('Network error', 'error');
    }
  };

  const openHistory = async (userId) => {
    try {
      const res = await fetch(`${API}/admin/verification/${userId}/history`, { credentials: 'include' });
      if (res.ok) { const d = await res.json(); setHistoryData(d.history || []); setHistoryModal(userId); }
    } catch (e) { console.error(e); }
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Verification</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Review and manage user verification requests</p>
        </div>
      </div>

      {/* Stats Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Pending', key: 'pending', color: '#F59E0B', bg: '#FEF3C7' },
          { label: 'Approved', key: 'approved', color: '#10B981', bg: '#D1FAE5' },
          { label: 'Rejected', key: 'rejected', color: '#EF4444', bg: '#FEE2E2' },
          { label: 'Needs Info', key: 'needsInfo', color: '#8B5CF6', bg: '#EDE9FE' },
        ].map((s) => (
          <Card key={s.key} hover={false} padding="14px" style={{ textAlign: 'center', cursor: 'pointer', border: tab === s.key ? `2px solid ${s.color}` : 'none' }} onClick={() => { setTab(s.key); setPage(1); }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{stats?.[s.key] ?? '—'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { key: 'pending', label: 'Pending' },
          { key: 'approved', label: 'Approved' },
          { key: 'rejected', label: 'Rejected' },
          { key: 'needs_info', label: 'Needs Info' },
        ].map((t) => (
          <TabButton key={t.key} active={tab === t.key} label={t.label} count={stats?.[t.key] ?? 0} onClick={() => { setTab(t.key); setPage(1); }} />
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 250 }}>
          <SearchIcon size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." style={{ width: '100%', padding: '10px 16px 10px 36px', fontSize: 14, color: 'var(--text)', backgroundColor: 'var(--surface)', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)', outline: 'none' }} />
        </div>
        <div style={{ minWidth: 160 }}>
          <Select options={[
            { value: '', label: 'All Roles' }, { value: 'franchisor', label: 'Franchisor' }, { value: 'franchisee', label: 'Franchisee' },
            { value: 'consultant', label: 'Consultant' }, { value: 'investor', label: 'Investor' }, { value: 'supplier', label: 'Supplier' },
          ]} value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} placeholder="Filter by role" />
        </div>
      </div>

      {/* User List */}
      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
      ) : users.length === 0 ? (
        <Card hover={false} padding="60px 20px" style={{ textAlign: 'center' }}>
          <ShieldCheck size={48} style={{ color: 'var(--text-muted)', marginBottom: 12, opacity: 0.4 }} />
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>All Clear!</h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>No {tab} verification requests.</p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {users.map((u) => (
            <Card key={u.id} hover={false} padding="16px 20px">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <Avatar name={u.name || u.email} size={44} />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{u.name || 'Unnamed'}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{u.email}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                    <Badge variant="info">{roleLabels[u.role] || u.role}</Badge>
                    <Badge variant={u.accountStatus === 'verified' ? 'success' : u.accountStatus === 'rejected' ? 'danger' : u.accountStatus === 'need_more_information' ? 'warning' : 'info'}>
                      {u.accountStatus?.replace(/_/g, ' ') || 'Unknown'}
                    </Badge>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {u.submittedForReviewAt
                    ? `Submitted: ${new Date(u.submittedForReviewAt).toLocaleDateString()}`
                    : `Joined: ${new Date(u.createdAt).toLocaleDateString()}`}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <Button variant="outline" size="sm" icon={<Eye size={14} />} onClick={() => setSelectedUser(u)}>Review</Button>
                  {tab === 'pending' && (
                    <>
                      <Button variant="primary" size="sm" icon={<Check size={14} />} onClick={() => handleReview(u.id, 'approve')}>Approve</Button>
                      <Button variant="danger" size="sm" icon={<X size={14} />} onClick={() => { setRejectModal(u); setRejectReason(''); }}>Reject</Button>
                      <Button variant="ghost" size="sm" icon={<AlertCircle size={14} />} onClick={() => { setInfoModal(u); setInfoNotes(''); }}>Request Info</Button>
                    </>
                  )}
                  {tab === 'rejected' && (
                    <Button variant="primary" size="sm" icon={<Check size={14} />} onClick={() => handleReview(u.id, 'approve')}>Re-approve</Button>
                  )}
                  <Button variant="ghost" size="sm" icon={<Clock size={14} />} onClick={() => openHistory(u.id)}>History</Button>
                </div>
              </div>
            </Card>
          ))}

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
              <Pagination current={page} total={totalPages} onChange={setPage} />
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {selectedUser && (
        <Modal onClose={() => setSelectedUser(null)}>
          <div style={{ padding: 24, maxWidth: 650, width: '90vw', maxHeight: '85vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <Avatar name={selectedUser.name || selectedUser.email} size={52} />
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>{selectedUser.name || 'Unnamed'}</h2>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{selectedUser.email} • {roleLabels[selectedUser.role]}</p>
              </div>
            </div>

            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Documents</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {selectedUser.documents?.length ? selectedUser.documents.map((doc) => (
                <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, backgroundColor: 'var(--bg)', borderRadius: 8 }}>
                  <FileText size={18} color="var(--primary)" />
                  <span style={{ flex: 1, fontSize: 14 }}>{doc.fileName || doc.type}</span>
                  <Button variant="ghost" size="sm" icon={<Eye size={14} />} onClick={() => { setDocModal(doc); setDocZoom(1); }}>View</Button>
                </div>
              )) : <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No documents uploaded.</p>}
            </div>

            {selectedUser.rejectionReason && (
              <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#FEE2E2', borderRadius: 8, fontSize: 13, color: '#DC2626' }}>
                <strong>Previous Rejection:</strong> {selectedUser.rejectionReason}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <Button variant="ghost" onClick={() => setSelectedUser(null)}>Close</Button>
              <Button variant="ghost" icon={<AlertCircle size={14} />} onClick={() => { setInfoModal(selectedUser); setInfoNotes(''); setSelectedUser(null); }}>Request Info</Button>
              <Button variant="primary" icon={<Check size={14} />} onClick={() => handleReview(selectedUser.id, 'approve')}>Approve</Button>
              <Button variant="danger" icon={<X size={14} />} onClick={() => { setRejectModal(selectedUser); setSelectedUser(null); }}>Reject</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Document Viewer */}
      {docModal && (
        <Modal onClose={() => setDocModal(null)}>
          <div style={{ padding: 16, maxWidth: 800, width: '90vw' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>{docModal.fileName || 'Document'}</h3>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setDocZoom(z => Math.max(0.5, z - 0.25))} style={{ background: 'var(--bg)', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }}><ZoomOut size={16} /></button>
                <span style={{ fontSize: 12, display: 'flex', alignItems: 'center' }}>{Math.round(docZoom * 100)}%</span>
                <button onClick={() => setDocZoom(z => Math.min(3, z + 0.25))} style={{ background: 'var(--bg)', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }}><ZoomIn size={16} /></button>
                <button onClick={() => window.open(docModal.url, '_blank')} style={{ background: 'var(--bg)', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }}><Download size={16} /></button>
              </div>
            </div>
            <div style={{ overflow: 'auto', maxHeight: '70vh', display: 'flex', justifyContent: 'center', backgroundColor: 'var(--bg)', borderRadius: 8, padding: 12 }}>
              {docModal.url?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                <img src={docModal.url} alt={docModal.fileName} style={{ maxWidth: '100%', transform: `scale(${docZoom})`, transformOrigin: 'top center', transition: 'transform 0.2s', borderRadius: 4 }} />
              ) : (
                <iframe src={docModal.url} style={{ width: '100%', height: 500, borderRadius: 4, border: 'none' }} title={docModal.fileName} />
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <Modal onClose={() => setRejectModal(null)}>
          <div style={{ padding: 24, maxWidth: 450 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Reject Verification</h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Provide a reason for rejecting {rejectModal.name || rejectModal.email}'s verification.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {rejectionReasons.map((r) => (
                <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, cursor: 'pointer', backgroundColor: rejectReason === r ? 'var(--primary-light)' : 'transparent', border: `2px solid ${rejectReason === r ? 'var(--primary)' : 'var(--border)'}` }}>
                  <input type="radio" name="reason" checked={rejectReason === r} onChange={() => setRejectReason(r)} style={{ accentColor: 'var(--primary)' }} />
                  <span style={{ fontSize: 14 }}>{r}</span>
                </label>
              ))}
            </div>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Or type a custom reason..." style={{ width: '100%', minHeight: 80, padding: 12, fontSize: 14, color: 'var(--text)', backgroundColor: 'var(--surface)', border: '2px solid var(--border)', borderRadius: 8, outline: 'none', resize: 'vertical', marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setRejectModal(null)}>Cancel</Button>
              <Button variant="danger" disabled={!rejectReason.trim()} onClick={() => handleReview(rejectModal.id, 'reject', rejectReason.trim())}><X size={14} /> Reject</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Request Info Modal */}
      {infoModal && (
        <Modal onClose={() => setInfoModal(null)}>
          <div style={{ padding: 24, maxWidth: 450 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Request More Information</h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Specify what additional information {infoModal.name || infoModal.email} needs to provide.
            </p>
            <textarea value={infoNotes} onChange={(e) => setInfoNotes(e.target.value)} placeholder="Describe what documents or information are needed..." style={{ width: '100%', minHeight: 120, padding: 12, fontSize: 14, color: 'var(--text)', backgroundColor: 'var(--surface)', border: '2px solid var(--border)', borderRadius: 8, outline: 'none', resize: 'vertical', marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setInfoModal(null)}>Cancel</Button>
              <Button variant="primary" disabled={!infoNotes.trim()} onClick={() => handleReview(infoModal.id, 'request_info', infoNotes.trim())}>Send Request</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          padding: '12px 20px', borderRadius: 8, fontSize: 14, fontWeight: 500,
          backgroundColor: notification.type === 'error' ? '#DC2626' : '#10B981',
          color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transition: 'all 0.3s',
        }}>
          {notification.message}
        </div>
      )}

      {/* History Modal */}
      {historyModal && (
        <Modal onClose={() => { setHistoryModal(null); setHistoryData([]); }}>
          <div style={{ padding: 24, maxWidth: 550, width: '90vw', maxHeight: '80vh', overflow: 'auto' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Verification History</h2>
            {historyData.length === 0 ? (
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No history records found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {historyData.map((h) => (
                  <div key={h.id} style={{ display: 'flex', gap: 12, padding: 12, backgroundColor: 'var(--bg)', borderRadius: 8 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: h.action === 'approved' ? '#D1FAE5' : h.action === 'rejected' ? '#FEE2E2' : '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {h.action === 'approved' ? <Check size={16} color="#10B981" /> : h.action === 'rejected' ? <X size={16} color="#EF4444" /> : h.action === 'requested_info' ? <AlertCircle size={16} color="#F59E0B" /> : <Clock size={16} color="#8B5CF6" />}
                    </div>
                    <div style={{ fontSize: 13, flex: 1 }}>
                      <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{h.action.replace(/_/g, ' ')}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{h.previousStatus} → {h.currentStatus}</div>
                      {h.adminNotes && <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 2 }}>"{h.adminNotes}"</div>}
                      <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>by {h.reviewedBy} • {new Date(h.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
