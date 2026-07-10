import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Check, X, Eye, FileText, Clock, AlertCircle, MessageSquare,
  Search as SearchIcon, RotateCw, ZoomIn, ZoomOut, Download, ChevronLeft, ChevronRight,
  Info, User, Save,
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

const reviewTabs = [
  { key: 'overview', label: 'Overview', icon: Info },
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'documents', label: 'Documents', icon: FileText },
  { key: 'history', label: 'History', icon: Clock },
  { key: 'notes', label: 'Notes', icon: MessageSquare },
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

function ReviewTabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', fontSize: 13, fontWeight: 500,
        border: 'none', cursor: 'pointer', borderRadius: 8, position: 'relative',
        backgroundColor: 'transparent',
        color: active ? 'var(--primary)' : 'var(--text-secondary)',
        transition: 'all 0.2s',
      }}
    >
      <Icon size={16} />
      {label}
      {active && (
        <div style={{ position: 'absolute', bottom: 0, left: 8, right: 8, height: 2, backgroundColor: 'var(--primary)', borderRadius: 1 }} />
      )}
    </button>
  );
}

function getRoleProfileFields(user) {
  const fields = [];
  const add = (label, value) => { if (value !== null && value !== undefined && value !== '') fields.push({ label, value }); };
  switch (user.role) {
    case 'franchisor':
      add('Company Name', user.companyName);
      add('Brand Name', user.brandName);
      add('GST Number', user.gstNumber);
      add('Business Registration Number', user.businessRegistrationNumber);
      add('Website', user.website);
      add('Business Email', user.businessEmail);
      add('Address', typeof user.location === 'string' ? user.location : user.address);
      add('Investment Capacity', user.investmentCapacity);
      add('Years in Business', user.yearsInBusiness);
      add('Company Description', user.companyDescription);
      add('Number of Outlets', user.numberOfOutlets);
      break;
    case 'franchisee':
      add('Preferred Industry', user.preferredIndustry);
      add('Preferred Location', user.preferredLocation);
      add('Investment Range', user.investmentRange);
      add('Experience Years', user.experienceYears);
      break;
    case 'consultant':
      add('Consultancy Name', user.consultancyName);
      add('Preferred Industry', user.preferredIndustry);
      add('Experience Years', user.experienceYears);
      break;
    case 'investor':
      add('Investment Capacity', user.investmentCapacity);
      add('Preferred Industry', user.preferredIndustry);
      break;
    case 'supplier':
      add('Company Name', user.companyName);
      add('Industry', user.industry);
      add('Experience Years', user.experienceYears);
      break;
  }
  return fields;
}

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
  const [userDetail, setUserDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [reviewTab, setReviewTab] = useState('overview');
  const [internalNotes, setInternalNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [docModal, setDocModal] = useState(null);
  const [docZoom, setDocZoom] = useState(1);
  const [docRotate, setDocRotate] = useState(0);
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

  const fetchUserDetail = async (userId) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`${API}/admin/verification/${userId}`, { credentials: 'include' });
      if (res.ok) {
        const d = await res.json();
        setUserDetail(d.user || d);
      } else {
        setUserDetail(null);
      }
    } catch (e) {
      console.error(e);
      setUserDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const openReview = (user) => {
    setSelectedUser(user);
    setReviewTab('overview');
    setInternalNotes(user.verificationNotes || user.internalNotes || '');
    fetchUserDetail(user.id);
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
      setSelectedUser(null);
      setUserDetail(null);
      fetchData();
    } catch (e) {
      showNotification('Network error', 'error');
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedUser) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`${API}/admin/verification/${selectedUser.id}/internal-notes`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ notes: internalNotes }),
      });
      if (res.ok) {
        showNotification('Notes saved successfully');
      } else {
        const err = await res.json().catch(() => ({ error: 'Failed to save notes' }));
        showNotification(err.error || 'Failed to save notes', 'error');
      }
    } catch (e) {
      showNotification('Network error', 'error');
    } finally {
      setSavingNotes(false);
    }
  };

  const openHistory = async (userId) => {
    try {
      const res = await fetch(`${API}/admin/verification/${userId}/history`, { credentials: 'include' });
      if (res.ok) { const d = await res.json(); setHistoryData(d.history || []); setHistoryModal(userId); }
    } catch (e) { console.error(e); }
  };

  const totalPages = Math.ceil(total / perPage);

  const userForTabs = userDetail || selectedUser;

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
                  <Button variant="outline" size="sm" icon={<Eye size={14} />} onClick={() => openReview(u)}>Review</Button>
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

      {/* Enhanced Review Modal */}
      {selectedUser && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)', padding: 24,
          }}
          onClick={() => { setSelectedUser(null); setUserDetail(null); }}
        >
          <div
            style={{
              backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)',
              width: '100%', maxWidth: 800, maxHeight: '90vh', overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <Avatar name={selectedUser.name || selectedUser.email} size={48} />
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>{selectedUser.name || 'Unnamed'}</h2>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{selectedUser.email} &bull; {roleLabels[selectedUser.role]}</p>
              </div>
              <button onClick={() => { setSelectedUser(null); setUserDetail(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 4, borderRadius: 8 }}>
                <X size={20} />
              </button>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: 2, padding: '8px 24px 0', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg)', overflowX: 'auto' }}>
              {reviewTabs.map((t) => (
                <ReviewTabButton key={t.key} active={reviewTab === t.key} icon={t.icon} label={t.label} onClick={() => setReviewTab(t.key)} />
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
              {loadingDetail ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading user details...</div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={reviewTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    {/* Overview Tab */}
                    {reviewTab === 'overview' && (
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>User Information</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          {[
                            { label: 'Name', value: userForTabs.name },
                            { label: 'Email', value: userForTabs.email },
                            { label: 'Phone', value: userForTabs.phone },
                            { label: 'Role', value: roleLabels[userForTabs.role] || userForTabs.role },
                            { label: 'Joined', value: userForTabs.createdAt ? new Date(userForTabs.createdAt).toLocaleDateString() : null },
                            { label: 'Location', value: typeof userForTabs.location === 'string' ? userForTabs.location : userForTabs.location?.city || userForTabs.address || null },
                          ].map((f) => f.value ? (
                            <div key={f.label} style={{ padding: '10px 14px', backgroundColor: 'var(--bg)', borderRadius: 8 }}>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</div>
                              <div style={{ fontSize: 14, fontWeight: 500 }}>{f.value}</div>
                            </div>
                          ) : null)}
                        </div>

                        <h3 style={{ fontSize: 15, fontWeight: 600, margin: '20px 0 12px' }}>Status</h3>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          <div style={{ padding: '10px 14px', backgroundColor: 'var(--bg)', borderRadius: 8, flex: 1, minWidth: 160 }}>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Verification Status</div>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                              backgroundColor: userForTabs.accountStatus === 'verified' ? '#D1FAE5' : userForTabs.accountStatus === 'rejected' ? '#FEE2E2' : userForTabs.accountStatus === 'need_more_information' ? '#FEF3C7' : '#EDE9FE',
                              color: userForTabs.accountStatus === 'verified' ? '#065F46' : userForTabs.accountStatus === 'rejected' ? '#991B1B' : userForTabs.accountStatus === 'need_more_information' ? '#92400E' : '#5B21B6',
                            }}>
                              {userForTabs.accountStatus === 'verified' ? <Check size={14} /> : userForTabs.accountStatus === 'rejected' ? <X size={14} /> : <Clock size={14} />}
                              {userForTabs.accountStatus?.replace(/_/g, ' ') || 'Unknown'}
                            </span>
                          </div>
                          <div style={{ padding: '10px 14px', backgroundColor: 'var(--bg)', borderRadius: 8, flex: 1, minWidth: 160 }}>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account Status</div>
                            <span style={{ fontSize: 14, fontWeight: 500, textTransform: 'capitalize' }}>{userForTabs.accountStatus?.replace(/_/g, ' ') || 'Unknown'}</span>
                          </div>
                          {userForTabs.submittedForReviewAt && (
                            <div style={{ padding: '10px 14px', backgroundColor: 'var(--bg)', borderRadius: 8, flex: 1, minWidth: 160 }}>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Submitted for Review</div>
                              <span style={{ fontSize: 14, fontWeight: 500 }}>{new Date(userForTabs.submittedForReviewAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        {userForTabs.rejectionReason && (
                          <div style={{ marginTop: 16, padding: 12, backgroundColor: '#FEE2E2', borderRadius: 8, fontSize: 13, color: '#DC2626' }}>
                            <strong>Previous Rejection:</strong> {userForTabs.rejectionReason}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Profile Tab */}
                    {reviewTab === 'profile' && (
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
                          {roleLabels[userForTabs.role] || userForTabs.role} Profile
                        </h3>
                        {(() => {
                          const fields = getRoleProfileFields(userForTabs);
                          if (fields.length === 0) {
                            return <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No profile details available.</p>;
                          }
                          return (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                              {fields.map((f) => (
                                <div key={f.label} style={{ padding: '10px 14px', backgroundColor: 'var(--bg)', borderRadius: 8 }}>
                                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</div>
                                  <div style={{ fontSize: 14, fontWeight: 500 }}>{f.value}</div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Documents Tab */}
                    {reviewTab === 'documents' && (
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Uploaded Documents</h3>
                        {userForTabs.documents?.length ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {userForTabs.documents.map((doc) => {
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
                                    </div>
                                  </div>
                                  <Button variant="ghost" size="sm" icon={<Eye size={14} />} onClick={() => { setDocModal(doc); setDocZoom(1); setDocRotate(0); }}>Preview</Button>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No documents uploaded.</p>
                        )}
                      </div>
                    )}

                    {/* Verification History Tab */}
                    {reviewTab === 'history' && (
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Verification History</h3>
                        {(() => {
                          const histories = userForTabs.verificationHistories;
                          if (!histories || histories.length === 0) {
                            return <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No verification history available.</p>;
                          }
                          return (
                            <div style={{ position: 'relative' }}>
                              {histories.map((h, idx) => (
                                <div key={h.id || idx} style={{ display: 'flex', gap: 14, paddingBottom: idx < histories.length - 1 ? 20 : 0, position: 'relative' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{
                                      width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                                      backgroundColor: h.action === 'approved' ? '#D1FAE5' : h.action === 'rejected' ? '#FEE2E2' : h.action === 'requested_info' ? '#FEF3C7' : '#EDE9FE',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                      {h.action === 'approved' ? <Check size={16} color="#10B981" /> : h.action === 'rejected' ? <X size={16} color="#EF4444" /> : h.action === 'requested_info' ? <AlertCircle size={16} color="#F59E0B" /> : <Clock size={16} color="#8B5CF6" />}
                                    </div>
                                    {idx < histories.length - 1 && (
                                      <div style={{ width: 2, flex: 1, backgroundColor: 'var(--border)', marginTop: 4 }} />
                                    )}
                                  </div>
                                  <div style={{ fontSize: 13, flex: 1, paddingTop: 6 }}>
                                    <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{h.action.replace(/_/g, ' ')}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 1 }}>{h.previousStatus || 'pending'} &rarr; {h.currentStatus || h.action === 'approved' ? 'verified' : h.action === 'rejected' ? 'rejected' : h.action === 'requested_info' ? 'need_more_information' : 'pending'}</div>
                                    {h.adminNotes && <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 4, padding: 8, backgroundColor: 'var(--surface)', borderRadius: 6, borderLeft: '3px solid var(--border)' }}>"{h.adminNotes}"</div>}
                                    <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 4 }}>
                                      {h.reviewedBy ? `by ${h.reviewedBy}` : ''}
                                      {h.reviewedBy && h.createdAt ? ' • ' : ''}
                                      {h.createdAt ? new Date(h.createdAt).toLocaleString() : ''}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Admin Notes Tab */}
                    {reviewTab === 'notes' && (
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Internal Notes</h3>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>Add private notes about this verification request. These are only visible to admins.</p>
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
                          <Button
                            variant="primary"
                            icon={<Save size={14} />}
                            onClick={handleSaveNotes}
                            disabled={savingNotes}
                          >
                            {savingNotes ? 'Saving...' : 'Save Notes'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* Fixed Footer Actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', borderTop: '1px solid var(--border)', padding: '14px 24px', backgroundColor: 'var(--surface)' }}>
              <Button variant="ghost" onClick={() => { setSelectedUser(null); setUserDetail(null); }}>Close</Button>
              <Button variant="ghost" icon={<AlertCircle size={14} />} onClick={() => { setInfoModal(selectedUser); setInfoNotes(''); setSelectedUser(null); setUserDetail(null); }}>Request Info</Button>
              <Button variant="primary" icon={<Check size={14} />} onClick={() => handleReview(selectedUser.id, 'approve')}>Approve</Button>
              <Button variant="danger" icon={<X size={14} />} onClick={() => { setRejectModal(selectedUser); setSelectedUser(null); setUserDetail(null); }}>Reject</Button>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer */}
      {docModal && (
        <Modal isOpen={true} onClose={() => setDocModal(null)} width={800}>
          <div>
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
        <Modal isOpen={true} onClose={() => setRejectModal(null)} width={480}>
          <div>
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
        <Modal isOpen={true} onClose={() => setInfoModal(null)} width={480}>
          <div>
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
        <Modal isOpen={true} onClose={() => { setHistoryModal(null); setHistoryData([]); }} width={550}>
          <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
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
                      <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{h.previousStatus} &rarr; {h.currentStatus}</div>
                      {h.adminNotes && <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 2 }}>"{h.adminNotes}"</div>}
                      <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>by {h.reviewedBy} &bull; {new Date(h.createdAt).toLocaleString()}</div>
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
