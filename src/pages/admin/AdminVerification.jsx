import { useState, useEffect } from 'react';
import { ShieldCheck, XCircle, AlertCircle, Eye, FileText, CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';

const API = 'http://localhost:3001/api';

const roleLabels = {
  franchisor: 'Franchisor',
  franchisee: 'Franchisee',
  supplier: 'Supplier',
  consultant: 'Consultant',
  investor: 'Investor',
};

export default function AdminVerification() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const fetchPendingUsers = async () => {
    try {
      const res = await fetch(`${API}/admin/users/pending-verification`, { headers });
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPendingUsers();
  }, [token]);

  const handleAction = async (userId, action) => {
    setActionLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/admin/users/${userId}/verify`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ action, notes }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      setShowModal(false);
      setNotes('');
      setSelectedUser(null);
      fetchPendingUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openReview = (user) => {
    setSelectedUser(user);
    setNotes('');
    setError('');
    setShowModal(true);
  };

  const s = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 24, fontWeight: 700 },
    subtitle: { fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: {
      textAlign: 'left', padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)',
      fontWeight: 500, borderBottom: '2px solid var(--border)', whiteSpace: 'nowrap',
    },
    td: { padding: '14px 16px', fontSize: 14, borderBottom: '1px solid var(--border)' },
  };

  return (
    <div>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Verification Requests</h1>
          <p style={s.subtitle}>Review and approve business account verifications</p>
        </div>
        <Badge variant="warning">{users.length} Pending</Badge>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: 'var(--radius-sm)', fontSize: 14, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <Card hover={false} padding="20px">
        {loading ? (
          <p style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>Loading...</p>
        ) : users.length === 0 ? (
          <p style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>No pending verification requests</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>User</th>
                  <th style={s.th}>Email</th>
                  <th style={s.th}>Role</th>
                  <th style={s.th}>Company</th>
                  <th style={s.th}>Submitted</th>
                  <th style={{ ...s.th, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={s.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={u.fullName} size={36} />
                        <span style={{ fontWeight: 500 }}>{u.fullName}</span>
                      </div>
                    </td>
                    <td style={{ ...s.td, color: 'var(--text-secondary)' }}>{u.businessEmail || u.email}</td>
                    <td style={s.td}>
                      <Badge variant="info">{roleLabels[u.role] || u.role}</Badge>
                    </td>
                    <td style={s.td}>{u.companyName || u.consultancyName || '-'}</td>
                    <td style={{ ...s.td, color: 'var(--text-muted)', fontSize: 13 }}>
                      {u.submittedForReviewAt ? new Date(u.submittedForReviewAt).toLocaleDateString() : '-'}
                    </td>
                    <td style={{ ...s.td, textAlign: 'center' }}>
                      <Button size="sm" variant="primary" icon={<Eye size={14} />} onClick={() => openReview(u)}>
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setSelectedUser(null); }} title="Review Verification" width={580}>
        {selectedUser && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: 16, backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-sm)' }}>
              <Avatar name={selectedUser.fullName} size={48} />
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>{selectedUser.fullName}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {selectedUser.businessEmail || selectedUser.email} &middot; {roleLabels[selectedUser.role] || selectedUser.role}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {selectedUser.companyName && (
                <div><strong>Company:</strong> {selectedUser.companyName}</div>
              )}
              {selectedUser.consultancyName && (
                <div><strong>Consultancy:</strong> {selectedUser.consultancyName}</div>
              )}
              {selectedUser.phone && <div><strong>Phone:</strong> {selectedUser.phone}</div>}
              {selectedUser.businessRegistrationNumber && (
                <div><strong>Registration #:</strong> {selectedUser.businessRegistrationNumber}</div>
              )}
              {selectedUser.gstNumber && <div><strong>GST #:</strong> {selectedUser.gstNumber}</div>}
              {selectedUser.experienceYears && (
                <div><strong>Experience:</strong> {selectedUser.experienceYears} years</div>
              )}
              {selectedUser.linkedinUrl && (
                <div><strong>LinkedIn:</strong> <a href={selectedUser.linkedinUrl} target="_blank" rel="noreferrer">{selectedUser.linkedinUrl}</a></div>
              )}
              {selectedUser.website && (
                <div><strong>Website:</strong> <a href={selectedUser.website} target="_blank" rel="noreferrer">{selectedUser.website}</a></div>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 6 }}>
                Notes / Reason
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this verification decision..."
                rows={3}
                style={{
                  width: '100%', padding: '10px 16px', fontSize: 14,
                  color: 'var(--text)', backgroundColor: 'var(--surface)',
                  border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  outline: 'none', resize: 'vertical', fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button
                variant="secondary"
                size="md"
                icon={<AlertCircle size={16} />}
                onClick={() => handleAction(selectedUser.id, 'request_info')}
                disabled={actionLoading}
              >
                Request Info
              </Button>
              <Button
                variant="secondary"
                size="md"
                icon={<XCircle size={16} />}
                style={{ borderColor: '#DC2626', color: '#DC2626' }}
                onClick={() => handleAction(selectedUser.id, 'reject')}
                disabled={actionLoading}
              >
                Reject
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={<CheckCircle size={16} />}
                onClick={() => handleAction(selectedUser.id, 'approve')}
                disabled={actionLoading}
              >
                Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
