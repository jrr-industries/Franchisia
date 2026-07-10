import { useState, useEffect } from 'react';
import {
  MoreHorizontal, Eye, Edit3, Mail, UserX, UserCheck, Shield, ShieldOff, Trash2,
  Search as SearchIcon, CheckSquare, Square, Bell, X, Activity, FileText, Clock, AlertCircle,
  Check, ZoomIn, ZoomOut, RotateCw, Download, ShieldCheck, Save,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import Dropdown, { DropdownItem } from '../../components/ui/Dropdown';
import Modal from '../../components/ui/Modal';
import VerifiedBadge from '../../components/ui/VerifiedBadge';

const API = '/api';

const statusBadge = {
  pending_email_verification: { label: 'Pending Email', variant: 'warning' },
  pending_phone_verification: { label: 'Pending Phone', variant: 'warning' },
  pending_profile_completion: { label: 'Incomplete', variant: 'warning' },
  pending_admin_review: { label: 'Pending Review', variant: 'info' },
  verified: { label: 'Verified', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'danger' },
  need_more_information: { label: 'Needs Info', variant: 'warning' },
};

const roleLabels = {
  admin: 'Admin', franchisor: 'Franchisor', franchisee: 'Franchisee',
  consultant: 'Consultant', investor: 'Investor', supplier: 'Supplier',
};

function getDocumentTypeIcon(type) {
  if (!type) return FileText;
  const t = type.toLowerCase();
  if (t.includes('license') || t.includes('certification')) return ShieldCheck;
  if (t.includes('registration') || t.includes('incorporation')) return FileText;
  if (t.includes('resume') || t.includes('cv')) return User;
  return FileText;
}

function getDocumentTypeColor(type) {
  if (!type) return 'var(--text-secondary)';
  const t = type.toLowerCase();
  if (t.includes('license') || t.includes('certification')) return '#8B5CF6';
  if (t.includes('registration') || t.includes('incorporation')) return '#3B82F6';
  if (t.includes('resume') || t.includes('cv')) return '#10B981';
  if (t.includes('identity') || t.includes('id')) return '#F59E0B';
  return 'var(--text-secondary)';
}

const rejectionReasons = [
  'Incomplete documentation',
  'Unable to verify identity',
  'Suspicious activity detected',
  'Business not registered',
  'Invalid credentials',
  'Duplicate account',
];

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px', fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer',
        borderRadius: 8, backgroundColor: active ? 'var(--primary)' : 'transparent',
        color: active ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s',
      }}
    >
      {children}
    </button>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [confirmModal, setConfirmModal] = useState(null);
  const [profileModal, setProfileModal] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [profileTab, setProfileTab] = useState('overview');
  const [notifyModal, setNotifyModal] = useState(null);
  const [docModal, setDocModal] = useState(null);
  const [docZoom, setDocZoom] = useState(1);
  const [docRotate, setDocRotate] = useState(0);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [infoModal, setInfoModal] = useState(null);
  const [infoNotes, setInfoNotes] = useState('');
  const [notification, setNotification] = useState(null);
  const [savingNotes, setSavingNotes] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');
  const perPage = 10;

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

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
      setProfileModal(null);
      fetchUsers();
    } catch (e) {
      showNotification('Network error', 'error');
    }
  };


  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: perPage });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (roleFilter) params.set('role', roleFilter);
      const res = await fetch(`${API}/admin/users?${params}`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setSelected(new Set());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page, roleFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === users.length) setSelected(new Set());
    else setSelected(new Set(users.map(u => u.id)));
  };

  const handleBulkAction = async (action) => {
    try {
      await fetch(`${API}/admin/users/bulk-action`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ userIds: Array.from(selected), action }),
      });
      setSelected(new Set());
      fetchUsers();
    } catch (err) { console.error(err); }
  };

  const handleToggleActive = async (userId, currentActive) => {
    try {
      await fetch(`${API}/admin/users/${userId}/toggle-active`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ isActive: !currentActive }) });
      fetchUsers();
    } catch (err) { console.error(err); }
  };

  const handleMakeAdmin = async (userId) => {
    try {
      await fetch(`${API}/admin/users/${userId}/make-admin`, { method: 'PATCH', credentials: 'include' });
      setConfirmModal(null);
      fetchUsers();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (userId) => {
    try {
      await fetch(`${API}/admin/users/${userId}`, { method: 'DELETE', credentials: 'include' });
      setConfirmModal(null);
      fetchUsers();
    } catch (err) { console.error(err); }
  };

  const handleSendNotification = async () => {
    if (!notifyModal?.title || !notifyModal?.body) return;
    try {
      await fetch(`${API}/admin/send-announcement`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ title: notifyModal.title, body: notifyModal.body, targets: 'all' }),
      });
      setNotifyModal(null);
    } catch (err) { console.error(err); }
  };

  const openProfile = async (user) => {
    setProfileModal(user);
    setProfileData(null);
    setProfileTab('overview');
    setInternalNotes(user.verificationNotes || '');
    try {
      const res = await fetch(`${API}/admin/users/${user.id}/profile`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
        if (data.user?.verificationNotes) setInternalNotes(data.user.verificationNotes);
      }
    } catch (e) { console.error(e); }
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Users</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Manage all platform users ({total} total)</p>
        </div>
      </div>

      <Card hover={false} padding="20px" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 250 }}>
            <SearchIcon size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." style={{ width: '100%', padding: '10px 16px 10px 36px', fontSize: 14, color: 'var(--text)', backgroundColor: 'var(--surface)', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)', outline: 'none' }} />
          </div>
          <div style={{ minWidth: 160 }}>
            <Select options={[{ value: '', label: 'All Roles' }, { value: 'franchisor', label: 'Franchisor' }, { value: 'franchisee', label: 'Franchisee' }, { value: 'consultant', label: 'Consultant' }, { value: 'investor', label: 'Investor' }, { value: 'supplier', label: 'Supplier' }, { value: 'admin', label: 'Admin' }]} value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} placeholder="All Roles" />
          </div>
          <div style={{ minWidth: 160 }}>
            <Select options={[{ value: '', label: 'All Statuses' }, { value: 'pending_admin_review', label: 'Pending Review' }, { value: 'verified', label: 'Verified' }, { value: 'rejected', label: 'Rejected' }, { value: 'need_more_information', label: 'Needs Info' }]} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} placeholder="All Statuses" />
          </div>
        </div>

        {selected.size > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
            <CheckSquare size={16} color="var(--primary)" />
            <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{selected.size} selected</span>
            <Button size="sm" variant="primary" onClick={() => handleBulkAction('verify')}>Verify</Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('suspend')}>Suspend</Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('activate')}>Activate</Button>
            <Button size="sm" variant="danger" onClick={() => handleBulkAction('delete')}>Delete</Button>
            <button onClick={() => setSelected(new Set())} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={16} /></button>
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ width: 40, textAlign: 'left', padding: '12px 16px', borderBottom: '2px solid var(--border)' }}>
                  <button onClick={toggleSelectAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {selected.size === users.length && users.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
                  </button>
                </th>
                {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, borderBottom: '2px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>No users found</td></tr>
              ) : users.map((u) => {
                const sb = statusBadge[u.accountStatus] || { label: u.accountStatus, variant: 'default' };
                return (
                  <tr key={u.id} style={{ backgroundColor: selected.has(u.id) ? 'var(--primary-light)' : 'transparent' }}>
                    <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                      <button onClick={() => toggleSelect(u.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        {selected.has(u.id) ? <CheckSquare size={16} color="var(--primary)" /> : <Square size={16} />}
                      </button>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 14, borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={u.name || u.email} size={36} />
                        <div>
                          <span style={{ fontWeight: 500 }}>{u.name || 'Unnamed'}</span>
                          {u.verified && <VerifiedBadge size={12} />}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 14, borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '14px 16px', fontSize: 14, borderBottom: '1px solid var(--border)' }}>
                      <Badge variant={u.role === 'admin' ? 'danger' : 'info'}>{roleLabels[u.role] || u.role}</Badge>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 14, borderBottom: '1px solid var(--border)' }}>
                      <Badge variant={!u.isActive ? 'danger' : sb.variant}>{!u.isActive ? 'Suspended' : sb.label}</Badge>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 14, borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                      <Dropdown align="right" trigger={
                        <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', padding: 6, margin: '0 auto', cursor: 'pointer' }}>
                          <MoreHorizontal size={18} />
                        </button>
                      }>
                        <DropdownItem icon={<Eye size={16} />} onClick={() => openProfile(u)}>View Profile</DropdownItem>
                        <DropdownItem icon={<Bell size={16} />} onClick={() => setNotifyModal({ userId: u.id, name: u.name })}>Send Notification</DropdownItem>
                        <DropdownItem icon={u.isActive ? <UserX size={16} /> : <UserCheck size={16} />} onClick={() => handleToggleActive(u.id, u.isActive)}>
                          {u.isActive ? 'Suspend' : 'Reactivate'}
                        </DropdownItem>
                        <DropdownItem icon={u.role === 'admin' ? <ShieldOff size={16} /> : <Shield size={16} />} onClick={() => setConfirmModal({ type: 'admin', user: u })}>
                          {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                        </DropdownItem>
                        <DropdownItem icon={<Trash2 size={16} />} onClick={() => setConfirmModal({ type: 'delete', user: u })} style={{ color: 'var(--danger)' }}>Delete</DropdownItem>
                      </Dropdown>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ padding: '16px 0', display: 'flex', justifyContent: 'center' }}>
            <Pagination current={page} total={totalPages} onChange={setPage} />
          </div>
        )}
      </Card>

      {/* Confirm Modal */}
      {confirmModal && (
        <Modal onClose={() => setConfirmModal(null)}>
          <div style={{ padding: 24, maxWidth: 400 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
              {confirmModal.type === 'admin' ? (confirmModal.user.role === 'admin' ? 'Remove Admin' : 'Make Admin') : 'Delete User'}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
              {confirmModal.type === 'admin'
                ? `Are you sure you want to ${confirmModal.user.role === 'admin' ? 'remove admin privileges from' : 'grant admin privileges to'} ${confirmModal.user.name || confirmModal.user.email}?`
                : `Are you sure you want to delete ${confirmModal.user.name || confirmModal.user.email}? This cannot be undone.`}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setConfirmModal(null)}>Cancel</Button>
              <Button variant={confirmModal.type === 'delete' ? 'danger' : 'primary'} onClick={() => confirmModal.type === 'admin' ? handleMakeAdmin(confirmModal.user.id) : handleDelete(confirmModal.user.id)}>
                {confirmModal.type === 'admin' ? (confirmModal.user.role === 'admin' ? 'Remove Admin' : 'Make Admin') : 'Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* User Profile Modal */}
      {profileModal && (
        <Modal onClose={() => setProfileModal(null)}>
          <div style={{ padding: 24, maxWidth: 700, width: '90vw', maxHeight: '85vh', overflow: 'auto' }}>
            {/* Profile Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
              <Avatar name={profileModal.name || profileModal.email} size={64} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700 }}>{profileModal.name || 'Unnamed'}</h2>
                  {profileModal.verified && <VerifiedBadge size={18} />}
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{profileModal.email}</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <Badge variant={profileModal.role === 'admin' ? 'danger' : 'info'}>{roleLabels[profileModal.role] || profileModal.role}</Badge>
                  <Badge variant={profileModal.isActive ? 'success' : 'danger'}>{profileModal.isActive ? 'Active' : 'Suspended'}</Badge>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {(profileModal.accountStatus === 'pending_admin_review' || profileModal.accountStatus === 'need_more_information') && (
                  <>
                    <Button size="sm" variant="primary" icon={<Check size={14} />} onClick={() => handleReview(profileModal.id, 'approve')}>Approve</Button>
                    <Button size="sm" variant="danger" icon={<X size={14} />} onClick={() => { setRejectModal(profileModal); setRejectReason(''); }}>Reject</Button>
                    <Button size="sm" variant="ghost" icon={<AlertCircle size={14} />} onClick={() => { setInfoModal(profileModal); setInfoNotes(''); }}>Request Info</Button>
                  </>
                )}
                <Button size="sm" variant={profileModal.isActive ? 'danger' : 'primary'} onClick={() => { handleToggleActive(profileModal.id, profileModal.isActive); setProfileModal(null); }}>
                  {profileModal.isActive ? 'Suspend' : 'Activate'}
                </Button>
                <Button size="sm" variant="outline" icon={<Bell size={14} />} onClick={() => { setNotifyModal({ userId: profileModal.id, name: profileModal.name }); setProfileModal(null); }}>Notify</Button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
              <TabButton active={profileTab === 'overview'} onClick={() => setProfileTab('overview')}>Overview</TabButton>
              <TabButton active={profileTab === 'documents'} onClick={() => setProfileTab('documents')}>Documents</TabButton>
              <TabButton active={profileTab === 'activity'} onClick={() => setProfileTab('activity')}>Activity</TabButton>
              <TabButton active={profileTab === 'history'} onClick={() => setProfileTab('history')}>Verification History</TabButton>
              <TabButton active={profileTab === 'notes'} onClick={() => setProfileTab('notes')}>Notes</TabButton>
            </div>

            {/* Tab Content */}
            {profileTab === 'overview' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14 }}>
                  <div><strong>Account Status:</strong> <Badge variant={profileModal.accountStatus === 'verified' ? 'success' : 'warning'}>{profileModal.accountStatus}</Badge></div>
                  <div><strong>Phone:</strong> {profileModal.phone || '—'}</div>
                  <div><strong>Company:</strong> {profileModal.companyName || '—'}</div>
                  <div><strong>Joined:</strong> {new Date(profileModal.createdAt).toLocaleDateString()}</div>
                  <div><strong>Last Login:</strong> {profileModal.lastLoginAt ? new Date(profileModal.lastLoginAt).toLocaleDateString() : '—'}</div>
                  <div><strong>Email Verified:</strong> {profileModal.emailVerified ? 'Yes' : 'No'}</div>
                </div>
                {profileData?.user && (
                  <div style={{ marginTop: 20 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Platform Stats</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                      <Card hover={false} padding="12px" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>{profileData.user._count?.receivedConnections || 0}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Followers</div>
                      </Card>
                      <Card hover={false} padding="12px" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>{profileData.user._count?.sentConnections || 0}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Following</div>
                      </Card>
                      <Card hover={false} padding="12px" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>{profileData.user.messageCount || 0}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Messages</div>
                      </Card>
                      <Card hover={false} padding="12px" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>{profileData.user.companies?.length || 0}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Companies</div>
                      </Card>
                    </div>
                  </div>
                )}
                {profileData?.user?.rejectionReason && (
                  <div style={{ marginTop: 16, padding: 12, backgroundColor: '#FEE2E2', borderRadius: 8, fontSize: 13, color: '#DC2626' }}>
                    <strong>Rejection Reason:</strong> {profileData.user.rejectionReason}
                  </div>
                )}
              </div>
            )}

            {profileTab === 'documents' && (
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Uploaded Documents</h3>
                {profileData?.user?.documents?.length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {profileData.user.documents.map((doc) => {
                      const DocIcon = getDocumentTypeIcon(doc.type);
                      const typeColor = getDocumentTypeColor(doc.type);
                      return (
                        <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, backgroundColor: 'var(--bg)', borderRadius: 8 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: `${typeColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <DocIcon size={18} color={typeColor} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.fileName || 'Document'}</div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 2 }}>
                              {doc.type && (
                                <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 8px', borderRadius: 4, backgroundColor: `${typeColor}15`, color: typeColor, textTransform: 'capitalize' }}>
                                  {doc.type.replace(/_/g, ' ')}
                                </span>
                              )}
                              {doc.createdAt && (
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(doc.createdAt).toLocaleDateString()}</span>
                              )}
                              {doc.url?.startsWith('data:') && (
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>(base64)</span>
                              )}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" icon={<Eye size={14} />} onClick={() => { setDocModal(doc); setDocZoom(1); setDocRotate(0); }}>Preview</Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>No documents uploaded</div>
                )}
              </div>
            )}

            {profileTab === 'activity' && (
              <div>
                {profileData?.user?.auditLogs?.length || profileData?.user?.notifications?.length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {profileData.user.notifications?.slice(0, 10).map((n) => (
                      <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, backgroundColor: 'var(--bg)', borderRadius: 8, fontSize: 13 }}>
                        <Bell size={14} color="var(--text-muted)" />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500 }}>{n.title}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{n.body}</div>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(n.createdAt).toLocaleDateString()}</div>
                      </div>
                    ))}
                    {profileData.user.auditLogs?.slice(0, 10).map((log) => (
                      <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, backgroundColor: 'var(--bg)', borderRadius: 8, fontSize: 13 }}>
                        <Activity size={14} color="var(--text-muted)" />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500 }}>{log.action}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>IP: {log.ipAddress || '—'}</div>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(log.createdAt).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>No activity recorded</div>
                )}
              </div>
            )}

            {profileTab === 'notes' && (
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Internal Notes</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>Add private notes about this user. Only visible to admins.</p>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Enter internal notes here..."
                  style={{
                    width: '100%', minHeight: 160, padding: 14, fontSize: 14,
                    color: 'var(--text)', backgroundColor: 'var(--bg)',
                    border: '2px solid var(--border)', borderRadius: 8, outline: 'none',
                    resize: 'vertical', lineHeight: 1.6,
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                  <Button variant="primary" icon={<Save size={14} />} onClick={async () => {
                    setSavingNotes(true);
                    try {
                      const res = await fetch(`${API}/admin/verification/${profileModal.id}/internal-notes`, {
                        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
                        body: JSON.stringify({ notes: internalNotes }),
                      });
                      if (res.ok) showNotification('Notes saved successfully');
                      else showNotification('Failed to save notes', 'error');
                    } catch (e) { showNotification('Network error', 'error'); }
                    finally { setSavingNotes(false); }
                  }} disabled={savingNotes}>
                    {savingNotes ? 'Saving...' : 'Save Notes'}
                  </Button>
                </div>
              </div>
            )}

            {profileTab === 'history' && (
              <div>
                {profileData?.user?.verificationHistories?.length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {profileData.user.verificationHistories.map((h) => (
                      <div key={h.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 12, backgroundColor: 'var(--bg)', borderRadius: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: h.action === 'approved' ? '#D1FAE5' : h.action === 'rejected' ? '#FEE2E2' : '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {h.action === 'approved' ? <Shield size={14} color="#10B981" /> : h.action === 'rejected' ? <X size={14} color="#EF4444" /> : <Clock size={14} color="#F59E0B" />}
                        </div>
                        <div style={{ flex: 1, fontSize: 13 }}>
                          <div style={{ fontWeight: 500, textTransform: 'capitalize' }}>{h.action.replace('_', ' ')}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                            {h.previousStatus} → {h.currentStatus}
                            {h.adminNotes && <> — {h.adminNotes}</>}
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>by {h.reviewedBy} • {new Date(h.createdAt).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>No verification history</div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Document Preview Modal */}
      {docModal && (
        <Modal onClose={() => setDocModal(null)}>
          <div style={{ maxWidth: 800, width: '90vw' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>{docModal.fileName || 'Document'}</h3>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setDocZoom(z => Math.max(0.5, z - 0.25))} style={{ background: 'var(--bg)', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }} title="Zoom Out"><ZoomOut size={16} /></button>
                <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', minWidth: 32, justifyContent: 'center' }}>{Math.round(docZoom * 100)}%</span>
                <button onClick={() => setDocZoom(z => Math.min(3, z + 0.25))} style={{ background: 'var(--bg)', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }} title="Zoom In"><ZoomIn size={16} /></button>
                <button onClick={() => setDocRotate(r => r + 90)} style={{ background: 'var(--bg)', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }} title="Rotate"><RotateCw size={16} /></button>
                <button onClick={() => window.open(docModal.url, '_blank')} style={{ background: 'var(--bg)', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }} title="Download"><Download size={16} /></button>
              </div>
            </div>
            <div style={{ overflow: 'auto', maxHeight: '70vh', display: 'flex', justifyContent: 'center', backgroundColor: 'var(--bg)', borderRadius: 8, padding: 12 }}>
              {docModal.url?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                <img
                  src={docModal.url}
                  alt={docModal.fileName}
                  style={{
                    maxWidth: '100%',
                    transform: `scale(${docZoom}) rotate(${docRotate}deg)`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.2s',
                    borderRadius: 4,
                  }}
                />
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
          <div style={{ maxWidth: 480 }}>
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
          <div style={{ maxWidth: 480 }}>
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

      {/* Notification Modal */}
      {notifyModal && (
        <Modal onClose={() => setNotifyModal(null)}>
          <div style={{ padding: 24, maxWidth: 450 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Send Notification</h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Send a notification to {notifyModal.name || 'user'}
            </p>
            <input
              value={notifyModal.title || ''}
              onChange={(e) => setNotifyModal({ ...notifyModal, title: e.target.value })}
              placeholder="Notification title"
              style={{ width: '100%', padding: '10px 12px', fontSize: 14, border: '2px solid var(--border)', borderRadius: 8, backgroundColor: 'var(--surface)', color: 'var(--text)', marginBottom: 12, outline: 'none' }}
            />
            <textarea
              value={notifyModal.body || ''}
              onChange={(e) => setNotifyModal({ ...notifyModal, body: e.target.value })}
              placeholder="Notification message"
              style={{ width: '100%', minHeight: 100, padding: 12, fontSize: 14, border: '2px solid var(--border)', borderRadius: 8, backgroundColor: 'var(--surface)', color: 'var(--text)', resize: 'vertical', marginBottom: 16, outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setNotifyModal(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleSendNotification}>Send</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
