import { useState, useEffect } from 'react';
import { Heart, Users, Building2, Trash2, TrendingUp, Activity, ChevronRight } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';

const API = '/api';

export default function AdminFollowers() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removeModal, setRemoveModal] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/followers/stats`, { credentials: 'include' });
      if (res.ok) setStats(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  const handleRemoveCompanyFollower = async (companyId, userId) => {
    try {
      await fetch(`${API}/admin/followers/company/${companyId}/user/${userId}`, { method: 'DELETE', credentials: 'include' });
      setRemoveModal(null);
      fetchStats();
    } catch (e) { console.error(e); }
  };

  const handleRemoveUserFollower = async (targetUserId, followerId) => {
    try {
      await fetch(`${API}/admin/followers/user/${targetUserId}/${followerId}`, { method: 'DELETE', credentials: 'include' });
      setRemoveModal(null);
      fetchStats();
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Followers</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Monitor follower activity across the platform</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
        <Card hover={false} padding="20px">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#FCE7F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={20} color="#EC4899" />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{stats?.totalCompanyFollowers?.toLocaleString() || '—'}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Company Followers</div>
            </div>
          </div>
        </Card>
        <Card hover={false} padding="20px">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} color="#3B82F6" />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{stats?.totalUserConnections?.toLocaleString() || '—'}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>User Connections</div>
            </div>
          </div>
        </Card>
      </div>

      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Top Followed Companies */}
          <Card hover={false} padding="20px">
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Building2 size={16} color="#EC4899" /> Top Followed Companies
            </h3>
            {!stats?.topCompanies?.length ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>No data yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stats.topCompanies.map((c, i) => (
                  <div key={c.companyId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: i < 3 ? '#FCE7F3' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: i < 3 ? '#EC4899' : 'var(--text-muted)' }}>{i + 1}</div>
                    <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{c.company?.name || 'Unknown'}</div>
                    <Badge variant="info">{c._count} followers</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Top Followed Users */}
          <Card hover={false} padding="20px">
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={16} color="#3B82F6" /> Most Followed Users
            </h3>
            {!stats?.topUsers?.length ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>No data yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stats.topUsers.map((u, i) => (
                  <div key={u.followingId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: i < 3 ? '#DBEAFE' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: i < 3 ? '#3B82F6' : 'var(--text-muted)' }}>{i + 1}</div>
                    <Avatar name={u.user?.name || u.user?.email || 'U'} size={28} />
                    <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{u.user?.name || u.user?.email || 'Unknown'}</div>
                    <Badge variant="info">{u._count} followers</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {removeModal && (
        <Modal onClose={() => setRemoveModal(null)}>
          <div style={{ padding: 24, maxWidth: 400 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Remove Follower</h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Are you sure you want to remove this follower? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setRemoveModal(null)}>Cancel</Button>
              <Button variant="danger" onClick={() => {
                if (removeModal.type === 'company') handleRemoveCompanyFollower(removeModal.companyId, removeModal.userId);
                else handleRemoveUserFollower(removeModal.targetUserId, removeModal.followerId);
              }}>Remove</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
