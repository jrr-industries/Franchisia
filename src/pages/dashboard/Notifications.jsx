import { useState } from 'react';
import { Bell, MessageSquare, UserPlus, Star, Calendar, CheckCheck, Filter } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Tabs from '../../components/ui/Tabs';
import Badge from '../../components/ui/Badge';

const notifications = [
  { id: 1, type: 'message', icon: <MessageSquare size={18} />, color: '#2563EB', bg: '#DBEAFE', text: 'Sarah Johnson sent you a message about McDonald\'s franchise.', time: '2 min ago', unread: true },
  { id: 2, type: 'follow', icon: <UserPlus size={18} />, color: '#10B981', bg: '#D1FAE5', text: 'Mike Chen started following your company.', time: '15 min ago', unread: true },
  { id: 3, type: 'application', icon: <Star size={18} />, color: '#F59E0B', bg: '#FEF3C7', text: 'Emily Rodriguez submitted an application for KFC Outlet #42.', time: '1 hr ago', unread: true },
  { id: 4, type: 'meeting', icon: <Calendar size={18} />, color: '#8B5CF6', bg: '#EDE9FE', text: 'Meeting with Pizza Hut LLC confirmed for tomorrow at 10:30 AM.', time: '3 hr ago', unread: false },
  { id: 5, type: 'message', icon: <MessageSquare size={18} />, color: '#2563EB', bg: '#DBEAFE', text: 'David Kim replied to your message about the downtown location.', time: '5 hr ago', unread: false },
  { id: 6, type: 'follow', icon: <UserPlus size={18} />, color: '#10B981', bg: '#D1FAE5', text: 'Lisa Thompson and 3 others viewed your profile.', time: '8 hr ago', unread: false },
  { id: 7, type: 'system', icon: <Bell size={18} />, color: '#EF4444', bg: '#FEE2E2', text: 'Your franchise listing "Downtown Bistro" has been approved.', time: '1 day ago', unread: false },
  { id: 8, type: 'application', icon: <Star size={18} />, color: '#F59E0B', bg: '#FEF3C7', text: 'James Wilson shortlisted your Subway franchise opportunity.', time: '2 days ago', unread: false },
  { id: 9, type: 'meeting', icon: <Calendar size={18} />, color: '#8B5CF6', bg: '#EDE9FE', text: 'Reminder: Call with 7-Eleven representatives in 1 hour.', time: '2 days ago', unread: false },
  { id: 10, type: 'message', icon: <MessageSquare size={18} />, color: '#2563EB', bg: '#DBEAFE', text: 'Amanda Lee asked about initial investment requirements.', time: '3 days ago', unread: false },
];

const filterTypes = ['All Types', 'Messages', 'Applications', 'Follows', 'Meetings', 'System'];
const typeMap = { Messages: 'message', Applications: 'application', Follows: 'follow', Meetings: 'meeting', System: 'system' };

export default function Notifications() {
  const [activeTab, setActiveTab] = useState('all');
  const [filterType, setFilterType] = useState('All Types');

  const filtered = notifications.filter((n) => {
    if (activeTab === 'unread' && !n.unread) return false;
    if (activeTab === 'mentions') return n.text.includes('@');
    if (filterType !== 'All Types' && n.type !== typeMap[filterType]) return false;
    return true;
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  const tabs = [
    { id: 'all', label: `All (${notifications.length})`, content: null },
    { id: 'unread', label: `Unread (${unreadCount})`, content: null },
    { id: 'mentions', label: 'Mentions', content: null },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Notifications</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Stay updated with your latest activity.</p>
        </div>
        <Button variant="ghost" size="sm" icon={<CheckCheck size={16} />}>Mark All as Read</Button>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        {filterTypes.map((ft) => (
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
            content: (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {filtered.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                    <Bell size={32} style={{ margin: '0 auto 8px' }} />
                    <p>No notifications to show.</p>
                  </div>
                ) : (
                  filtered.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        display: 'flex',
                        gap: 14,
                        padding: '14px 16px',
                        borderBottom: '1px solid var(--border)',
                        backgroundColor: n.unread ? 'var(--primary-light)' : 'transparent',
                        borderRadius: 8,
                        marginBottom: 4,
                        transition: 'background 0.15s',
                      }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: n.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: n.color, flexShrink: 0 }}>
                        {n.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, lineHeight: 1.5 }}>
                          {n.text}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{n.time}</span>
                          {n.unread && <Badge variant="default" style={{ fontSize: 10, padding: '2px 8px' }}>New</Badge>}
                        </div>
                      </div>
                      <button
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          fontSize: 12,
                          fontWeight: 500,
                          visibility: n.unread ? 'visible' : 'hidden',
                        }}
                      >
                        Mark read
                      </button>
                    </div>
                  ))
                )}
              </div>
            ),
          }))}
        />
      </Card>
    </div>
  );
}
