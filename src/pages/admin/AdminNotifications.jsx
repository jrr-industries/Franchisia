import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, Clock } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';

const API = '/api';

const typeIcons = {
  verification_approved: { icon: '✓', color: 'var(--accent)' },
  verification_rejected: { icon: '✗', color: 'var(--danger)' },
  new_follower: { icon: '♥', color: 'var(--danger)' },
  company_followed: { icon: '♡', color: 'var(--danger)' },
  new_message: { icon: '✉', color: 'var(--primary)' },
  account_suspended: { icon: '⊘', color: 'var(--danger)' },
  account_reactivated: { icon: '✓', color: 'var(--accent)' },
  admin_promoted: { icon: '★', color: '#F59E0B' },
  admin_demoted: { icon: '☆', color: 'var(--text-muted)' },
};

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 20;

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/notifications?page=${page}&limit=${perPage}`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNotifications(data.notifications || []);
      setTotal(data.total || 0);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, [page]);

  const handleMarkRead = async (id) => {
    await fetch(`${API}/notifications/${id}/read`, { method: 'PATCH', credentials: 'include' });
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    await fetch(`${API}/notifications/read-all`, { method: 'POST', credentials: 'include' });
    fetchNotifications();
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Notifications</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
            {unreadCount} unread • {total} total
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" icon={<CheckCheck size={16} />} onClick={handleMarkAllRead}>
            Mark All Read
          </Button>
        )}
      </div>

      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
      ) : notifications.length === 0 ? (
        <Card hover={false} padding="40px" style={{ textAlign: 'center' }}>
          <Bell size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
          <p style={{ color: 'var(--text-secondary)' }}>No notifications yet.</p>
        </Card>
      ) : (
        <Card hover={false} padding="0">
          {notifications.map((n) => {
            const meta = typeIcons[n.type] || { icon: '●', color: 'var(--text-muted)' };
            return (
              <div
                key={n.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px 20px',
                  borderBottom: '1px solid var(--border)', cursor: 'pointer',
                  backgroundColor: n.isRead ? 'transparent' : 'var(--primary-light)',
                  opacity: n.isRead ? 0.7 : 1,
                }}
                onClick={() => !n.isRead && handleMarkRead(n.id)}
              >
                <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: `${meta.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                  {meta.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: n.isRead ? 400 : 600 }}>{n.title}</div>
                  {n.body && <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{n.body}</div>}
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    <Clock size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
                {!n.isRead && (
                  <Button variant="ghost" size="sm" icon={<Check size={14} />} onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }}>
                    Read
                  </Button>
                )}
              </div>
            );
          })}
        </Card>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
          <Pagination current={page} total={totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
