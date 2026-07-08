import { useState } from 'react';
import { Phone, Video, MoreHorizontal, Send, Search as SearchIcon, ArrowLeft } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const conversations = [
  { id: 1, name: 'Sarah Johnson', role: 'Franchise Seeker', lastMessage: 'Thanks for the information! I\'ll review it.', time: '2m', unread: true },
  { id: 2, name: 'Mike Chen', role: 'Investor', lastMessage: 'Can we schedule a call next week?', time: '15m', unread: true },
  { id: 3, name: 'Emily Rodriguez', role: 'Business Owner', lastMessage: 'The documents have been signed.', time: '1h', unread: false },
  { id: 4, name: 'David Kim', role: 'Franchisee', lastMessage: 'I\'m interested in the downtown location.', time: '3h', unread: false },
  { id: 5, name: 'Lisa Thompson', role: 'Broker', lastMessage: 'Let me check the availability for you.', time: '5h', unread: true },
  { id: 6, name: 'James Wilson', role: 'Investor', lastMessage: 'Looking forward to the meeting.', time: '1d', unread: false },
  { id: 7, name: 'Amanda Lee', role: 'Franchise Seeker', lastMessage: 'What\'s the initial investment required?', time: '2d', unread: false },
  { id: 8, name: 'Robert Martinez', role: 'Business Owner', lastMessage: 'The ROI looks promising.', time: '3d', unread: false },
];

const messages = [
  { id: 1, from: 'them', text: 'Hi! I was looking at your franchise listing.', time: '10:32 AM' },
  { id: 2, from: 'me', text: 'Hello! Great to hear. Which one are you interested in?', time: '10:33 AM' },
  { id: 3, from: 'them', text: 'The McDonald\'s downtown location sounds perfect.', time: '10:34 AM' },
  { id: 4, from: 'me', text: 'Excellent choice! That location has great foot traffic.', time: '10:35 AM' },
  { id: 5, from: 'them', text: 'Could you share more details about the investment breakdown?', time: '10:36 AM' },
  { id: 6, from: 'me', text: 'Sure, I\'ll send you the prospectus. The initial investment ranges from $150K to $350K.', time: '10:38 AM' },
  { id: 7, from: 'them', text: 'Thanks for the information! I\'ll review it.', time: '10:40 AM' },
];

const contactInfo = {
  name: 'Sarah Johnson',
  role: 'Franchise Seeker',
  company: 'Independent',
  email: 'sarah.j@example.com',
  phone: '+1 (555) 123-4567',
};

export default function Messages() {
  const [activeConv, setActiveConv] = useState(conversations[0].id);
  const [newMessage, setNewMessage] = useState('');
  const [showMobileList, setShowMobileList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConvs = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const active = conversations.find((c) => c.id === activeConv);

  return (
    <div style={{ display: 'flex', gap: 0, height: 'calc(100vh - 112px)', margin: -24, padding: 0, overflow: 'hidden' }}>
      <div style={{ width: 320, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--surface)', flexShrink: 0 }}>
        <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Messages</h2>
          <div style={{ position: 'relative' }}>
            <SearchIcon size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                fontSize: 13,
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text)',
                outline: 'none',
              }}
            />
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {filteredConvs.map((c) => (
            <div
              key={c.id}
              onClick={() => { setActiveConv(c.id); setShowMobileList(false); }}
              style={{
                display: 'flex',
                gap: 12,
                padding: '14px 16px',
                borderBottom: '1px solid var(--border)',
                backgroundColor: activeConv === c.id ? 'var(--surface-hover)' : 'transparent',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { if (activeConv !== c.id) e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
              onMouseLeave={(e) => { if (activeConv !== c.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <div style={{ position: 'relative' }}>
                <Avatar name={c.name} size={44} />
                {c.unread && <span style={{ position: 'absolute', top: 0, right: 0, width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--primary)', border: '2px solid var(--surface)' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: c.unread ? 600 : 400 }}>{c.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.time}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>{c.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--background)' }}>
        {active ? (
          <>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => setShowMobileList(true)}
                style={{ background: 'none', border: 'none', color: 'var(--text)', display: 'none', padding: 4 }}
              >
                <ArrowLeft size={20} />
              </button>
              <Avatar name={active.name} size={38} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{active.name}</span>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{active.role}</p>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button style={iconBtnStyle}><Phone size={18} /></button>
                <button style={iconBtnStyle}><Video size={18} /></button>
                <button style={iconBtnStyle}><MoreHorizontal size={18} /></button>
              </div>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.map((m) => (
                <div key={m.id} style={{ display: 'flex', justifyContent: m.from === 'me' ? 'flex-end' : 'flex-start' }}>
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '10px 16px',
                      borderRadius: 16,
                      backgroundColor: m.from === 'me' ? 'var(--primary)' : 'var(--surface)',
                      color: m.from === 'me' ? '#fff' : 'var(--text)',
                      borderBottomRightRadius: m.from === 'me' ? 4 : 16,
                      borderBottomLeftRadius: m.from === 'me' ? 16 : 4,
                    }}
                  >
                    <p style={{ fontSize: 14, lineHeight: 1.5 }}>{m.text}</p>
                    <span style={{ fontSize: 11, color: m.from === 'me' ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', display: 'block', textAlign: 'right', marginTop: 4 }}>{m.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--surface)', display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  fontSize: 14,
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: 24,
                  color: 'var(--text)',
                  outline: 'none',
                }}
                onKeyDown={(e) => { if (e.key === 'Enter' && newMessage.trim()) { setNewMessage(''); } }}
              />
              <button
                onClick={() => { if (newMessage.trim()) setNewMessage(''); }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  color: '#fff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Send size={18} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>

      <div style={{ width: 280, borderLeft: '1px solid var(--border)', backgroundColor: 'var(--surface)', padding: 20, flexShrink: 0 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <Avatar name={contactInfo.name} size={64} style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>{contactInfo.name}</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{contactInfo.role}</p>
          <Badge variant="info">{contactInfo.company}</Badge>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Email</p>
            <p style={{ fontSize: 14 }}>{contactInfo.email}</p>
          </div>
          <div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Phone</p>
            <p style={{ fontSize: 14 }}>{contactInfo.phone}</p>
          </div>
        </div>
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Button variant="outline" size="sm" fullWidth icon={<Phone size={14} />}>Call</Button>
          <Button variant="outline" size="sm" fullWidth icon={<Video size={14} />}>Video</Button>
        </div>
      </div>
    </div>
  );
}

const iconBtnStyle = {
  width: 36,
  height: 36,
  borderRadius: 8,
  border: 'none',
  backgroundColor: 'transparent',
  color: 'var(--text-secondary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'background 0.15s',
};
