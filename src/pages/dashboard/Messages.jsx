import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send, Search as SearchIcon, ArrowLeft, Phone, Video,
  MoreHorizontal, ChevronDown, Loader as Spinner, Inbox,
  User, Clock, CheckCheck, AlertCircle, Trash2, Reply as ReplyIcon,
  SmilePlus, X, Paperclip, Image as ImageIcon, Plus, MessageCircle,
} from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';

const API = '/api';
const PAGE_SIZE = 50;

const EMOJIS = ['😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','😍','🥰','😘','😗','😙','🥲','😛','😜','🤪','😝','🤑','🤗','🤭','🫡','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','😮','😯','😲','😳','🥺','😢','😭','😤','😡','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖','🎃','😺','😸','😹','😻','😼','😽','🙀','😿','😾','💋','👋','🤚','🖐','✋','🖖','👌','🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','🫶','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦵','🦶','👂','🦻','👃','🧠','🫀','🫁','🦷','🦴','👀','👁','👅','👄','💘','❤️','🩷','🧡','💛','💚','💙','🩵','💜','🖤','🩶','🤍','🤎','💔','❤️‍🔥','❤️‍🩹','❣️','💕','💞','💓','💗','💖','💝','💟','☮️','✝️','☪️','🕉','☸️','✡️','🔯','🕎','☯️','☦️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','🆔','⚕️','🌍','🌎','🌏','🌐','🗺','🧭','🏔','⛰','🌋','🗻','🏕','🏖','🏜','🏝','🏞','🏟','🏛','🏗','🛖','🏘','🏚','🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏨','🏩','🏪','🏫','🏬','🏭','🏯','🏰','💒','🗼','🗽','⛪','🕌','🛕','🕍','⛩','🕋','⛲','⛺','🌁','🌃','🏙','🌄','🌅','🌆','🌇','🌇','🌉','🎠','🎡','🎢','💈','🎪','🚂','🚃','🚄','🚅','🚆','🚇','🚈','🚉','🚊','🚝','🚞','🚋','🚌','🚍','🚎','🚐','🚑','🚒','🚓','🚔','🚕','🚖','🚗','🚘','🚙','🛻','🚚','🚛','🚜','🏎','🏍','🛵','🛺','🚲','🛴','🛹','🛼','🚏','🛣','🛤','⛽','🛞','🚨','🚥','🚦','🛑','🚧','⚓','🛟','⛵','🛶','🚤','🛳','⛴','🛥','🚢','✈️','🛩','🛫','🛬','🪂','💺','🚁','🚟','🚠','🚡','🛰','🚀','🛸','🏧','🚮','🚰','♿','🚹','🚺','🚻','🚼','🚾','🛂','🛃','🛄','🛅','⚠️','🚸','⛔','🚫','🚳','🚭','🚯','🚱','🚷','📵','🔞','☢️','☣️','💯','♻️','✅','🈯','💹','❇️','✳️','❌','❎','💠','🏁','🚩','🎌','🏴','🏳️‍🌈','🏳️‍⚧️'];

function formatTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatMessageTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatDateSeparator(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === now.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

function groupMessagesByDate(messages) {
  const groups = [];
  let currentDate = null;
  for (const msg of messages) {
    const msgDate = new Date(msg.createdAt).toDateString();
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groups.push({ date: msg.createdAt, items: [] });
    }
    groups[groups.length - 1].items.push(msg);
  }
  return groups;
}

function ConversationSkeleton() {
  return (
    <div style={{ padding: '14px 16px', display: 'flex', gap: 12, borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'var(--border)', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ flex: 1 }}>
        <div style={{ width: '60%', height: 14, backgroundColor: 'var(--border)', borderRadius: 4, marginBottom: 8, animation: 'shimmer 1.5s infinite' }} />
        <div style={{ width: '80%', height: 12, backgroundColor: 'var(--border)', borderRadius: 4, animation: 'shimmer 1.5s infinite' }} />
      </div>
    </div>
  );
}

function MessageSkeleton() {
  return (
    <div style={{ display: 'flex', gap: 10, padding: '0 20px', marginBottom: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--border)', animation: 'shimmer 1.5s infinite', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ width: '40%', height: 12, backgroundColor: 'var(--border)', borderRadius: 4, marginBottom: 6, animation: 'shimmer 1.5s infinite' }} />
        <div style={{ width: '70%', height: 36, backgroundColor: 'var(--border)', borderRadius: 12, animation: 'shimmer 1.5s infinite' }} />
      </div>
    </div>
  );
}

const iconBtnStyle = {
  width: 36, height: 36, borderRadius: 8, border: 'none',
  backgroundColor: 'transparent', color: 'var(--text-secondary)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', transition: 'background 0.15s',
};

function EmojiPicker({ onSelect, onClose }) {
  return (
    <div style={{
      position: 'absolute', bottom: '100%', left: 0, marginBottom: 8,
      width: 320, height: 240, overflow: 'auto',
      backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      padding: 8, zIndex: 100,
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {EMOJIS.map((emoji, i) => (
          <button key={i} onClick={() => onSelect(emoji)}
            style={{
              width: 36, height: 36, border: 'none', background: 'none',
              fontSize: 20, cursor: 'pointer', borderRadius: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

function isOnline(lastActiveAt) {
  return lastActiveAt && (Date.now() - new Date(lastActiveAt).getTime()) < 300000;
}

export default function Messages() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [conversations, setConversations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [convLoading, setConvLoading] = useState(true);
  const [convError, setConvError] = useState(null);

  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [msgError, setMsgError] = useState(null);
  const [msgPage, setMsgPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  const [newMessage, setNewMessage] = useState('');
  const [showMobileList, setShowMobileList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [hoveredMsgId, setHoveredMsgId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [showNewChat, setShowNewChat] = useState(false);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [searchUsers, setSearchUsers] = useState([]);
  const [searchUsersLoading, setSearchUsersLoading] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState('');
  const [userFollowStatus, setUserFollowStatus] = useState({});
  const [followLoading, setFollowLoading] = useState({});

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const previousScrollHeight = useRef(0);
  const prevFirstMessageId = useRef(null);
  const typingIntervalRef = useRef(null);

  const filteredConvs = conversations.filter((c) => {
    const search = searchQuery.toLowerCase();
    if (!search) return true;
    return c.participants?.some((p) =>
      p.user?.name?.toLowerCase().includes(search) ||
      p.user?.email?.toLowerCase().includes(search)
    );
  });

  const activeConvData = conversations.find((c) => c.id === activeConv);
  const otherParticipant = activeConvData
    ? activeConvData.participants?.find((p) => p.user?.id !== user?.id)?.user
    : null;

  const fetchConversations = useCallback(async () => {
    setConvLoading(true);
    setConvError(null);
    try {
      const res = await fetch(`${API}/messages/conversations`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load conversations');
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (err) {
      setConvError(err.message);
      addToast(err.message, 'error');
    } finally {
      setConvLoading(false);
    }
  }, [addToast]);

  const fetchMessages = useCallback(async (convId, page = 1, append = false) => {
    if (!convId) return;
    if (append) {
      setLoadingMore(true);
    } else {
      setMsgLoading(true);
      setMsgError(null);
      setMessages([]);
    }
    try {
      const res = await fetch(
        `${API}/messages/conversations/${convId}/messages?page=${page}&limit=${PAGE_SIZE}`,
        { credentials: 'include' }
      );
      if (!res.ok) throw new Error('Failed to load messages');
      const data = await res.json();
      const newMsgs = data.messages || [];
      if (append) {
        setMessages((prev) => [...newMsgs, ...prev]);
      } else {
        setMessages(newMsgs);
      }
      setMsgPage(page);
      setHasMoreMessages(newMsgs.length >= PAGE_SIZE);
    } catch (err) {
      setMsgError(err.message);
      addToast(err.message, 'error');
    } finally {
      setMsgLoading(false);
      setLoadingMore(false);
    }
  }, [addToast]);

  const loadMoreMessages = useCallback(() => {
    if (loadingMore || !hasMoreMessages || !activeConv) return;
    previousScrollHeight.current = messagesContainerRef.current?.scrollHeight || 0;
    const firstMsg = messages[0];
    prevFirstMessageId.current = firstMsg?.id || null;
    fetchMessages(activeConv, msgPage + 1, true);
  }, [loadingMore, hasMoreMessages, activeConv, msgPage, fetchMessages, messages]);

  const fetchTyping = useCallback(async () => {
    if (!activeConv) return;
    try {
      const res = await fetch(`${API}/messages/conversations/${activeConv}/typing`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setTypingUsers(data.typing || []);
      }
    } catch {}
  }, [activeConv]);

  useEffect(() => {
    if (activeConv) {
      fetchTyping();
      typingIntervalRef.current = setInterval(fetchTyping, 2500);
    }
    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      setTypingUsers([]);
    };
  }, [activeConv, fetchTyping]);

  const emitTyping = useCallback(async () => {
    if (!activeConv) return;
    try {
      await fetch(`${API}/messages/conversations/${activeConv}/typing`, {
        method: 'POST', credentials: 'include',
      });
    } catch {}
  }, [activeConv]);

  const handleDelete = async (msgId) => {
    if (!activeConv) return;
    try {
      const res = await fetch(`${API}/messages/conversations/${activeConv}/messages/${msgId}`, {
        method: 'DELETE', credentials: 'include',
      });
      if (res.ok) {
        setMessages((prev) => prev.map(m => m.id === msgId ? { ...m, content: '[deleted]', isDeleted: true } : m));
        addToast('Message deleted', 'success');
      } else {
        addToast('Failed to delete message', 'error');
      }
    } catch {
      addToast('Failed to delete message', 'error');
    }
  };

  useEffect(() => {
    if (loadingMore && messagesContainerRef.current && prevFirstMessageId.current) {
      const prevFirstEl = messagesContainerRef.current.querySelector(`[data-msg-id="${prevFirstMessageId.current}"]`);
      if (prevFirstEl) prevFirstEl.scrollIntoView({ block: 'start' });
    }
  }, [messages, loadingMore]);

  const handleSend = async () => {
    const content = newMessage.trim();
    if (!content || sending || !activeConv) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      conversationId: activeConv,
      senderId: user?.id,
      sender: { id: user?.id, name: user?.name, image: user?.image },
      content,
      messageType: 'text',
      createdAt: new Date().toISOString(),
      _optimistic: true,
      parentId: replyingTo?.id || null,
      parent: replyingTo ? { id: replyingTo.id, content: replyingTo.content, senderId: replyingTo.senderId, sender: replyingTo.sender } : null,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setNewMessage('');
    setSending(true);
    const replySnapshot = replyingTo;
    setReplyingTo(null);

    try {
      const res = await fetch(`${API}/messages/conversations/${activeConv}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content, parentId: replySnapshot?.id || null }),
      });
      if (!res.ok) throw new Error('Failed to send message');
      const data = await res.json();
      const msg = data.message || data;
      setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, id: msg.id, _optimistic: false } : m)));
      setConversations((prev) => prev.map((c) =>
        c.id === activeConv
          ? { ...c, lastMessage: { content, createdAt: new Date().toISOString() }, updatedAt: new Date().toISOString() }
          : c
      ));
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      addToast(err.message || 'Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleSelectConversation = (convId) => {
    setActiveConv(convId);
    setShowMobileList(false);
    setMessages([]);
    setMsgPage(1);
    setHasMoreMessages(true);
    setReplyingTo(null);
    fetchMessages(convId, 1);
    setConversations((prev) => prev.map((c) =>
      c.id === convId ? { ...c, _lastReadAt: new Date().toISOString() } : c
    ));
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const res = await fetch(`${API}/messages/accept/${requestId}`, { method: 'POST', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to accept request');
      const data = await res.json();
      addToast('Request accepted!', 'success');
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      if (data.conversation) {
        setConversations((prev) => [...prev, data.conversation]);
        handleSelectConversation(data.conversation.id);
      } else {
        fetchConversations();
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      const res = await fetch(`${API}/messages/reject/${requestId}`, { method: 'POST', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to decline request');
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      addToast('Request declined', 'info');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch(`${API}/messages/requests/pending`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || data.pendingRequests || []);
      }
    } catch {}
  }, []);

  const fetchFollowingUsers = useCallback(async () => {
    if (!user?.id) return;
    setFollowingLoading(true);
    try {
      const res = await fetch(`${API}/follow/${user.id}/following`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setFollowingUsers(data.following || []);
      }
    } catch {}
    finally { setFollowingLoading(false); }
  }, [user?.id]);

  const handleSearchUsers = useCallback(async (query) => {
    if (!query.trim()) { setSearchUsers([]); return; }
    setSearchUsersLoading(true);
    try {
      const res = await fetch(`${API}/users?search=${encodeURIComponent(query)}&limit=20`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSearchUsers((data.users || []).filter((u) => u.id !== user?.id));
      }
    } catch {}
    finally { setSearchUsersLoading(false); }
  }, [user?.id]);

  const fetchMutualStatus = useCallback(async (targetId) => {
    try {
      const res = await fetch(`${API}/follow/user/${targetId}/mutual-status`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUserFollowStatus((prev) => ({ ...prev, [targetId]: data }));
        return data;
      }
    } catch {}
    return { following: false, followedBy: false, mutual: false };
  }, []);

  const fetchMutualStatusForUsers = useCallback(async (users) => {
    for (const u of users) {
      if (!userFollowStatus[u.id]) {
        fetchMutualStatus(u.id);
      }
    }
  }, [fetchMutualStatus, userFollowStatus]);

  const handleToggleFollow = async (targetId) => {
    setFollowLoading((prev) => ({ ...prev, [targetId]: true }));
    try {
      const res = await fetch(`${API}/follow/user/${targetId}`, {
        method: 'POST', credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.conversation) {
          setConversations((prev) => {
            const exists = prev.find((c) => c.id === data.conversation.id);
            return exists ? prev : [data.conversation, ...prev];
          });
        }
        await fetchMutualStatus(targetId);
        fetchFollowingUsers();
      }
    } catch {}
    finally { setFollowLoading((prev) => ({ ...prev, [targetId]: false })); }
  };

  const handleStartChat = async (targetUser) => {
    try {
      const res = await fetch(`${API}/messages/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ participantId: targetUser.id }),
      });
      if (!res.ok) throw new Error('Failed to start conversation');
      const data = await res.json();
      if (data.conversation) {
        setConversations((prev) => {
          const exists = prev.find((c) => c.id === data.conversation.id);
          return exists ? prev : [data.conversation, ...prev];
        });
        handleSelectConversation(data.conversation.id);
        setShowNewChat(false);
        setNewChatSearch('');
        setSearchUsers([]);
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchRequests();
    const params = new URLSearchParams(window.location.search);
    const convId = params.get('conversation');
    if (convId) {
      setTimeout(() => handleSelectConversation(convId), 300);
      window.history.replaceState({}, '', '/dashboard/messages');
    }
  }, [fetchConversations, fetchRequests]);

  useEffect(() => {
    if (showNewChat) {
      fetchFollowingUsers();
    } else {
      setUserFollowStatus({});
    }
  }, [showNewChat, fetchFollowingUsers]);

  useEffect(() => {
    if (followingUsers.length > 0) fetchMutualStatusForUsers(followingUsers);
  }, [followingUsers, fetchMutualStatusForUsers]);

  useEffect(() => {
    if (searchUsers.length > 0) fetchMutualStatusForUsers(searchUsers);
  }, [searchUsers, fetchMutualStatusForUsers]);

  useEffect(() => {
    const timer = setTimeout(() => handleSearchUsers(newChatSearch), 300);
    return () => clearTimeout(timer);
  }, [newChatSearch, handleSearchUsers]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try { await fetch(`${API}/messages/heartbeat`, { method: 'PATCH', credentials: 'include' }); } catch {}
    }, 120000);
    return () => clearInterval(interval);
  }, []);

  const messageIdsRef = useRef(new Set());

  useEffect(() => { messageIdsRef.current = new Set(messages.map((m) => m.id)); }, [messages]);

  useEffect(() => {
    if (!activeConv) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API}/messages/conversations/${activeConv}/messages?page=1&limit=5`, { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        const ids = messageIdsRef.current;
        const newMsgs = (data.messages || []).filter((m) => !ids.has(m.id));
        if (newMsgs.length > 0) {
          setMessages((prev) => {
            const merged = [...prev];
            for (const nm of newMsgs) {
              if (!merged.find((m) => m.id === nm.id)) merged.push(nm);
            }
            merged.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            return merged;
          });
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [activeConv]);

  useEffect(() => {
    const interval = setInterval(() => { fetchConversations(); }, 5000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  useEffect(() => {
    const interval = setInterval(() => { fetchRequests(); }, 10000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  useEffect(() => {
    if (messagesEndRef.current && !loadingMore) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, loadingMore]);

  const lastMsgContent = (conv) => {
    if (conv.lastMessage?.content) return conv.lastMessage.content;
    if (conv.messages?.length) return conv.messages[conv.messages.length - 1]?.content;
    return 'No messages yet';
  };

  const lastMsgTime = (conv) => {
    if (conv.lastMessage?.createdAt) return formatTime(conv.lastMessage.createdAt);
    if (conv.messages?.length) return formatTime(conv.messages[conv.messages.length - 1]?.createdAt);
    return formatTime(conv.updatedAt);
  };

  const isUnread = (conv) => {
    const lastRead = conv._lastReadAt || conv.lastReadAt;
    const lastCreated = conv.lastMessage?.createdAt || conv.messages?.[conv.messages.length - 1]?.createdAt || conv.updatedAt;
    if (!lastRead || !lastCreated) return false;
    return new Date(lastCreated) > new Date(lastRead);
  };

  const hasRequests = requests.length > 0;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeConv || uploading) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId, conversationId: activeConv, senderId: user?.id,
      sender: { id: user?.id, name: user?.name, image: user?.image },
      content: file.name, messageType: file.type.startsWith('image/') ? 'image' : 'file',
      attachmentUrl: URL.createObjectURL(file), createdAt: new Date().toISOString(), _optimistic: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    try {
      const res = await fetch(`${API}/messages/conversations/${activeConv}/messages/upload`, {
        method: 'POST', credentials: 'include', body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        const msg = data.message || data;
        setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, id: msg.id, attachmentUrl: msg.attachmentUrl, _optimistic: false } : m)));
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    emitTyping();
  };

  return (
    <div style={{ display: 'flex', gap: 0, height: 'calc(100vh - 112px)', margin: -24, padding: 0, overflow: 'hidden' }}>
      <div style={{
        width: 320, minWidth: 320, borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', backgroundColor: 'var(--surface)',
        ...(showMobileList ? {} : { display: 'none' }),
      }}>
        <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>Messages</h2>
            <button
              onClick={() => { setShowNewChat(!showNewChat); setNewChatSearch(''); setSearchUsers([]); }}
              style={{
                width: 32, height: 32, borderRadius: 8, border: 'none',
                backgroundColor: showNewChat ? 'var(--primary)' : 'var(--surface-hover)',
                color: showNewChat ? '#fff' : 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              title="New Chat"
            >
              <Plus size={18} />
            </button>
          </div>
          {!showNewChat && (
            <div style={{ position: 'relative' }}>
              <SearchIcon size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px 8px 36px', fontSize: 13,
                  backgroundColor: 'var(--background)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', color: 'var(--text)', outline: 'none',
                }}
              />
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          {showNewChat ? (
            <div style={{ padding: 12 }}>
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <SearchIcon size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  placeholder="Search users to chat with..."
                  value={newChatSearch}
                  onChange={(e) => setNewChatSearch(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 12px 8px 36px', fontSize: 13,
                    backgroundColor: 'var(--background)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', color: 'var(--text)', outline: 'none',
                  }}
                />
              </div>

              {newChatSearch.trim() ? (
                <>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '8px 4px' }}>
                    Search Results
                  </p>
                  {searchUsersLoading ? (
                    <div style={{ padding: 20, textAlign: 'center' }}>
                      <Spinner size={18} style={{ animation: 'spin 0.7s linear infinite', color: 'var(--text-muted)' }} />
                    </div>
                  ) : searchUsers.length === 0 ? (
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No users found</p>
                  ) : (
                    searchUsers.map((u) => {
                      const status = userFollowStatus[u.id];
                      const isMutual = status?.mutual;
                      const followedByUser = status?.followedBy;
                      const following = status?.following;
                      const fl = followLoading[u.id];
                      return (
                        <div
                          key={u.id}
                          style={{
                            display: 'flex', gap: 10, padding: '10px 12px',
                            borderRadius: 'var(--radius-sm)', transition: 'background 0.15s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <Avatar name={u.name} src={u.image} size={36} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                              {u.name}
                              {followedByUser && <span style={{ fontSize: 10, color: 'var(--accent)', backgroundColor: 'var(--accent-light)', padding: '1px 6px', borderRadius: 100, fontWeight: 600 }}>Follows you</span>}
                            </div>
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {u.headline || u.role || ''}
                            </p>
                          </div>
                          <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleToggleFollow(u.id); }}
                              disabled={fl}
                              style={{
                                padding: '4px 10px', fontSize: 12, fontWeight: 600, borderRadius: 100,
                                border: following ? '1px solid var(--border)' : 'none',
                                backgroundColor: following ? 'transparent' : 'var(--primary)',
                                color: following ? 'var(--text-secondary)' : '#fff',
                                cursor: fl ? 'default' : 'pointer', opacity: fl ? 0.6 : 1,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {fl ? '...' : following ? 'Following' : 'Follow'}
                            </button>
                            {isMutual && (
                              <button
                                onClick={() => handleStartChat(u)}
                                style={{
                                  width: 32, height: 32, borderRadius: 8, border: 'none',
                                  backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  cursor: 'pointer',
                                }}
                                title="Send message"
                              >
                                <MessageCircle size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </>
              ) : (
                <>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '8px 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <User size={14} /> Following ({followingUsers.length})
                  </p>
                  {followingLoading ? (
                    <div style={{ padding: 20, textAlign: 'center' }}>
                      <Spinner size={18} style={{ animation: 'spin 0.7s linear infinite', color: 'var(--text-muted)' }} />
                    </div>
                  ) : followingUsers.length === 0 ? (
                    <div style={{ padding: 24, textAlign: 'center' }}>
                      <User size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>You are not following anyone yet</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Search for users above to start a chat</p>
                    </div>
                  ) : (
                    followingUsers.map((u) => {
                      const status = userFollowStatus[u.id];
                      const isMutual = status?.mutual;
                      const followedByUser = status?.followedBy;
                      const following = status?.following;
                      const fl = followLoading[u.id];
                      return (
                        <div
                          key={u.id}
                          style={{
                            display: 'flex', gap: 10, padding: '10px 12px',
                            borderRadius: 'var(--radius-sm)', transition: 'background 0.15s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <Avatar name={u.name} src={u.image} size={36} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                              {u.name}
                              {followedByUser && <span style={{ fontSize: 10, color: 'var(--accent)', backgroundColor: 'var(--accent-light)', padding: '1px 6px', borderRadius: 100, fontWeight: 600 }}>Follows you</span>}
                            </div>
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {u.headline || u.role || ''}
                            </p>
                          </div>
                          <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleToggleFollow(u.id); }}
                              disabled={fl}
                              style={{
                                padding: '4px 10px', fontSize: 12, fontWeight: 600, borderRadius: 100,
                                border: following ? '1px solid var(--border)' : 'none',
                                backgroundColor: following ? 'transparent' : 'var(--primary)',
                                color: following ? 'var(--text-secondary)' : '#fff',
                                cursor: fl ? 'default' : 'pointer', opacity: fl ? 0.6 : 1,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {fl ? '...' : following ? 'Following' : 'Follow'}
                            </button>
                            {isMutual && (
                              <button
                                onClick={() => handleStartChat(u)}
                                style={{
                                  width: 32, height: 32, borderRadius: 8, border: 'none',
                                  backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  cursor: 'pointer',
                                }}
                                title="Send message"
                              >
                                <MessageCircle size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </>
              )}
            </div>
          ) : (
            <>
              {hasRequests && (
                <div style={{ borderBottom: '1px solid var(--border)' }}>
                  <div style={{ padding: '10px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Inbox size={14} /> Message Requests ({requests.length})
                  </div>
                  {requests.map((req) => {
                    const sender = req.sender || req.fromUser || {};
                    return (
                      <div key={req.id} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <Avatar name={sender.name} src={sender.image} size={36} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{sender.name || 'Unknown'}</div>
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 8 }}>
                              {req.message || req.content || 'Wants to connect'}
                            </p>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <Button variant="primary" size="sm" onClick={() => handleAcceptRequest(req.id)}>Accept</Button>
                              <Button variant="secondary" size="sm" onClick={() => handleDeclineRequest(req.id)}>Decline</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {convLoading ? (
                <>
                  <ConversationSkeleton />
                  <ConversationSkeleton />
                  <ConversationSkeleton />
                  <ConversationSkeleton />
                </>
              ) : convError ? (
                <div style={{ padding: 24, textAlign: 'center' }}>
                  <AlertCircle size={32} style={{ color: 'var(--danger)', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>{convError}</p>
                  <Button variant="outline" size="sm" onClick={fetchConversations}>Retry</Button>
                </div>
              ) : filteredConvs.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center' }}>
                  <Inbox size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {searchQuery ? 'No conversations found' : 'No conversations yet'}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                    {searchQuery ? 'Try a different search term' : 'Click + to start a new chat'}
                  </p>
                </div>
              ) : (
                filteredConvs.map((c) => {
                  const unread = isUnread(c);
                  const participant = c.participants?.find((p) => p.user?.id !== user?.id)?.user;
                  const displayName = participant?.name || c.subject || 'Unknown';
                  const avatarName = participant?.name || c.subject || '?';
                  const avatarSrc = participant?.image;
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleSelectConversation(c.id)}
                      style={{
                        display: 'flex', gap: 12, padding: '14px 16px',
                        borderBottom: '1px solid var(--border)',
                        backgroundColor: activeConv === c.id ? 'var(--surface-hover)' : 'transparent',
                        cursor: 'pointer', transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => { if (activeConv !== c.id) e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                      onMouseLeave={(e) => { if (activeConv !== c.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <div style={{ position: 'relative' }}>
                        <Avatar name={avatarName} src={avatarSrc} size={44} />
                        {unread && (
                          <span style={{
                            position: 'absolute', top: 0, right: 0, width: 10, height: 10,
                            borderRadius: '50%', backgroundColor: 'var(--primary)',
                            border: '2px solid var(--surface)',
                          }} />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 14, fontWeight: unread ? 600 : 400 }}>
                            {displayName}
                            {isOnline(participant?.lastActiveAt) && <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E', display: 'inline-block', marginLeft: 6, verticalAlign: 'middle' }} />}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {c.unreadCount > 0 && (
                              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', backgroundColor: 'var(--primary-light)', borderRadius: 100, padding: '1px 7px', lineHeight: '18px', minWidth: 18, textAlign: 'center' }}>{c.unreadCount}</span>
                            )}
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lastMsgTime(c)}</span>
                          </div>
                        </div>
                        <p style={{
                          fontSize: 13, color: 'var(--text-secondary)',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2,
                        }}>
                          {participant?.id === c.lastMessage?.senderId ? '' : 'You: '}
                          {lastMsgContent(c)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>
      </div>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--background)',
        ...(showMobileList ? { display: 'none' } : {}),
      }}>
        {activeConvData ? (
          <>
            <div style={{
              padding: '14px 20px', borderBottom: '1px solid var(--border)',
              backgroundColor: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <button
                onClick={() => setShowMobileList(true)}
                style={{ background: 'none', border: 'none', color: 'var(--text)', display: 'none', padding: 4 }}
              >
                <ArrowLeft size={20} />
              </button>
              <Avatar
                name={otherParticipant?.name || activeConvData.subject || '?'}
                src={otherParticipant?.image}
                size={38}
              />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  {otherParticipant?.name || activeConvData.subject || 'Unknown'}
                  {isOnline(otherParticipant?.lastActiveAt) && <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E', display: 'inline-block', marginLeft: 6, verticalAlign: 'middle' }} />}
                </span>
                {typingUsers.length > 0 && (
                  <p style={{ fontSize: 12, color: 'var(--accent)' }}>typing...</p>
                )}
                {typingUsers.length === 0 && otherParticipant?.role && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{otherParticipant.role}</p>
                )}
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button style={iconBtnStyle}><Phone size={18} /></button>
                <button style={iconBtnStyle}><Video size={18} /></button>
                <button style={iconBtnStyle}><MoreHorizontal size={18} /></button>
              </div>
            </div>

            <div
              ref={messagesContainerRef}
              style={{
                flex: 1, overflow: 'auto', padding: '20px 0',
                display: 'flex', flexDirection: 'column',
              }}
              onScroll={() => {
                const el = messagesContainerRef.current;
                if (el && el.scrollTop < 80 && hasMoreMessages && !loadingMore && !msgLoading) {
                  loadMoreMessages();
                }
              }}
            >
              {msgLoading ? (
                <div style={{ padding: '0 20px' }}>
                  <MessageSkeleton />
                  <MessageSkeleton />
                  <MessageSkeleton />
                  <MessageSkeleton />
                </div>
              ) : msgError ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, padding: 20 }}>
                  <AlertCircle size={32} style={{ color: 'var(--danger)' }} />
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{msgError}</p>
                  <Button variant="outline" size="sm" onClick={() => fetchMessages(activeConv, 1)}>Retry</Button>
                </div>
              ) : messages.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
                  <Inbox size={40} style={{ color: 'var(--text-muted)' }} />
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>No messages yet</p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Send a message to start the conversation</p>
                </div>
              ) : (
                <>
                  {loadingMore && (
                    <div style={{ textAlign: 'center', padding: '8px 0' }}>
                      <Spinner size={18} style={{ animation: 'spin 0.7s linear infinite', color: 'var(--text-muted)' }} />
                    </div>
                  )}
                  {hasMoreMessages && !loadingMore && messages.length >= PAGE_SIZE && (
                    <div style={{ textAlign: 'center', padding: '8px 0' }}>
                      <button
                        onClick={loadMoreMessages}
                        style={{
                          background: 'none', border: 'none', color: 'var(--primary)', fontSize: 13,
                          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
                        }}
                      >
                        <ChevronDown size={14} /> Load older messages
                      </button>
                    </div>
                  )}
                  {groupMessagesByDate(messages).map((group) => (
                    <div key={group.date}>
                      <div style={{ textAlign: 'center', padding: '8px 20px 16px' }}>
                        <span style={{
                          fontSize: 12, color: 'var(--text-muted)',
                          backgroundColor: 'var(--surface)', padding: '4px 12px',
                          borderRadius: 100,
                        }}>
                          {formatDateSeparator(group.date)}
                        </span>
                      </div>
                      {group.items.map((m) => {
                        const isMine = m.senderId === user?.id || m.sender?.id === user?.id;
                        const sender = m.sender || {};
                        return (
                          <div
                            key={m.id}
                            data-msg-id={m.id}
                            style={{
                              display: 'flex',
                              flexDirection: isMine ? 'row-reverse' : 'row',
                              gap: 10,
                              padding: '0 20px',
                              marginBottom: 4,
                              position: 'relative',
                            }}
                            onMouseEnter={() => setHoveredMsgId(m.id)}
                            onMouseLeave={() => setHoveredMsgId(null)}
                          >
                            {!isMine && (
                              <Avatar
                                name={sender.name || '?'}
                                src={sender.image}
                                size={28}
                                style={{ marginTop: 4, flexShrink: 0 }}
                              />
                            )}
                            <div style={{
                              maxWidth: '70%',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: isMine ? 'flex-end' : 'flex-start',
                            }}>
                              {m.parent && !m.isDeleted && (
                                <div style={{
                                  fontSize: 12, color: 'var(--text-muted)',
                                  backgroundColor: 'var(--surface)',
                                  padding: '6px 12px', borderRadius: '8px 8px 0 0',
                                  borderLeft: '3px solid var(--primary)',
                                  marginBottom: 2, maxWidth: '100%',
                                  cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                }}
                                  onClick={() => {
                                    const el = messagesContainerRef.current?.querySelector(`[data-msg-id="${m.parent.id}"]`);
                                    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }}>
                                  <span style={{ fontWeight: 600 }}>{m.parent.sender?.name || 'Unknown'}</span>: {m.parent.content}
                                </div>
                              )}
                              {!isMine && sender.name && (
                                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2, marginLeft: 4 }}>
                                  {sender.name}
                                </span>
                              )}
                              <div style={{
                                padding: '10px 16px',
                                borderRadius: 16,
                                backgroundColor: isMine ? 'var(--primary)' : 'var(--surface)',
                                color: isMine ? '#fff' : 'var(--text)',
                                borderBottomRightRadius: isMine ? 4 : 16,
                                borderBottomLeftRadius: isMine ? 16 : 4,
                                wordBreak: 'break-word',
                                opacity: m.isDeleted ? 0.5 : 1,
                                fontStyle: m.isDeleted ? 'italic' : 'normal',
                              }}>
                                <p style={{ fontSize: 14, lineHeight: 1.5 }}>                                {m.isDeleted ? 'Message deleted' : m.messageType === 'image' ? (
                                  <img src={m.attachmentUrl} alt={m.content} style={{ maxWidth: 240, maxHeight: 240, borderRadius: 8, display: 'block' }} />
                                ) : m.messageType === 'file' ? (
                                  <a href={m.attachmentUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Paperclip size={14} /> {m.content}
                                  </a>
                                ) : m.content}</p>
                              </div>
                              <span style={{
                                fontSize: 11,
                                color: isMine ? 'var(--text-muted)' : 'var(--text-muted)',
                                display: 'block',
                                textAlign: 'right',
                                marginTop: 2,
                                paddingRight: 4,
                              }}>
                                {formatMessageTime(m.createdAt)}
                                {isMine && (
                                  <span style={{ marginLeft: 4, display: 'inline-flex', verticalAlign: 'middle' }}>
                                    <CheckCheck size={12} style={{ color: m._optimistic ? 'var(--text-muted)' : 'var(--accent)' }} />
                                  </span>
                                )}
                              </span>
                              {hoveredMsgId === m.id && (
                                <div style={{
                                  display: 'flex', gap: 2, marginTop: 2,
                                  alignSelf: isMine ? 'flex-end' : 'flex-start',
                                }}>
                                  <button onClick={() => setReplyingTo({ id: m.id, content: m.content, senderId: sender.id || m.senderId, sender: sender })}
                                    style={{ ...iconBtnStyle, width: 28, height: 28 }}
                                    title="Reply">
                                    <ReplyIcon size={14} />
                                  </button>
                                  {isMine && !m.isDeleted && (
                                    <button onClick={() => handleDelete(m.id)}
                                      style={{ ...iconBtnStyle, width: 28, height: 28 }}
                                      title="Delete">
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  {typingUsers.length > 0 && (
                    <div style={{ display: 'flex', gap: 10, padding: '0 20px', marginTop: 4 }}>
                      <Avatar name={typingUsers[0]?.name || '?'} src={typingUsers[0]?.image} size={28} />
                      <div style={{
                        padding: '10px 16px', borderRadius: 16,
                        borderBottomLeftRadius: 4, backgroundColor: 'var(--surface)',
                        display: 'flex', gap: 4, alignItems: 'center',
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--text-muted)', animation: 'bounce 1.4s infinite' }} />
                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--text-muted)', animation: 'bounce 1.4s infinite 0.2s' }} />
                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--text-muted)', animation: 'bounce 1.4s infinite 0.4s' }} />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <div style={{
              padding: '14px 20px', borderTop: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
            }}>
              {replyingTo && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px', marginBottom: 8,
                  backgroundColor: 'var(--background)', borderRadius: 'var(--radius-sm)',
                  borderLeft: '3px solid var(--primary)', fontSize: 13, color: 'var(--text-secondary)',
                }}>
                  <ReplyIcon size={14} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <span style={{ fontWeight: 600 }}>{replyingTo.sender?.name || 'Unknown'}</span>: {replyingTo.content}
                  </div>
                  <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2, flexShrink: 0 }}>
                    <X size={16} />
                  </button>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end' }}>
                    <button onClick={() => setEmojiOpen(!emojiOpen)}
                      style={{ ...iconBtnStyle, marginBottom: 2 }} title="Emoji">
                      <SmilePlus size={18} />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
                    <button onClick={() => fileInputRef.current?.click()} style={{ ...iconBtnStyle, marginBottom: 2, opacity: uploading ? 0.5 : 1 }} disabled={uploading} title="Attach file">
                      <Paperclip size={18} />
                    </button>
                    <input
                      value={newMessage}
                      onChange={handleInputChange}
                      placeholder="Type a message..."
                      disabled={sending}
                      style={{
                        flex: 1, padding: '10px 16px', fontSize: 14,
                        backgroundColor: 'var(--background)', border: '1px solid var(--border)',
                        borderRadius: 24, color: 'var(--text)', outline: 'none',
                        opacity: sending ? 0.6 : 1,
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                    />
                  </div>
                  {emojiOpen && (
                    <EmojiPicker
                      onSelect={(emoji) => { setNewMessage((prev) => prev + emoji); setEmojiOpen(false); }}
                      onClose={() => setEmojiOpen(false)}
                    />
                  )}
                </div>
                <button
                  onClick={handleSend}
                  disabled={sending || !newMessage.trim()}
                  style={{
                    width: 40, height: 40, borderRadius: '50%',
                    backgroundColor: newMessage.trim() ? 'var(--primary)' : 'var(--border)',
                    color: newMessage.trim() ? '#fff' : 'var(--text-muted)',
                    border: 'none', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0, cursor: newMessage.trim() ? 'pointer' : 'default',
                    transition: 'background 0.2s',
                  }}
                >
                  {sending ? (
                    <Spinner size={16} style={{ animation: 'spin 0.7s linear infinite' }} />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <Inbox size={48} style={{ color: 'var(--text-muted)' }} />
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', fontWeight: 500 }}>Select a conversation</p>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Choose a conversation from the left panel to start messaging</p>
          </div>
        )}
      </div>

      <div style={{
        width: 280, borderLeft: '1px solid var(--border)', backgroundColor: 'var(--surface)',
        padding: 20, flexShrink: 0, overflow: 'auto',
        ...(activeConvData ? {} : { display: 'none' }),
      }}>
        {otherParticipant ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <Avatar name={otherParticipant.name} src={otherParticipant.image} size={64} style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>{otherParticipant.name}</h3>
              {otherParticipant.role && (
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>{otherParticipant.role}</p>
              )}
              {otherParticipant.email && <Badge variant="info">{otherParticipant.email}</Badge>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Email</p>
                <p style={{ fontSize: 14, wordBreak: 'break-all' }}>{otherParticipant.email || '—'}</p>
              </div>
              {otherParticipant.phone && (
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Phone</p>
                  <p style={{ fontSize: 14 }}>{otherParticipant.phone}</p>
                </div>
              )}
              {otherParticipant.location && (
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Location</p>
                  <p style={{ fontSize: 14 }}>{otherParticipant.location}</p>
                </div>
              )}
            </div>
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Button variant="outline" size="sm" fullWidth icon={<Phone size={14} />}>Call</Button>
              <Button variant="outline" size="sm" fullWidth icon={<Video size={14} />}>Video</Button>
            </div>
          </>
        ) : activeConvData ? (
          <div style={{ textAlign: 'center', paddingTop: 40 }}>
            <User size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{activeConvData.subject || 'Conversation'}</p>
          </div>
        ) : (
          <div style={{ textAlign: 'center', paddingTop: 40 }}>
            <User size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>No contact selected</p>
          </div>
        )}
      </div>
    </div>
  );
}
