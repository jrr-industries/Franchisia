import { useState, useEffect } from 'react';
import {
  MoreHorizontal, Eye, Edit3, Mail, UserX, UserCheck, Shield, ShieldOff, Trash2,
  Search as SearchIcon, CheckSquare, Square, Bell, X, Activity, FileText, Clock, AlertCircle,
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
  const perPage = 10;

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
    const timer = setTimeout(() => { setPage(1); fetchUsers(); }, 300);
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
    try {
      const res = await fetch(`${API}/admin/users/${user.id}/profile`, { credentials: 'include' });
      if (res.ok) setProfileData(await res.json());
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
                {profileData?.user?.documents?.length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {profileData.user.documents.map((doc) => (
                      <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, backgroundColor: 'var(--bg)', borderRadius: 8 }}>
                        <FileText size={18} color="var(--primary)" />
                        <span style={{ flex: 1, fontSize: 14 }}>{doc.fileName || doc.type}</span>
                        <Button variant="ghost" size="sm" onClick={() => window.open(doc.url, '_blank')}>View</Button>
                      </div>
                    ))}
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
