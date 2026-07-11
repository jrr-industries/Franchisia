import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell, MessageSquare, UserPlus, ShieldCheck, XCircle,
  AlertCircle, CheckCheck, Trash2, Briefcase, Building2,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { getSocket } from '../../lib/socket';
import useSocketStore from '../../store/socketStore';

const API = '/api';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'messages', label: 'Messages' },
  { id: 'follows', label: 'Follows' },
  { id: 'applications', label: 'Applications' },
  { id: 'verification', label: 'Verification' },
  { id: 'companies', label: 'Companies' },
  { id: 'system', label: 'System' },
];

const TYPE_ICONS = {
  new_message: MessageSquare,
  message_request: MessageSquare,
  message_request_accepted: MessageSquare,
  new_follower: UserPlus,
  company_followed: Building2,
  connection_request: UserPlus,
  application_received: Briefcase,
  application_status_changed: Briefcase,
  new_lead: Briefcase,
  verification_approved: ShieldCheck,
  verification_rejected: XCircle,
  account_suspended: AlertCircle,
  account_reactivated: ShieldCheck,
  system_alert: AlertCircle,
  meeting_reminder: Bell,
  new_review: Bell,
};

const TYPE_COLORS = {
  new_message: { color: '#2563EB', bg: '#DBEAFE' },
  message_request: { color: '#8B5CF6', bg: '#EDE9FE' },
  message_request_accepted: { color: '#10B981', bg: '#D1FAE5' },
  new_follower: { color: '#10B981', bg: '#D1FAE5' },
  company_followed: { color: '#06B6D4', bg: '#CFFAFE' },
  connection_request: { color: '#F59E0B', bg: '#FEF3C7' },
  application_received: { color: '#8B5CF6', bg: '#EDE9FE' },
  application_status_changed: { color: '#F59E0B', bg: '#FEF3C7' },
  new_lead: { color: '#8B5CF6', bg: '#EDE9FE' },
  verification_approved: { color: '#059669', bg: '#D1FAE5' },
  verification_rejected: { color: '#DC2626', bg: '#FEE2E2' },
  account_suspended: { color: '#EF4444', bg: '#FEE2E2' },
  account_reactivated: { color: '#10B981', bg: '#D1FAE5' },
  system_alert: { color: '#6B7280', bg: '#F3F4F6' },
  meeting_reminder: { color: '#F59E0B', bg: '#FEF3C7' },
  new_review: { color: '#F59E0B', bg: '#FEF3C7' },
};

const FALLBACK_ICON = Bell;
const FALLBACK_COLORS = { color: '#6B7280', bg: '#F3F4F6' };

function getNavPath(n) {
  const d = n.data || {};
  switch (n.type) {
    case 'new_message':
    case 'message_request':
    case 'message_request_accepted':
      return d.conversationId ? `/messages?conv=${d.conversationId}` : '/messages';
    case 'new_follower':
    case 'connection_request':
      return d.followerId ? `/profile/${d.followerId}` : d.requesterId ? `/profile/${d.requesterId}` : '/discover';
    case 'company_followed':
    case 'new_lead':
      return d.companyId ? `/company/${d.companyId}` : '/companies';
    case 'application_received':
    case 'application_status_changed':
      return d.applicationId ? `/admin/applications` : '/applications';
    case 'verification_approved':
    case 'verification_rejected':
      return d.companyId ? `/company/${d.companyId}` : '/settings';
    case 'account_suspended':
    case 'account_reactivated':
      return '/settings';
    case 'system_alert':
      return '/dashboard';
    case 'meeting_reminder':
      return '/dashboard';
    case 'new_review':
      return d.companyId ? `/company/${d.companyId}` : '/discover';
    default:
      return '/notifications';
  }
}

function timeAgo(dateStr) {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
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

export default function Notifications() {
  const navigate = useNavigate();
  const isConnected = useSocketStore((s) => s.isConnected);
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [groupCounts, setGroupCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [markingIds, setMarkingIds] = useState(new Set());
  const [deletingIds, setDeletingIds] = useState(new Set());

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: '1', limit: '50' });
      if (activeTab === 'unread') params.set('unread', 'true');
      else if (activeTab !== 'all') params.set('type', activeTab);

      const res = await fetch(`${API}/notifications?${params}`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications);
        setTotal(data.total);
        setUnreadCount(data.unreadCount);
        setGroupCounts(data.groupCounts || {});
      }
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  useEffect(() => {
    if (!isConnected) return;
    const socket = getSocket();
    if (!socket) return;
    const handler = () => { fetchNotifications(); };
    socket.on('notification', handler);
    return () => { socket.off('notification', handler); };
  }, [isConnected, fetchNotifications]);

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

  const handleDelete = async (id) => {
    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`${API}/notifications/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        setTotal((prev) => Math.max(0, prev - 1));
      }
    } catch (e) {
      console.error('Failed to delete notification', e);
    } finally {
      setDeletingIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    }
  };

  const handleClick = (n) => {
    if (!n.isRead) handleMarkRead(n.id);
    const path = getNavPath(n);
    navigate(path);
  };

  const getIcon = (type) => TYPE_ICONS[type] || FALLBACK_ICON;
  const getColors = (type) => TYPE_COLORS[type] || FALLBACK_COLORS;

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
        {!loading && unreadCount > 0 && (
          <Button variant="ghost" size="sm" icon={<CheckCheck size={16} />} onClick={handleMarkAllRead}>
            Mark All as Read
          </Button>
        )}
      </div>

      <Card hover={false}>
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', overflowX: 'auto', flexWrap: 'nowrap' }}>
          {TABS.map((tab) => {
            const count = tab.id === 'all' ? total : tab.id === 'unread' ? unreadCount : groupCounts[tab.id] || 0;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '12px 18px',
                  fontSize: 13,
                  fontWeight: 500,
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                  backgroundColor: 'transparent',
                  color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
                {count > 0 && (
                  <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'var(--border)',
                    color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                    padding: '1px 7px',
                    borderRadius: 100,
                    lineHeight: '18px',
                  }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div>
            <SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow />
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
            <Bell size={32} style={{ margin: '0 auto 8px' }} />
            <p>No notifications to show.</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map((n) => {
              const colors = getColors(n.type);
              const Icon = getIcon(n.type);
              const isMarking = markingIds.has(n.id);
              const isDeleting = deletingIds.has(n.id);
              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: isDeleting ? 0 : 1, x: isDeleting ? 20 : 0 }}
                  onClick={() => handleClick(n)}
                  style={{
                    display: 'flex',
                    gap: 14,
                    padding: '14px 16px',
                    borderBottom: '1px solid var(--border)',
                    backgroundColor: !n.isRead ? 'var(--primary-light)' : 'transparent',
                    borderRadius: 8,
                    marginBottom: 4,
                    transition: 'background 0.15s',
                    cursor: 'pointer',
                    opacity: isMarking ? 0.6 : 1,
                    position: 'relative',
                  }}
                >
                  {!n.isRead && (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--primary)', position: 'absolute', left: 6, top: 18 }} />
                  )}
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, backgroundColor: colors.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: colors.color, flexShrink: 0,
                  }}>
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
                  <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start', flexShrink: 0 }}>
                    {!n.isRead && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }}
                        style={{
                          background: 'none', border: 'none', color: 'var(--primary)',
                          fontSize: 12, fontWeight: 500, cursor: 'pointer',
                          padding: '4px 8px', borderRadius: 6,
                          opacity: isMarking ? 0.5 : 1,
                        }}
                      >
                        {isMarking ? '...' : 'Read'}
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}
                      style={{
                        background: 'none', border: 'none', color: 'var(--danger)',
                        fontSize: 12, cursor: 'pointer', padding: '4px 8px', borderRadius: 6,
                        opacity: isDeleting ? 0.5 : 1,
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </Card>
    </div>
  );
}
