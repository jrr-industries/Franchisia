import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, MessageSquare, UserPlus, ShieldCheck, XCircle,
  AlertCircle, CheckCheck, Filter,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Tabs from '../../components/ui/Tabs';
import Badge from '../../components/ui/Badge';

const API = '/api';

const TYPE_ICONS = {
  new_message: MessageSquare,
  new_follower: UserPlus,
  company_followed: UserPlus,
  verification_approved: ShieldCheck,
  verification_rejected: XCircle,
  message_request: MessageSquare,
  account_suspended: AlertCircle,
};

const TYPE_COLORS = {
  new_message: { color: '#2563EB', bg: '#DBEAFE' },
  new_follower: { color: '#10B981', bg: '#D1FAE5' },
  company_followed: { color: '#10B981', bg: '#D1FAE5' },
  verification_approved: { color: '#059669', bg: '#D1FAE5' },
  verification_rejected: { color: '#DC2626', bg: '#FEE2E2' },
  message_request: { color: '#8B5CF6', bg: '#EDE9FE' },
  account_suspended: { color: '#EF4444', bg: '#FEE2E2' },
};

const FALLBACK_ICON = Bell;
const FALLBACK_COLORS = { color: '#6B7280', bg: '#F3F4F6' };

const TYPE_FILTERS = ['All Types', 'Messages', 'Follows', 'System'];

const FILTER_MAP = {
  Messages: ['new_message', 'message_request'],
  Follows: ['new_follower', 'company_followed'],
  System: ['verification_approved', 'verification_rejected', 'account_suspended'],
};

function timeAgo(dateStr) {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? 's' : ''} ago`;
}

function SkeletonRow() {
  return (
    <div style={{ display: 'flex', gap: 14, padding: '14px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--border)', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ width: '60%', height: 14, borderRadius: 4, background: 'var(--border)' }} />
        <div style={{ width: '40%', height: 12, borderRadius: 4, background: 'var(--border)' }} />
      </div>
    </div>
  );
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const itemAnim = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0 },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [filterType, setFilterType] = useState('All Types');
  const [markingIds, setMarkingIds] = useState(new Set());

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/notifications?page=1&limit=50`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
        setTotal(data.total);
      }
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleMarkRead = async (id) => {
    setMarkingIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`${API}/notifications/${id}/read`, { method: 'PATCH', credentials: 'include' });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (e) {
      console.error('Failed to mark as read', e);
    } finally {
      setMarkingIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch(`${API}/notifications/read-all`, { method: 'POST', credentials: 'include' });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (e) {
      console.error('Failed to mark all as read', e);
    }
  };

  const getIcon = (type) => {
    const Icon = TYPE_ICONS[type] || FALLBACK_ICON;
    return <Icon size={18} />;
  };

  const getColors = (type) => TYPE_COLORS[type] || FALLBACK_COLORS;

  const filtered = notifications.filter((n) => {
    if (activeTab === 'unread' && n.isRead) return false;
    if (filterType !== 'All Types') {
      const allowed = FILTER_MAP[filterType] || [];
      if (!allowed.includes(n.type)) return false;
    }
    return true;
  });

  const displayUnread = notifications.filter((n) => !n.isRead).length;

  const tabs = [
    { id: 'all', label: `All (${total})`, content: null },
    { id: 'unread', label: `Unread (${displayUnread})`, content: null },
  ];

  return (
    <div>
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Notifications</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Stay updated with your latest activity.</p>
        </div>
        {!loading && displayUnread > 0 && (
          <Button variant="ghost" size="sm" icon={<CheckCheck size={16} />} onClick={handleMarkAllRead}>
            Mark All as Read
          </Button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <Filter size={16} style={{ color: 'var(--text-muted)' }} />
        {TYPE_FILTERS.map((ft) => (
          <button
            key={ft}
            onClick={() => setFilterType(ft)}
            style={{
              padding: '6px 14px',
              fontSize: 13,
              fontWeight: 500,
              borderRadius: 100,
              border: '1px solid',
              borderColor: filterType === ft ? 'var(--primary)' : 'var(--border)',
              backgroundColor: filterType === ft ? 'var(--primary-light)' : 'transparent',
              color: filterType === ft ? 'var(--primary)' : 'var(--text-secondary)',
              transition: 'all 0.2s',
              cursor: 'pointer',
            }}
          >
            {ft}
          </button>
        ))}
      </div>

      <Card hover={false}>
        <Tabs
          tabs={tabs.map((t) => ({
            ...t,
            content: loading ? (
              <div>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                <Bell size={32} style={{ margin: '0 auto 8px' }} />
                <p>No notifications to show.</p>
              </div>
            ) : (
              <motion.div variants={container} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column' }}>
                {filtered.map((n) => {
                  const colors = getColors(n.type);
                  const Icon = TYPE_ICONS[n.type] || FALLBACK_ICON;
                  const isMarking = markingIds.has(n.id);
                  return (
                    <motion.div
                      key={n.id}
                      variants={itemAnim}
                      onClick={() => { if (!n.isRead) handleMarkRead(n.id); }}
                      style={{
                        display: 'flex',
                        gap: 14,
                        padding: '14px 16px',
                        borderBottom: '1px solid var(--border)',
                        backgroundColor: !n.isRead ? 'var(--primary-light)' : 'transparent',
                        borderRadius: 8,
                        marginBottom: 4,
                        transition: 'background 0.15s',
                        cursor: n.isRead ? 'default' : 'pointer',
                        opacity: isMarking ? 0.6 : 1,
                        position: 'relative',
                      }}
                    >
                      {!n.isRead && (
                        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--primary)', position: 'absolute', left: 6, top: 18 }} />
                      )}
                      <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.color, flexShrink: 0 }}>
                        <Icon size={18} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: n.isRead ? 400 : 600, lineHeight: 1.5, color: 'var(--text)' }}>
                          {n.title}
                        </p>
                        {n.body && (
                          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>
                            {n.body}
                          </p>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{timeAgo(n.createdAt)}</span>
                          {!n.isRead && <Badge variant="default" style={{ fontSize: 10, padding: '2px 8px' }}>New</Badge>}
                        </div>
                      </div>
                      {!n.isRead && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary)',
                            fontSize: 12,
                            fontWeight: 500,
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: 6,
                            alignSelf: 'flex-start',
                            flexShrink: 0,
                            opacity: isMarking ? 0.5 : 1,
                          }}
                        >
                          {isMarking ? '...' : 'Mark read'}
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            ),
          }))}
        />
      </Card>
    </div>
  );
}
