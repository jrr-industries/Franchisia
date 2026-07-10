import { useState, useEffect } from 'react';
import { MessageSquare, Search as SearchIcon, Trash2, ChevronRight, ChevronDown, Eye, EyeOff } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';

const API = '/api';

export default function AdminMessages() {
  const [tab, setTab] = useState('conversations');
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedConv, setSelectedConv] = useState(null);
  const [convMessages, setConvMessages] = useState([]);
  const [deleteModal, setDeleteModal] = useState(null);
  const perPage = 20;

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: perPage });
      const res = await fetch(`${API}/admin/messages/conversations?${params}`, { credentials: 'include' });
      if (res.ok) { const d = await res.json(); setConversations(d.conversations || []); setTotal(d.total || 0); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: perPage });
      if (search) params.set('search', search);
      const res = await fetch(`${API}/admin/messages/all?${params}`, { credentials: 'include' });
      if (res.ok) { const d = await res.json(); setMessages(d.messages || []); setTotal(d.total || 0); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (tab === 'conversations') fetchConversations();
    else fetchMessages();
  }, [tab, page]);

  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); if (tab === 'messages') fetchMessages(); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const openConversation = async (conv) => {
    setSelectedConv(conv);
    try {
      const res = await fetch(`${API}/admin/messages/conversations/${conv.id}/messages?limit=50`, { credentials: 'include' });
      if (res.ok) { const d = await res.json(); setConvMessages(d.messages || []); }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API}/admin/messages/${id}`, { method: 'DELETE', credentials: 'include' });
      setDeleteModal(null);
      if (tab === 'conversations') fetchConversations();
      else fetchMessages();
    } catch (e) { console.error(e); }
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h1 style={{ fontSize: 24, fontWeight: 700 }}>Messages</h1><p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Monitor conversations and messages</p></div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {[
          { key: 'conversations', label: 'Conversations' },
          { key: 'messages', label: 'All Messages' },
        ].map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setPage(1); setSelectedConv(null); }}
            style={{ padding: '10px 20px', fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer', borderRadius: 10, backgroundColor: tab === t.key ? 'var(--primary)' : 'transparent', color: tab === t.key ? '#fff' : 'var(--text-secondary)' }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'messages' && (
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <SearchIcon size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search message content..." style={{ width: '100%', padding: '10px 16px 10px 36px', fontSize: 14, color: 'var(--text)', backgroundColor: 'var(--surface)', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)', outline: 'none' }} />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selectedConv ? '1fr 1.5fr' : '1fr', gap: 20 }}>
        {/* List */}
        <Card hover={false} padding="0">
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          ) : tab === 'conversations' ? (
            <div>
              {conversations.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>No conversations</div>
              ) : conversations.map((conv) => (
                <div key={conv.id} onClick={() => openConversation(conv)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)', backgroundColor: selectedConv?.id === conv.id ? 'var(--primary-light)' : 'transparent', transition: 'background 0.15s' }}>
                  <div style={{ display: 'flex' }}>
                    {conv.participants?.slice(0, 2).map((p, i) => (
                      <div key={p.userId} style={{ marginLeft: i > 0 ? -8 : 0 }}><Avatar name={p.user?.name || 'U'} size={32} /></div>
                    ))}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {conv.subject || conv.participants?.map(p => p.user?.name).filter(Boolean).join(', ') || 'Untitled'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {conv.messages?.[0]?.content?.substring(0, 60) || 'No messages'} • {conv._count?.messages || 0} messages
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {totalPages > 1 && <div style={{ padding: '12px', display: 'flex', justifyContent: 'center' }}><Pagination current={page} total={totalPages} onChange={setPage} /></div>}
            </div>
          ) : (
            <div>
              {messages.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>No messages found</div>
              ) : messages.map((msg) => (
                <div key={msg.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <Avatar name={msg.sender?.name || msg.sender?.email || 'U'} size={24} />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{msg.sender?.name || msg.sender?.email || 'Unknown'}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>{new Date(msg.createdAt).toLocaleString()}</span>
                    <button onClick={() => setDeleteModal(msg)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, display: 'flex' }}><Trash2 size={14} /></button>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginLeft: 34 }}>{msg.content}</div>
                </div>
              ))}
              {totalPages > 1 && <div style={{ padding: '12px', display: 'flex', justifyContent: 'center' }}><Pagination current={page} total={totalPages} onChange={setPage} /></div>}
            </div>
          )}
        </Card>

        {/* Conversation Detail */}
        {selectedConv && (
          <Card hover={false} padding="0" style={{ maxHeight: '70vh', overflow: 'auto' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 15 }}>
              {selectedConv.subject || 'Conversation'}
              <div style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', marginTop: 2 }}>
                {selectedConv.participants?.map(p => p.user?.name || p.user?.email).filter(Boolean).join(', ')}
              </div>
            </div>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {convMessages.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No messages in this conversation</div>
              ) : convMessages.map((msg) => (
                <div key={msg.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Avatar name={msg.sender?.name || 'U'} size={28} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{msg.sender?.name || 'Unknown'}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{msg.content}</div>
                    {msg.attachmentUrl && (
                      <Button variant="ghost" size="sm" icon={<Eye size={12} />} onClick={() => window.open(msg.attachmentUrl, '_blank')}>View Attachment</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <Modal onClose={() => setDeleteModal(null)}>
          <div style={{ padding: 24, maxWidth: 400 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Delete Message</h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>Are you sure you want to delete this message? This action cannot be undone.</p>
            <div style={{ padding: 12, backgroundColor: 'var(--bg)', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{deleteModal.content?.substring(0, 200)}</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setDeleteModal(null)}>Cancel</Button>
              <Button variant="danger" onClick={() => handleDelete(deleteModal.id)}>Delete</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
