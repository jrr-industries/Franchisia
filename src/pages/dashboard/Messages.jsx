import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Search as SearchIcon, ArrowLeft, Phone, Video,
  MoreHorizontal, ChevronDown, Loader as Spinner, Inbox,
  User, Clock, CheckCheck, AlertCircle, Trash2, Reply as ReplyIcon,
  SmilePlus, X, Paperclip, Image as ImageIcon, Plus, MessageCircle,
  Share2, Briefcase, Calendar, Building2, MapPin, Award, Target, Globe, DollarSign, Bell,
  Pin, PinOff, VolumeX, Volume2, Archive, ArchiveRestore, MessageSquare,
  Hash, Users, Star, CheckCircle2, Circle, ChevronLeft, ChevronRight,
  Search as SearchMessages, Edit3, AtSign, Paperclip as FileIcon,
  FileText, Download, Eye, EyeOff, Filter, Zap,
} from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useConversations } from '../../hooks/useDashboard';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import useSocketStore from '../../store/socketStore';
import {
  getSocket, sendMessage, startTyping, stopTyping,
  markAsRead, deleteMessageSocket, addReaction, removeReaction, checkOnline,
} from '../../lib/socket';

const API = '/api';
const PAGE_SIZE = 50;

const EMOJIS = ['😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','😍','🥰','😘','😗','😙','🥲','😛','😜','🤪','😝','🤑','🤗','🤭','🫡','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','😮','😯','😲','😳','🥺','😢','😭','😤','😡','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖','🎃','😺','😸','😹','😻','😼','😽','🙀','😿','😾','💋','👋','🤚','🖐','✋','🖖','👌','🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','🫶','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦵','🦶','👂','🦻','👃','🧠','🫀','🫁','🦷','🦴','👀','👁','👅','👄','💘','❤️','🩷','🧡','💛','💚','💙','🩵','💜','🖤','🩶','🤍','🤎','💔','❤️‍🔥','❤️‍🩹','❣️','💕','💞','💓','💗','💖','💝','💟','☮️','✝️','☪️','🕉','☸️','✡️','🔯','🕎','☯️','☦️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','🆔','⚕️','🌍','🌎','🌏','🌐','🗺','🧭','🏔','⛰','🌋','🗻','🏕','🏖','🏜','🏝','🏞','🏟','🏛','🏗','🛖','🏘','🏚','🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏨','🏩','🏪','🏫','🏬','🏭','🏯','🏰','💒','🗼','🗽','⛪','🕌','🛕','🕍','⛩','🕋','⛲','⛺','🌁','🌃','🏙','🌄','🌅','🌆','🌇','🌉','🎠','🎡','🎢','💈','🎪','🚂','🚃','🚄','🚅','🚆','🚇','🚈','🚉','🚊','🚝','🚞','🚋','🚌','🚍','🚎','🚐','🚑','🚒','🚓','🚔','🚕','🚖','🚗','🚘','🚙','🛻','🚚','🚛','🚜','🏎','🏍','🛵','🛺','🚲','🛴','🛹','🛼','🚏','🛣','🛤','⛽','🛞','🚨','🚥','🚦','🛑','🚧','⚓','🛟','⛵','🛶','🚤','🛳','⛴','🛥','🚢','✈️','🛩','🛫','🛬','🪂','💺','🚁','🚟','🚠','🚡','🛰','🚀','🛸','🏧','🚮','🚰','♿','🚹','🚺','🚻','🚼','🚾','🛂','🛃','🛄','🛅','⚠️','🚸','⛔','🚫','🚳','🚭','🚯','🚱','🚷','📵','🔞','☢️','☣️','💯','♻️','✅','🈯','💹','❇️','✳️','❌','❎','💠','🏁','🚩','🎌','🏴','🏳️‍🌈','🏳️‍⚧️'];

const REACTION_EMOJIS = ['❤️', '👍', '🔥', '😂', '👏', '🎉'];

const QUICK_REPLIES = ['Sure, let me check!', 'Sounds good!', 'I\'ll get back to you.', 'Thanks!', 'Great!', 'Let me know if you need anything else.'];

const FILTER_OPTIONS = [
  { id: 'all', label: 'All', icon: MessageSquare },
  { id: 'unread', label: 'Unread', icon: Circle },
  { id: 'users', label: 'Users', icon: User },
  { id: 'companies', label: 'Companies', icon: Building2 },
  { id: 'archived', label: 'Archived', icon: Archive },
];

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

function formatCurrency(val) {
  const n = Number(val);
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
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

const iconBtnStyle = {
  width: 36, height: 36, borderRadius: 8, border: 'none',
  backgroundColor: 'transparent', color: 'var(--text-secondary)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', transition: 'all 0.15s',
};

const glassStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
};

function EmojiPicker({ onSelect, onClose }) {
  const categories = [
    { name: 'Faces', emojis: EMOJIS.slice(0, 200) },
    { name: 'Hands', emojis: EMOJIS.slice(200, 260) },
    { name: 'Symbols', emojis: EMOJIS.slice(260, 320) },
    { name: 'Objects', emojis: EMOJIS.slice(320) },
  ];
  const [activeCat, setActiveCat] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      style={{
        position: 'absolute', bottom: '100%', left: 0, marginBottom: 8,
        width: 340, height: 280,
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex', flexDirection: 'column',
        zIndex: 100, overflow: 'hidden',
      }}
    >
      <div style={{
        display: 'flex', gap: 2, padding: '6px 8px',
        borderBottom: '1px solid var(--border)',
        overflow: 'auto', flexShrink: 0,
      }}>
        {categories.map((cat, i) => (
          <button
            key={cat.name}
            onClick={() => setActiveCat(i)}
            style={{
              padding: '4px 10px', fontSize: 11, fontWeight: 600,
              border: 'none', borderRadius: 6,
              backgroundColor: activeCat === i ? 'var(--primary)' : 'transparent',
              color: activeCat === i ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}
          >{cat.name}</button>
        ))}
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 6 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {categories[activeCat].emojis.map((emoji, i) => (
            <button key={i} onClick={() => { onSelect(emoji); onClose(); }}
              style={{
                width: 36, height: 36, border: 'none', background: 'none',
                fontSize: 20, cursor: 'pointer', borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >{emoji}</button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function QuickReplies({ onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      style={{
        position: 'absolute', bottom: '100%', left: 0, marginBottom: 8,
        display: 'flex', gap: 4, flexWrap: 'wrap',
        padding: 8, backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 100, maxWidth: 400,
      }}
    >
      {QUICK_REPLIES.map((reply) => (
        <button
          key={reply}
          onClick={() => onSelect(reply)}
          style={{
            padding: '4px 10px', fontSize: 12,
            border: '1px solid var(--border)', borderRadius: 100,
            backgroundColor: 'var(--background)',
            color: 'var(--text-secondary)',
            cursor: 'pointer', whiteSpace: 'nowrap',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >{reply}</button>
      ))}
    </motion.div>
  );
}

function ContextMenu({ x, y, items, onClose }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const menuWidth = 200;
  const adjustedX = x + menuWidth > window.innerWidth ? x - menuWidth : x;
  const adjustedY = y + 36 * items.length + 16 > window.innerHeight ? y - 36 * items.length - 16 : y;

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        position: 'fixed', left: adjustedX, top: adjustedY,
        width: menuWidth,
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-xl)',
        padding: 4, zIndex: 1000,
        overflow: 'hidden',
      }}
    >
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => { item.onClick(); onClose(); }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 12px', fontSize: 13,
            border: 'none', background: 'none',
            color: item.danger ? 'var(--danger)' : 'var(--text)',
            cursor: 'pointer', borderRadius: 6,
            transition: 'background 0.1s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </motion.div>
  );
}

function EmptyConversations({ onCreateChat }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: 40, height: '100%',
      }}
    >
      <div style={{
        width: 80, height: 80, borderRadius: 20,
        background: 'linear-gradient(135deg, var(--primary-light), var(--accent-light))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
      }}>
        <MessageCircle size={36} style={{ color: 'var(--primary)' }} />
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>No conversations yet</h3>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.6, marginBottom: 20, maxWidth: 240 }}>
        Start networking by following professionals and companies.
      </p>
      <Button variant="primary" size="md" onClick={onCreateChat}>
        <User size={16} /> Discover Users
      </Button>
    </motion.div>
  );
}

function EmptyMessages() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: 40, height: '100%',
      }}
    >
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: 'linear-gradient(135deg, var(--primary-light), rgba(59,130,246,0.1))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
      }}>
        <Edit3 size={32} style={{ color: 'var(--primary)' }} />
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Say hello!</h3>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 260 }}>
        Start the conversation by sending a message.
      </p>
    </motion.div>
  );
}

function SkeletonConversation() {
  return (
    <div style={{ padding: '16px 20px', display: 'flex', gap: 12, borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'var(--border)', animation: 'shimmer 1.5s infinite', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ width: '60%', height: 14, backgroundColor: 'var(--border)', borderRadius: 4, marginBottom: 8, animation: 'shimmer 1.5s infinite' }} />
        <div style={{ width: '80%', height: 11, backgroundColor: 'var(--border)', borderRadius: 4, animation: 'shimmer 1.5s infinite' }} />
      </div>
      <div style={{ width: 30, height: 12, backgroundColor: 'var(--border)', borderRadius: 4, animation: 'shimmer 1.5s infinite', flexShrink: 0 }} />
    </div>
  );
}

function SkeletonMessage() {
  return (
    <div style={{ display: 'flex', gap: 10, padding: '0 24px', marginBottom: 12, alignItems: 'flex-end' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--border)', animation: 'shimmer 1.5s infinite', flexShrink: 0 }} />
      <div style={{ width: '45%', height: 40, backgroundColor: 'var(--border)', borderRadius: '12px 12px 12px 4px', animation: 'shimmer 1.5s infinite' }} />
    </div>
  );
}

export default function Messages() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  const [newMessage, setNewMessage] = useState('');
  const [showMobileList, setShowMobileList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [quickReplyOpen, setQuickReplyOpen] = useState(false);
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

  const [typingUsers, setTypingUsers] = useState([]);
  const [convTypingUsers, setConvTypingUsers] = useState({});
  const [reactionPicker, setReactionPicker] = useState(null);
  const [onlineStatuses, setOnlineStatuses] = useState({});

  const [contextMenu, setContextMenu] = useState(null);
  const [showSearchMessages, setShowSearchMessages] = useState(false);
  const [searchMessagesQuery, setSearchMessagesQuery] = useState('');
  const [searchedMessages, setSearchedMessages] = useState([]);
  const [searchingMessages, setSearchingMessages] = useState(false);
  const [showQuickSettings, setShowQuickSettings] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const previousScrollHeight = useRef(0);
  const prevFirstMessageId = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socketConnected = useSocketStore((s) => s.isConnected);

  const filteredConvs = useMemo(() => {
    let result = [...conversations];
    const q = searchQuery.toLowerCase();

    if (activeFilter === 'unread') {
      result = result.filter((c) => c.unreadCount > 0);
    } else if (activeFilter === 'users') {
      result = result.filter((c) => {
        const p = c.participants?.find((p) => p.user?.id !== user?.id)?.user;
        return p && (!p.role || ['franchisor', 'franchisee', 'consultant', 'investor', 'supplier'].includes(p.role));
      });
    } else if (activeFilter === 'companies') {
      result = result.filter((c) => c.participants?.some((p) => p.user?.role === 'franchisor'));
    } else if (activeFilter === 'archived') {
      result = result.filter((c) => c.archived);
    } else {
      result = result.filter((c) => !c.archived);
    }

    if (q) {
      result = result.filter((c) => {
        const participant = c.participants?.find((p) => p.user?.id !== user?.id)?.user;
        if (!participant) return false;
        const nameMatch = participant.name?.toLowerCase().includes(q);
        const roleMatch = participant.role?.toLowerCase().includes(q);
        const emailMatch = participant.email?.toLowerCase().includes(q);
        const msgMatch = c.messages?.[0]?.content?.toLowerCase().includes(q);
        const companyMatch = c.subject?.toLowerCase().includes(q);
        return nameMatch || roleMatch || emailMatch || msgMatch || companyMatch;
      });
    }

    return result;
  }, [conversations, searchQuery, activeFilter, user?.id]);

  const activeConvData = conversations.find((c) => c.id === activeConv);
  const otherParticipant = activeConvData
    ? activeConvData.participants?.find((p) => p.user?.id !== user?.id)?.user
    : null;

  const isUserOnline = useCallback((userId) => onlineStatuses[userId] === true, [onlineStatuses]);

  const fetchConversations = useCallback(async () => {
    setConvLoading(true);
    setConvError(null);
    try {
      const params = new URLSearchParams();
      if (activeFilter !== 'all') params.set('filter', activeFilter);
      if (searchQuery) params.set('search', searchQuery);
      const res = await fetch(`${API}/messages/conversations?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load conversations');
      const data = await res.json();
      const convs = data.conversations || [];
      setConversations(convs);
      useSocketStore.getState().setConversations(convs);
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    } catch (err) {
      setConvError(err.message);
    } finally {
      setConvLoading(false);
    }
  }, [addToast, queryClient, activeFilter, searchQuery]);

  const fetchMessagesApi = useCallback(async (convId, page = 1, append = false) => {
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
      if (page === 1 && newMsgs.length > 0 && socketConnected) {
        const unreadIds = newMsgs
          .filter((m) => m.senderId !== user?.id && !m.readAt)
          .map((m) => m.id);
        if (unreadIds.length > 0) {
          markAsRead({ conversationId: convId, messageIds: unreadIds });
        }
      }
    } catch (err) {
      setMsgError(err.message);
    } finally {
      setMsgLoading(false);
      setLoadingMore(false);
    }
  }, [addToast, user?.id, socketConnected]);

  const loadMoreMessages = useCallback(() => {
    if (loadingMore || !hasMoreMessages || !activeConv) return;
    previousScrollHeight.current = messagesContainerRef.current?.scrollHeight || 0;
    const firstMsg = messages[0];
    prevFirstMessageId.current = firstMsg?.id || null;
    fetchMessagesApi(activeConv, msgPage + 1, true);
  }, [loadingMore, hasMoreMessages, activeConv, msgPage, fetchMessagesApi, messages]);

  useEffect(() => {
    if (loadingMore && messagesContainerRef.current && prevFirstMessageId.current) {
      const prevFirstEl = messagesContainerRef.current.querySelector(`[data-msg-id="${prevFirstMessageId.current}"]`);
      if (prevFirstEl) prevFirstEl.scrollIntoView({ block: 'start' });
    }
  }, [messages, loadingMore]);

  useEffect(() => {
    if (messagesEndRef.current && !loadingMore) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, loadingMore]);

  const handleSelectConversation = (convId) => {
    setActiveConv(convId);
    setShowMobileList(false);
    setMessages([]);
    setMsgPage(1);
    setHasMoreMessages(true);
    setReplyingTo(null);
    setTypingUsers([]);
    setShowSearchMessages(false);
    setSearchedMessages([]);
    useSocketStore.getState().setActiveConversationId(convId);
    setConversations((prev) => prev.map((c) =>
      c.id === convId ? { ...c, unreadCount: 0 } : c
    ));
    queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    fetchMessagesApi(convId, 1);
  };

  const handleSend = async () => {
    const content = newMessage.trim();
    if (!content || sending || !activeConv) return;
    if (!socketConnected) return addToast('Connecting to server...', 'info');

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
      const receiverId = otherParticipant?.id;
      if (!receiverId) throw new Error('No receiver');

      const result = await sendMessage({
        receiverId,
        conversationId: activeConv,
        content,
        parentId: replySnapshot?.id || null,
      });

      const msg = result.message;
      setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, id: msg.id, _optimistic: false, deliveredAt: msg.deliveredAt || null } : m)));
      setConversations((prev) => {
        const updated = prev.map((c) =>
          c.id === activeConv
            ? { ...c, updatedAt: new Date().toISOString(), lastMessage: msg }
            : c
        );
        useSocketStore.getState().setConversations(updated);
        return updated;
      });
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      addToast(err.message || 'Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (msgId) => {
    if (!activeConv) return;
    try {
      await deleteMessageSocket({ messageId: msgId, conversationId: activeConv });
      setMessages((prev) => prev.map(m => m.id === msgId ? { ...m, content: '[deleted]', isDeleted: true } : m));
      addToast('Message deleted', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to delete', 'error');
    }
  };

  const handleReaction = async (messageId, emoji) => {
    try {
      const msg = messages.find((m) => m.id === messageId);
      const existingReaction = msg?.reactions?.find((r) => r.userId === user?.id);
      if (existingReaction?.emoji === emoji) {
        await removeReaction({ messageId });
      } else {
        await addReaction({ messageId, emoji });
      }
    } catch (err) {
      addToast(err.message || 'Failed to add reaction', 'error');
    }
    setReactionPicker(null);
  };

  const handlePinConversation = async (convId) => {
    try {
      const res = await fetch(`${API}/messages/conversations/${convId}/pin`, { method: 'PATCH', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setConversations((prev) => prev.map((c) => c.id === convId ? { ...c, pinned: data.pinned } : c));
        addToast(data.pinned ? 'Conversation pinned' : 'Conversation unpinned', 'success');
      }
    } catch { addToast('Failed to update', 'error'); }
  };

  const handleArchiveConversation = async (convId) => {
    try {
      const res = await fetch(`${API}/messages/conversations/${convId}/archive`, { method: 'PATCH', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setConversations((prev) => prev.map((c) => c.id === convId ? { ...c, archived: data.archived } : c));
        if (data.archived && activeConv === convId) {
          setActiveConv(null);
          setMessages([]);
          setShowMobileList(true);
        }
        addToast(data.archived ? 'Conversation archived' : 'Conversation restored', 'success');
      }
    } catch { addToast('Failed to update', 'error'); }
  };

  const handleMuteConversation = async (convId) => {
    try {
      const res = await fetch(`${API}/messages/conversations/${convId}/mute`, { method: 'PATCH', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setConversations((prev) => prev.map((c) => c.id === convId ? { ...c, muted: data.muted } : c));
        addToast(data.muted ? 'Conversation muted' : 'Conversation unmuted', 'success');
      }
    } catch { addToast('Failed to update', 'error'); }
  };

  const handleDeleteConversation = async (convId) => {
    try {
      const res = await fetch(`${API}/messages/conversations/${convId}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== convId));
        if (activeConv === convId) {
          setActiveConv(null);
          setMessages([]);
          setShowMobileList(true);
        }
        addToast('Conversation deleted', 'success');
      }
    } catch { addToast('Failed to delete', 'error'); }
  };

  const handleSearchMessages = useCallback(async (q) => {
    if (!q.trim() || !activeConv) { setSearchedMessages([]); return; }
    setSearchingMessages(true);
    try {
      const res = await fetch(`${API}/messages/conversations/${activeConv}/search?q=${encodeURIComponent(q)}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSearchedMessages(data.messages || []);
      }
    } catch {} finally { setSearchingMessages(false); }
  }, [activeConv]);

  const handleContextMenu = (e, convId) => {
    e.preventDefault();
    const conv = conversations.find((c) => c.id === convId);
    if (!conv) return;
    const items = [
      {
        label: conv.pinned ? 'Unpin' : 'Pin Conversation',
        icon: conv.pinned ? <PinOff size={15} /> : <Pin size={15} />,
        onClick: () => handlePinConversation(convId),
      },
      {
        label: conv.muted ? 'Unmute' : 'Mute',
        icon: conv.muted ? <Volume2 size={15} /> : <VolumeX size={15} />,
        onClick: () => handleMuteConversation(convId),
      },
      {
        label: conv.archived ? 'Restore' : 'Archive',
        icon: conv.archived ? <ArchiveRestore size={15} /> : <Archive size={15} />,
        onClick: () => handleArchiveConversation(convId),
      },
      {
        label: 'Delete',
        icon: <Trash2 size={15} />,
        onClick: () => handleDeleteConversation(convId),
        danger: true,
      },
    ];
    setContextMenu({ x: e.clientX, y: e.clientY, items });
  };

  useEffect(() => {
    if (!socketConnected) return;
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (msg) => {
      const isOwn = msg.senderId === user?.id;
      if (msg.conversationId === activeConv) {
        setMessages((prev) => {
          if (prev.find((m) => m.id === msg.id)) return prev;
          const optimistic = prev.findIndex((m) => m._optimistic && m.senderId === msg.senderId && m.content === msg.content && m.conversationId === msg.conversationId);
          if (optimistic >= 0) {
            const updated = [...prev];
            updated[optimistic] = { ...msg, _optimistic: false };
            return updated;
          }
          return [...prev, msg];
        });
        if (!isOwn && !msg.readAt) {
          markAsRead({ conversationId: msg.conversationId, messageIds: [msg.id] });
        }
      }
      if (!isOwn) {
        setConversations((prev) => {
          const updated = prev.map((c) =>
            c.id === msg.conversationId
              ? { ...c, updatedAt: new Date().toISOString(), unreadCount: msg.conversationId === activeConv ? c.unreadCount : (c.unreadCount || 0) + 1, lastMessage: msg }
              : c
          );
          useSocketStore.getState().setConversations(updated);
          return updated;
        });
        queryClient.invalidateQueries({ queryKey: ["dashboard", "recent-messages"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
      }
    };

    const handleTypingStart = ({ conversationId, userId: typingUserId, name }) => {
      setConvTypingUsers((prev) => ({ ...prev, [conversationId]: { userId: typingUserId, name } }));
      if (conversationId === activeConv && typingUserId !== user?.id) {
        setTypingUsers((prev) => {
          if (prev.find((t) => t.userId === typingUserId)) return prev;
          return [...prev, { userId: typingUserId, name }];
        });
      }
    };

    const handleTypingStop = ({ conversationId, userId: typingUserId }) => {
      setConvTypingUsers((prev) => {
        const curr = prev[conversationId];
        if (curr?.userId === typingUserId) {
          const updated = { ...prev };
          delete updated[conversationId];
          return updated;
        }
        return prev;
      });
      if (conversationId === activeConv) {
        setTypingUsers((prev) => prev.filter((t) => t.userId !== typingUserId));
      }
    };

    const handleMessageDelivered = ({ messageId, conversationId }) => {
      setMessages((prev) => prev.map((m) =>
        m.id === messageId ? { ...m, deliveredAt: new Date().toISOString() } : m
      ));
    };

    const handleMessageReadEvent = ({ conversationId, readBy, messageIds }) => {
      if (messageIds?.length > 0) {
        setMessages((prev) => prev.map((m) =>
          messageIds.includes(m.id) ? { ...m, readAt: new Date().toISOString() } : m
        ));
      }
      if (readBy === user?.id) {
        setConversations((prev) => {
          const updated = prev.map((c) =>
            c.id === conversationId ? { ...c, unreadCount: 0 } : c
          );
          useSocketStore.getState().setConversations(updated);
          return updated;
        });
        queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
      }
    };

    const handleMessageDeleted = ({ messageId, conversationId }) => {
      setMessages((prev) => prev.map((m) =>
        m.id === messageId ? { ...m, content: '[deleted]', isDeleted: true } : m
      ));
    };

    const handleReactionAdded = ({ messageId, reaction }) => {
      setMessages((prev) => prev.map((m) => {
        if (m.id !== messageId) return m;
        const reactions = m.reactions ? [...m.reactions] : [];
        const existing = reactions.findIndex((r) => r.userId === reaction.userId);
        if (existing >= 0) {
          reactions[existing] = reaction;
        } else {
          reactions.push(reaction);
        }
        return { ...m, reactions };
      }));
    };

    const handleReactionRemoved = ({ messageId, userId: reactionUserId }) => {
      setMessages((prev) => prev.map((m) => {
        if (m.id !== messageId) return m;
        return { ...m, reactions: (m.reactions || []).filter((r) => r.userId !== reactionUserId) };
      }));
    };

    const handleUserOnline = ({ userId }) => {
      setOnlineStatuses((prev) => ({ ...prev, [userId]: true }));
    };

    const handleUserOffline = ({ userId }) => {
      setOnlineStatuses((prev) => ({ ...prev, [userId]: false }));
    };

    socket.on('new-message', handleNewMessage);
    socket.on('typing-start', handleTypingStart);
    socket.on('typing-stop', handleTypingStop);
    socket.on('message-delivered', handleMessageDelivered);
    socket.on('message-read', handleMessageReadEvent);
    socket.on('message-deleted', handleMessageDeleted);
    socket.on('reaction-added', handleReactionAdded);
    socket.on('reaction-removed', handleReactionRemoved);
    socket.on('user-online', handleUserOnline);
    socket.on('user-offline', handleUserOffline);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('typing-start', handleTypingStart);
      socket.off('typing-stop', handleTypingStop);
      socket.off('message-delivered', handleMessageDelivered);
      socket.off('message-read', handleMessageReadEvent);
      socket.off('message-deleted', handleMessageDeleted);
      socket.off('reaction-added', handleReactionAdded);
      socket.off('reaction-removed', handleReactionRemoved);
      socket.off('user-online', handleUserOnline);
      socket.off('user-offline', handleUserOffline);
    };
  }, [socketConnected, activeConv, user?.id]);

  useEffect(() => {
    if (activeConv && otherParticipant?.id) {
      checkOnline(otherParticipant.id).then((res) => {
        setOnlineStatuses((prev) => ({ ...prev, [otherParticipant.id]: res.online }));
      });
    }
  }, [activeConv, otherParticipant?.id]);

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (!activeConv || !otherParticipant?.id || !socketConnected) return;
    startTyping({ conversationId: activeConv, receiverId: otherParticipant.id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping({ conversationId: activeConv, receiverId: otherParticipant.id });
    }, 3000);
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const res = await fetch(`${API}/messages/accept/${requestId}`, { method: 'POST', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to accept request');
      const data = await res.json();
      addToast('Request accepted!', 'success');
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      if (data.conversation) {
        setConversations((prev) => {
          const exists = prev.find((c) => c.id === data.conversation.id);
          const updated = exists ? prev : [data.conversation, ...prev];
          useSocketStore.getState().setConversations(updated);
          return updated;
        });
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
        setRequests(data.requests || []);
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
            const updated = exists ? prev : [data.conversation, ...prev];
            useSocketStore.getState().setConversations(updated);
            return updated;
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
          const updated = exists ? prev : [data.conversation, ...prev];
          useSocketStore.getState().setConversations(updated);
          return updated;
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
  }, []);

  useEffect(() => {
    if (showNewChat) fetchFollowingUsers();
    else setUserFollowStatus({});
  }, [showNewChat, fetchFollowingUsers]);

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

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeConv || uploading) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const tempId = `temp-${Date.now()}`;
    const isImage = file.type.startsWith('image/');
    const optimistic = {
      id: tempId, conversationId: activeConv, senderId: user?.id,
      sender: { id: user?.id, name: user?.name, image: user?.image },
      content: file.name, messageType: isImage ? 'image' : 'file',
      attachmentUrl: URL.createObjectURL(file), attachmentName: file.name, attachmentSize: file.size,
      createdAt: new Date().toISOString(), _optimistic: true,
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

  const getCompanyInfo = useCallback(async (userId) => {
    try {
      const res = await fetch(`${API}/companies?userId=${userId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        return data.companies?.[0] || null;
      }
    } catch {}
    return null;
  }, []);

  const [otherCompany, setOtherCompany] = useState(null);
  const [otherCompanyLoading, setOtherCompanyLoading] = useState(false);

  useEffect(() => {
    if (!otherParticipant?.id) { setOtherCompany(null); return; }
    let cancelled = false;
    setOtherCompanyLoading(true);
    getCompanyInfo(otherParticipant.id).then((c) => { if (!cancelled) setOtherCompany(c); }).finally(() => { if (!cancelled) setOtherCompanyLoading(false); });
    return () => { cancelled = true; };
  }, [otherParticipant?.id, getCompanyInfo]);

  const handleViewProfile = () => {
    if (otherParticipant?.id) navigate(`/profile/${otherParticipant.id}`);
  };

  const handleViewCompany = () => {
    if (otherCompany?.slug) navigate(`/company/${otherCompany.slug}`);
    else if (otherCompany?.id) navigate(`/company/${otherCompany.id}`);
  };

  const pinnedConvs = conversations.filter((c) => c.pinned && !c.archived);
  const hasPinnedConvs = pinnedConvs.length > 0;

  return (
    <div className="msg-page-root" style={{
      display: 'flex', height: 'calc(100vh - 112px)', margin: -24, padding: 0,
      overflow: 'hidden', backgroundColor: 'var(--background)',
    }}>
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }

        /* Desktop >=1024px: force two-pane layout, override Framer Motion inline styles */
        @media (min-width: 1024px) {
          .msg-page-root {
            height: calc(100vh - 108px) !important;
            margin: -20px !important;
          }
          .msg-sidebar {
            width: 30% !important;
            min-width: 340px !important;
            max-width: 420px !important;
            display: flex !important;
          }
          .msg-chat-panel {
            flex: 1 !important;
            width: 0 !important;
            display: flex !important;
          }
          .msg-chat-back-btn {
            display: none !important;
          }
        }

        /* Tablet 768-1023px: two-pane layout, narrower sidebar */
        @media (min-width: 768px) and (max-width: 1023px) {
          .msg-sidebar {
            width: 35% !important;
            min-width: 280px !important;
            max-width: 350px !important;
            display: flex !important;
          }
          .msg-chat-panel {
            flex: 1 !important;
            width: 0 !important;
            display: flex !important;
          }
          .msg-chat-back-btn {
            display: none !important;
          }
          .msg-chat-header-actions-desktop {
            gap: 2px;
          }
          .msg-info-panel {
            display: none !important;
          }
        }

        /* Mobile <768px: single-pane nav controlled by showMobileList */
        @media (max-width: 767px) {
          .msg-page-root {
            height: calc(100vh - 64px) !important;
            margin: -16px !important;
          }
          .msg-sidebar {
            width: 100% !important;
            min-width: 0 !important;
            border-right: none !important;
          }
          .msg-chat-panel {
            width: 100% !important;
          }
          .msg-chat-back-btn {
            display: flex !important;
          }
          .msg-chat-header-actions-desktop {
            display: none !important;
          }
          .msg-sidebar-filters {
            overflow-x: auto;
          }
          .msg-sidebar-filters::-webkit-scrollbar {
            height: 0;
          }
        }

        /* Small mobile <480px: even tighter margins */
        @media (max-width: 480px) {
          .msg-page-root {
            height: calc(100vh - 64px) !important;
            margin: -12px !important;
          }
        }
      `}</style>

      {/* === LEFT SIDEBAR === */}
      <motion.div
        className="msg-sidebar"
        initial={false}
        animate={{
          width: showMobileList ? '100%' : '25%',
          minWidth: showMobileList ? '100%' : 320,
          maxWidth: showMobileList ? '100%' : 420,
        }}
        style={{
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          backgroundColor: 'var(--surface)',
          overflow: 'hidden',
        }}
      >
        {/* Sidebar Header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px' }}>Messages</h2>
              {requests.length > 0 && (
                <Badge variant="warning" style={{ fontSize: 10, padding: '2px 7px' }}>
                  {requests.length} new
                </Badge>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setShowNewChat(!showNewChat); setNewChatSearch(''); setSearchUsers([]); }}
              style={{
                width: 34, height: 34, borderRadius: 10, border: 'none',
                backgroundColor: showNewChat ? 'var(--primary)' : 'var(--surface-hover)',
                color: showNewChat ? '#fff' : 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: showNewChat ? '0 4px 12px rgba(37,99,235,0.3)' : 'none',
              }}
              title="New Chat"
            >
              <Plus size={18} />
            </motion.button>
          </div>

          {!showNewChat && (
            <>
              {/* Search */}
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <SearchIcon size={15} style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', pointerEvents: 'none',
                }} />
                <input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%', padding: '9px 12px 9px 36px', fontSize: 13,
                    backgroundColor: 'var(--background)', border: '1px solid var(--border)',
                    borderRadius: 10, color: 'var(--text)', outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute', right: 8, top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: 'var(--text-muted)',
                      cursor: 'pointer', padding: 4,
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="msg-sidebar-filters" style={{
                display: 'flex', gap: 4, flexWrap: 'nowrap',
              }}>
                {FILTER_OPTIONS.map((filter) => {
                  const Icon = filter.icon;
                  const isActive = activeFilter === filter.id;
                  return (
                    <motion.button
                      key={filter.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveFilter(filter.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '6px 10px', fontSize: 12, fontWeight: 600,
                        border: 'none', borderRadius: 8, whiteSpace: 'nowrap',
                        backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                        color: isActive ? '#fff' : 'var(--text-secondary)',
                        cursor: 'pointer', transition: 'all 0.15s',
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <Icon size={13} />
                      {filter.label}
                    </motion.button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* New Chat Panel */}
        <AnimatePresence>
          {showNewChat && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden', borderBottom: '1px solid var(--border)' }}
            >
              <div style={{ padding: '12px 20px 16px' }}>
                <div style={{ position: 'relative', marginBottom: 14 }}>
                  <SearchIcon size={15} style={{
                    position: 'absolute', left: 12, top: '50%',
                    transform: 'translateY(-50%)', color: 'var(--text-muted)',
                    pointerEvents: 'none',
                  }} />
                  <input
                    placeholder="Search users..."
                    value={newChatSearch}
                    onChange={(e) => setNewChatSearch(e.target.value)}
                    style={{
                      width: '100%', padding: '9px 12px 9px 36px', fontSize: 13,
                      backgroundColor: 'var(--background)', border: '1px solid var(--border)',
                      borderRadius: 10, color: 'var(--text)', outline: 'none',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                    autoFocus
                  />
                </div>

                {newChatSearch.trim() ? (
                  searchUsersLoading ? (
                    <div style={{ padding: 20, textAlign: 'center' }}>
                      <Spinner size={18} style={{ animation: 'spin 0.7s linear infinite', color: 'var(--text-muted)' }} />
                    </div>
                  ) : searchUsers.length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center' }}>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No users found</p>
                    </div>
                  ) : (
                    searchUsers.map((u) => {
                      const status = userFollowStatus[u.id];
                      const followedByUser = status?.followedBy;
                      const following = status?.following;
                      const isMutual = status?.mutual;
                      const fl = followLoading[u.id];
                      return (
                        <motion.div
                          key={u.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          style={{
                            display: 'flex', gap: 10, padding: '10px 12px',
                            borderRadius: 'var(--radius-sm)',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <div style={{ position: 'relative', flexShrink: 0 }}>
                            <Avatar name={u.name} src={u.image} size={38} />
                            {isUserOnline(u.id) && (
                              <span style={{
                                position: 'absolute', bottom: 0, right: 0,
                                width: 10, height: 10, borderRadius: '50%',
                                backgroundColor: '#22C55E',
                                border: '2px solid var(--surface)',
                              }} />
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                              {u.name}
                              {u.verified && (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="#2563EB" style={{ flexShrink: 0 }}>
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                              )}
                              {followedByUser && (
                                <span style={{
                                  fontSize: 9, color: 'var(--accent)',
                                  backgroundColor: 'var(--accent-light)',
                                  padding: '1px 6px', borderRadius: 100, fontWeight: 600,
                                }}>Follows you</span>
                              )}
                            </div>
                            <p style={{
                              fontSize: 12, color: 'var(--text-secondary)',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>
                              {u.headline || u.role || ''}
                            </p>
                          </div>
                          <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => { e.stopPropagation(); handleToggleFollow(u.id); }}
                              disabled={fl}
                              style={{
                                padding: '4px 10px', fontSize: 11, fontWeight: 600, borderRadius: 100,
                                border: following ? '1px solid var(--border)' : 'none',
                                backgroundColor: following ? 'transparent' : 'var(--primary)',
                                color: following ? 'var(--text-secondary)' : '#fff',
                                cursor: fl ? 'default' : 'pointer', opacity: fl ? 0.6 : 1,
                                whiteSpace: 'nowrap', transition: 'all 0.15s',
                              }}
                            >{fl ? '...' : following ? 'Following' : 'Follow'}</motion.button>
                            {isMutual && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleStartChat(u)}
                                style={{
                                  width: 32, height: 32, borderRadius: 8, border: 'none',
                                  backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  cursor: 'pointer',
                                }}
                                title="Send message"
                              >
                                <MessageCircle size={15} />
                              </motion.button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                  )
                ) : (
                  <>
                    <p style={{
                      fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                      padding: '4px 4px 8px', display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      <User size={13} /> Following ({followingUsers.length})
                    </p>
                    {followingLoading ? (
                      <div style={{ padding: 20, textAlign: 'center' }}>
                        <Spinner size={18} style={{ animation: 'spin 0.7s linear infinite', color: 'var(--text-muted)' }} />
                      </div>
                    ) : followingUsers.length === 0 ? (
                      <div style={{ padding: 24, textAlign: 'center' }}>
                        <User size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>You are not following anyone yet</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Search for users above</p>
                      </div>
                    ) : (
                      followingUsers.map((u, index) => {
                        const status = userFollowStatus[u.id];
                        const isMutual = status?.mutual;
                        const followedByUser = status?.followedBy;
                        const following = status?.following;
                        const fl = followLoading[u.id];
                        return (
                          <motion.div
                            key={u.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            style={{
                              display: 'flex', gap: 10, padding: '10px 12px',
                              borderRadius: 'var(--radius-sm)',
                              transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                              <Avatar name={u.name} src={u.image} size={38} />
                              {isUserOnline(u.id) && (
                                <span style={{
                                  position: 'absolute', bottom: 0, right: 0,
                                  width: 10, height: 10, borderRadius: '50%',
                                  backgroundColor: '#22C55E',
                                  border: '2px solid var(--surface)',
                                }} />
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                                {u.name}
                                {followedByUser && (
                                  <span style={{
                                    fontSize: 9, color: 'var(--accent)',
                                    backgroundColor: 'var(--accent-light)',
                                    padding: '1px 6px', borderRadius: 100, fontWeight: 600,
                                  }}>Follows you</span>
                                )}
                              </div>
                              <p style={{
                                fontSize: 12, color: 'var(--text-secondary)',
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                              }}>
                                {u.headline || u.role || ''}
                              </p>
                            </div>
                            <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => { e.stopPropagation(); handleToggleFollow(u.id); }}
                                disabled={fl}
                                style={{
                                  padding: '4px 10px', fontSize: 11, fontWeight: 600, borderRadius: 100,
                                  border: following ? '1px solid var(--border)' : 'none',
                                  backgroundColor: following ? 'transparent' : 'var(--primary)',
                                  color: following ? 'var(--text-secondary)' : '#fff',
                                  cursor: fl ? 'default' : 'pointer', opacity: fl ? 0.6 : 1,
                                  whiteSpace: 'nowrap',
                                }}
                              >{fl ? '...' : following ? 'Following' : 'Follow'}</motion.button>
                              {isMutual && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleStartChat(u)}
                                  style={{
                                    width: 32, height: 32, borderRadius: 8, border: 'none',
                                    backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer',
                                  }}
                                  title="Send message"
                                >
                                  <MessageCircle size={15} />
                                </motion.button>
                              )}
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conversation List */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {requests.length > 0 && !showNewChat && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div style={{
                padding: '10px 20px', fontSize: 11, fontWeight: 600,
                color: 'var(--text-muted)', textTransform: 'uppercase',
                letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 6,
                backgroundColor: 'var(--surface)',
              }}>
                <Inbox size={13} /> Requests ({requests.length})
              </div>
              {requests.map((req) => {
                const sender = req.sender || req.fromUser || {};
                return (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                      padding: '12px 20px', borderBottom: '1px solid var(--border)',
                      backgroundColor: 'rgba(37,99,235,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <Avatar name={sender.name} src={sender.image} size={36} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                          {sender.name || 'Unknown'}
                          {sender.verified && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#2563EB">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          )}
                        </div>
                        <p style={{
                          fontSize: 12, color: 'var(--text-secondary)',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 8,
                        }}>
                          {req.message || req.content || 'Wants to connect'}
                        </p>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAcceptRequest(req.id)}
                            style={{
                              padding: '5px 14px', fontSize: 12, fontWeight: 600,
                              borderRadius: 8, border: 'none',
                              backgroundColor: 'var(--primary)', color: '#fff',
                              cursor: 'pointer',
                            }}
                          >Accept</motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleDeclineRequest(req.id)}
                            style={{
                              padding: '5px 14px', fontSize: 12, fontWeight: 600,
                              borderRadius: 8, border: '1px solid var(--border)',
                              backgroundColor: 'transparent', color: 'var(--text-secondary)',
                              cursor: 'pointer',
                            }}
                          >Decline</motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {convLoading ? (
            <>
              <SkeletonConversation />
              <SkeletonConversation />
              <SkeletonConversation />
              <SkeletonConversation />
              <SkeletonConversation />
            </>
          ) : convError ? (
            <div style={{ padding: 24, textAlign: 'center' }}>
              <AlertCircle size={32} style={{ color: 'var(--danger)', margin: '0 auto 8px' }} />
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>{convError}</p>
              <Button variant="outline" size="sm" onClick={fetchConversations}>Retry</Button>
            </div>
          ) : filteredConvs.length === 0 ? (
            <EmptyConversations onCreateChat={() => setShowNewChat(true)} />
          ) : (
            <>
              {hasPinnedConvs && !showNewChat && !searchQuery && (
                <div style={{ borderBottom: '1px solid var(--border)' }}>
                  <div style={{
                    padding: '8px 20px 4px', fontSize: 10, fontWeight: 700,
                    color: 'var(--text-muted)', textTransform: 'uppercase',
                    letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <Pin size={11} /> Pinned
                  </div>
                  {filteredConvs.filter((c) => c.pinned).map((c) => {
                    const participant = c.participants?.find((p) => p.user?.id !== user?.id)?.user;
                    const displayName = participant?.name || c.subject || 'Unknown';
                    const avatarName = participant?.name || c.subject || '?';
                    const avatarSrc = participant?.image;
                    const isTyping = convTypingUsers[c.id];
                    return (
                      <motion.div
                        key={c.id}
                        initial={false}
                        whileHover={{ backgroundColor: 'var(--surface-hover)' }}
                        onClick={() => handleSelectConversation(c.id)}
                        onContextMenu={(e) => handleContextMenu(e, c.id)}
                        style={{
                          display: 'flex', gap: 12, padding: '12px 20px',
                          cursor: 'pointer', transition: 'background 0.15s',
                          position: 'relative',
                          backgroundColor: activeConv === c.id ? 'var(--surface-hover)' : 'transparent',
                          borderLeft: activeConv === c.id ? '3px solid var(--primary)' : '3px solid transparent',
                        }}
                      >
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <Avatar name={avatarName} src={avatarSrc} size={44} />
                          {isUserOnline(participant?.id) && (
                            <span style={{
                              position: 'absolute', bottom: 0, right: 0,
                              width: 11, height: 11, borderRadius: '50%',
                              backgroundColor: '#22C55E',
                              border: '2px solid var(--surface)',
                            }} />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
                              <span style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {displayName}
                              </span>
                              {participant?.verified && (
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="#2563EB" style={{ flexShrink: 0 }}>
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 8 }}>
                              {c.muted && <VolumeX size={11} style={{ color: 'var(--text-muted)' }} />}
                              {c.unreadCount > 0 && (
                                <span style={{
                                  fontSize: 10, fontWeight: 700,
                                  color: '#fff',
                                  backgroundColor: 'var(--primary)',
                                  borderRadius: 100,
                                  padding: '2px 7px',
                                  lineHeight: '16px',
                                  minWidth: 18,
                                  textAlign: 'center',
                                }}>{c.unreadCount > 99 ? '99+' : c.unreadCount}</span>
                              )}
                              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lastMsgTime(c)}</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            {c.pinned && <Pin size={10} style={{ color: 'var(--primary)', flexShrink: 0 }} />}
                            <p style={{
                              fontSize: 13, flex: 1,
                              color: isTyping ? 'var(--accent)' : 'var(--text-secondary)',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                              fontStyle: isTyping ? 'italic' : 'normal',
                            }}>
                              {isTyping ? `${isTyping.name} is typing...` : (participant?.id === c.lastMessage?.senderId ? '' : 'You: ') + lastMsgContent(c)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div style={{ padding: '4px 20px', borderBottom: '1px solid var(--border)' }} />
                </div>
              )}

              <AnimatePresence>
                {filteredConvs.filter((c) => !c.pinned).map((c, index) => {
                  const participant = c.participants?.find((p) => p.user?.id !== user?.id)?.user;
                  const displayName = participant?.name || c.subject || 'Unknown';
                  const avatarName = participant?.name || c.subject || '?';
                  const avatarSrc = participant?.image;
                  const isTyping = convTypingUsers[c.id];
                  return (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      whileHover={{ backgroundColor: 'var(--surface-hover)' }}
                      onClick={() => handleSelectConversation(c.id)}
                      onContextMenu={(e) => handleContextMenu(e, c.id)}
                      style={{
                        display: 'flex', gap: 12, padding: '14px 20px',
                        cursor: 'pointer', transition: 'background 0.15s',
                        position: 'relative',
                        backgroundColor: activeConv === c.id ? 'var(--surface-hover)' : 'transparent',
                        borderLeft: activeConv === c.id ? '3px solid var(--primary)' : '3px solid transparent',
                      }}
                    >
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <Avatar name={avatarName} src={avatarSrc} size={44} />
                        {isUserOnline(participant?.id) && (
                          <span style={{
                            position: 'absolute', bottom: 0, right: 0,
                            width: 11, height: 11, borderRadius: '50%',
                            backgroundColor: '#22C55E',
                            border: '2px solid var(--surface)',
                          }} />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
                            <span style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {displayName}
                            </span>
                            {participant?.verified && (
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="#2563EB" style={{ flexShrink: 0 }}>
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                              </svg>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 8 }}>
                            {c.muted && <VolumeX size={11} style={{ color: 'var(--text-muted)' }} />}
                            {c.unreadCount > 0 && (
                              <span style={{
                                fontSize: 10, fontWeight: 700,
                                color: '#fff',
                                backgroundColor: 'var(--primary)',
                                borderRadius: 100,
                                padding: '2px 7px',
                                lineHeight: '16px',
                                minWidth: 18,
                                textAlign: 'center',
                              }}>{c.unreadCount > 99 ? '99+' : c.unreadCount}</span>
                            )}
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lastMsgTime(c)}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <p style={{
                            fontSize: 13, flex: 1,
                            color: isTyping ? 'var(--accent)' : 'var(--text-secondary)',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            fontStyle: isTyping ? 'italic' : 'normal',
                          }}>
                            {isTyping ? `${isTyping.name} is typing...` : (participant?.id === c.lastMessage?.senderId ? '' : 'You: ') + lastMsgContent(c)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </>
          )}
        </div>
      </motion.div>

      {/* === MAIN CHAT PANEL === */}
      <motion.div
        className="msg-chat-panel"
        initial={false}
        animate={{
          width: showMobileList ? '0%' : '75%',
          display: showMobileList ? 'none' : 'flex',
        }}
        style={{
          flex: 1, flexDirection: 'column', backgroundColor: 'var(--background)',
          minWidth: 0, position: 'relative',
        }}
      >
        {activeConvData ? (
          <>
            {/* Chat Header */}
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              style={{
                padding: '12px 24px', borderBottom: '1px solid var(--border)',
                backgroundColor: 'var(--surface)',
                display: 'flex', alignItems: 'center', gap: 12,
                flexShrink: 0, zIndex: 10,
              }}
            >
              <button
                onClick={() => setShowMobileList(true)}
                className="msg-chat-back-btn"
                style={{
                  display: 'none', background: 'none', border: 'none',
                  color: 'var(--text)', padding: 4, cursor: 'pointer', flexShrink: 0,
                }}
                aria-label="Back to conversations"
              >
                <ArrowLeft size={20} />
              </button>
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={handleViewProfile}
                style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', flex: 1, minWidth: 0 }}
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <Avatar
                    name={otherParticipant?.name || activeConvData.subject || '?'}
                    src={otherParticipant?.image}
                    size={40}
                  />
                  {isUserOnline(otherParticipant?.id) && (
                    <span style={{
                      position: 'absolute', bottom: 0, right: 0,
                      width: 12, height: 12, borderRadius: '50%',
                      backgroundColor: '#22C55E',
                      border: '2px solid var(--surface)',
                    }} />
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {otherParticipant?.name || activeConvData.subject || 'Unknown'}
                    </span>
                    {otherParticipant?.verified && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#2563EB" style={{ flexShrink: 0 }}>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {typingUsers.length > 0 ? (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}
                      >
                        typing
                        <span style={{ animation: 'bounce 1.4s infinite', display: 'inline-block' }}>.</span>
                        <span style={{ animation: 'bounce 1.4s infinite 0.2s', display: 'inline-block' }}>.</span>
                        <span style={{ animation: 'bounce 1.4s infinite 0.4s', display: 'inline-block' }}>.</span>
                      </motion.span>
                    ) : (
                      <>
                        {isUserOnline(otherParticipant?.id) ? (
                          <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}>Online</span>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {otherParticipant?.lastActiveAt
                              ? `Last seen ${formatTime(otherParticipant.lastActiveAt)} ago`
                              : 'Offline'}
                          </span>
                        )}
                        {otherParticipant?.role && (
                          <>
                            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>•</span>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                              {otherParticipant.role}
                            </span>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Header Actions */}
              <div className="msg-chat-header-actions-desktop" style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                <motion.button
                  whileHover={{ backgroundColor: 'var(--surface-hover)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleViewProfile}
                  style={{ ...iconBtnStyle }} title="View Profile"
                >
                  <User size={18} />
                </motion.button>
                {otherCompany && (
                  <motion.button
                    whileHover={{ backgroundColor: 'var(--surface-hover)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleViewCompany}
                    style={{ ...iconBtnStyle }} title="View Company"
                  >
                    <Building2 size={18} />
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ backgroundColor: 'var(--surface-hover)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSearchMessages(!showSearchMessages)}
                  style={{
                    ...iconBtnStyle,
                    backgroundColor: showSearchMessages ? 'var(--surface-hover)' : 'transparent',
                    color: showSearchMessages ? 'var(--primary)' : 'var(--text-secondary)',
                  }}
                  title="Search Messages"
                >
                  <SearchMessages size={18} />
                </motion.button>
                <motion.button
                  whileHover={{ backgroundColor: 'var(--surface-hover)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowQuickSettings(!showQuickSettings)}
                  style={{
                    ...iconBtnStyle,
                    backgroundColor: showQuickSettings ? 'var(--surface-hover)' : 'transparent',
                  }}
                  title="More options"
                >
                  <MoreHorizontal size={18} />
                </motion.button>
              </div>

              {/* Quick Settings Dropdown */}
              <AnimatePresence>
                {showQuickSettings && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    style={{
                      position: 'absolute', top: '100%', right: 24, zIndex: 100,
                      width: 200, backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-xl)', padding: 4,
                    }}
                  >
                    <button onClick={() => { handlePinConversation(activeConv); setShowQuickSettings(false); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', fontSize: 13, border: 'none', background: 'none', color: 'var(--text)', cursor: 'pointer', borderRadius: 6 }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    ><Pin size={15} /> {activeConvData?.pinned ? 'Unpin' : 'Pin'}</button>
                    <button onClick={() => { handleMuteConversation(activeConv); setShowQuickSettings(false); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', fontSize: 13, border: 'none', background: 'none', color: 'var(--text)', cursor: 'pointer', borderRadius: 6 }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    ><VolumeX size={15} /> {activeConvData?.muted ? 'Unmute' : 'Mute'}</button>
                    <button onClick={() => { handleArchiveConversation(activeConv); setShowQuickSettings(false); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', fontSize: 13, border: 'none', background: 'none', color: 'var(--text)', cursor: 'pointer', borderRadius: 6 }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    ><Archive size={15} /> Archive</button>
                    <button onClick={() => { handleDeleteConversation(activeConv); setShowQuickSettings(false); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', fontSize: 13, border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer', borderRadius: 6 }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    ><Trash2 size={15} /> Delete</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Search Messages Bar */}
            <AnimatePresence>
              {showSearchMessages && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    backgroundColor: 'var(--surface)',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ padding: '10px 24px', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <SearchMessages size={15} style={{
                        position: 'absolute', left: 12, top: '50%',
                        transform: 'translateY(-50%)', color: 'var(--text-muted)',
                        pointerEvents: 'none',
                      }} />
                      <input
                        placeholder="Search in this conversation..."
                        value={searchMessagesQuery}
                        onChange={(e) => { setSearchMessagesQuery(e.target.value); handleSearchMessages(e.target.value); }}
                        style={{
                          width: '100%', padding: '8px 12px 8px 36px', fontSize: 13,
                          backgroundColor: 'var(--background)', border: '1px solid var(--border)',
                          borderRadius: 8, color: 'var(--text)', outline: 'none',
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        autoFocus
                      />
                    </div>
                    <button
                      onClick={() => { setShowSearchMessages(false); setSearchMessagesQuery(''); setSearchedMessages([]); }}
                      style={{
                        padding: '6px 12px', fontSize: 12, fontWeight: 600,
                        border: 'none', borderRadius: 8, backgroundColor: 'transparent',
                        color: 'var(--text-secondary)', cursor: 'pointer',
                      }}
                    >Cancel</button>
                  </div>
                  {searchingMessages && (
                    <div style={{ padding: '8px 24px', textAlign: 'center' }}>
                      <Spinner size={14} style={{ animation: 'spin 0.7s linear infinite', color: 'var(--text-muted)' }} />
                    </div>
                  )}
                  {searchedMessages.length > 0 && (
                    <div style={{
                      maxHeight: 200, overflow: 'auto',
                      borderTop: '1px solid var(--border)',
                    }}>
                      {searchedMessages.map((sm) => {
                        const isMine = sm.senderId === user?.id;
                        return (
                          <div
                            key={sm.id}
                            onClick={() => {
                              const el = messagesContainerRef.current?.querySelector(`[data-msg-id="${sm.id}"]`);
                              if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
                              setShowSearchMessages(false);
                              setSearchMessagesQuery('');
                              setSearchedMessages([]);
                            }}
                            style={{
                              display: 'flex', gap: 10, padding: '8px 24px',
                              cursor: 'pointer', transition: 'background 0.1s',
                              borderBottom: '1px solid var(--border)',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <Avatar name={sm.sender?.name} src={sm.sender?.image} size={24} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: isMine ? 'var(--primary)' : 'var(--text)' }}>
                                {sm.sender?.name || 'Unknown'}
                              </div>
                              <p style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {sm.content}
                              </p>
                            </div>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
                              {formatMessageTime(sm.createdAt)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {searchMessagesQuery && !searchingMessages && searchedMessages.length === 0 && (
                    <div style={{ padding: '12px 24px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                      No messages found
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages Area */}
            <div
              ref={messagesContainerRef}
              style={{
                flex: 1, overflow: 'auto', padding: '24px 0',
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
                <div style={{ padding: '0 24px' }}>
                  <SkeletonMessage />
                  <SkeletonMessage />
                  <SkeletonMessage />
                  <SkeletonMessage />
                  <SkeletonMessage />
                </div>
              ) : msgError ? (
                <div style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: 8, padding: 24,
                }}>
                  <AlertCircle size={32} style={{ color: 'var(--danger)' }} />
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{msgError}</p>
                  <Button variant="outline" size="sm" onClick={() => fetchMessagesApi(activeConv, 1)}>Retry</Button>
                </div>
              ) : messages.length === 0 ? (
                <EmptyMessages />
              ) : (
                <>
                  {loadingMore && (
                    <div style={{ textAlign: 'center', padding: '12px 0' }}>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                        style={{ display: 'inline-flex' }}
                      >
                        <Spinner size={16} style={{ color: 'var(--text-muted)' }} />
                      </motion.div>
                    </div>
                  )}
                  {hasMoreMessages && !loadingMore && messages.length >= PAGE_SIZE && (
                    <div style={{ textAlign: 'center', padding: '8px 0' }}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={loadMoreMessages}
                        style={{
                          background: 'none', border: 'none', color: 'var(--primary)',
                          fontSize: 13, cursor: 'pointer', display: 'inline-flex',
                          alignItems: 'center', gap: 4, fontWeight: 500,
                        }}
                      >
                        <ChevronDown size={14} /> Load older messages
                      </motion.button>
                    </div>
                  )}

                  <AnimatePresence initial={false}>
                    {groupMessagesByDate(messages).map((group) => (
                      <div key={group.date}>
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          style={{ textAlign: 'center', padding: '8px 24px 16px' }}
                        >
                          <span style={{
                            fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
                            backgroundColor: 'var(--surface)',
                            padding: '4px 14px', borderRadius: 100,
                            border: '1px solid var(--border)',
                            display: 'inline-block',
                          }}>
                            {formatDateSeparator(group.date)}
                          </span>
                        </motion.div>
                        {group.items.map((m, idx) => {
                          const isMine = m.senderId === user?.id || m.sender?.id === user?.id;
                          const sender = m.sender || {};
                          const showSender = !isMine && (idx === 0 || group.items[idx - 1]?.senderId !== m.senderId);
                          return (
                            <motion.div
                              key={m.id}
                              data-msg-id={m.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                              style={{
                                display: 'flex',
                                flexDirection: isMine ? 'row-reverse' : 'row',
                                gap: 10,
                                padding: '2px 24px',
                                position: 'relative',
                                marginBottom: showSender ? 12 : 2,
                              }}
                              onMouseEnter={() => setHoveredMsgId(m.id)}
                              onMouseLeave={() => { setHoveredMsgId(null); setReactionPicker(null); }}
                            >
                              {/* Avatar column */}
                              <div style={{ width: 32, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                {!isMine && showSender && (
                                  <Avatar name={sender.name || '?'} src={sender.image} size={32} />
                                )}
                                {!isMine && !showSender && <div style={{ width: 32 }} />}
                              </div>

                              <div style={{
                                maxWidth: '68%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: isMine ? 'flex-end' : 'flex-start',
                              }}>
                                {/* Sender name */}
                                {!isMine && showSender && sender.name && (
                                  <span style={{
                                    fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)',
                                    marginBottom: 3, marginLeft: 4,
                                  }}>
                                    {sender.name}
                                  </span>
                                )}

                                {/* Reply preview */}
                                {m.parent && !m.isDeleted && m.parent.content && (
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onClick={() => {
                                      const el = messagesContainerRef.current?.querySelector(`[data-msg-id="${m.parent.id}"]`);
                                      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }}
                                    style={{
                                      fontSize: 12, color: 'var(--text-muted)',
                                      backgroundColor: 'var(--surface)',
                                      padding: '5px 12px', borderRadius: '8px 8px 0 0',
                                      borderLeft: '3px solid var(--primary)',
                                      marginBottom: 2, maxWidth: '100%',
                                      cursor: 'pointer',
                                      whiteSpace: 'nowrap', overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    <span style={{ fontWeight: 600 }}>{m.parent.sender?.name || 'Unknown'}</span>: {m.parent.content}
                                  </motion.div>
                                )}

                                {/* Message bubble */}
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
                                  boxShadow: isMine ? '0 2px 8px rgba(37,99,235,0.15)' : 'var(--shadow-sm)',
                                  position: 'relative',
                                }}>
                                  {m.messageType === 'image' ? (
                                    <div>
                                      <img
                                        src={m.attachmentUrl}
                                        alt={m.content}
                                        style={{
                                          maxWidth: 280, maxHeight: 280,
                                          borderRadius: 10, display: 'block',
                                          cursor: 'pointer',
                                        }}
                                        onClick={() => window.open(m.attachmentUrl, '_blank')}
                                        loading="lazy"
                                      />
                                    </div>
                                  ) : m.messageType === 'file' ? (
                                    <a
                                      href={m.attachmentUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        color: 'inherit', textDecoration: 'none',
                                        display: 'flex', alignItems: 'center', gap: 8,
                                      }}
                                    >
                                      <div style={{
                                        width: 36, height: 36, borderRadius: 8,
                                        backgroundColor: isMine ? 'rgba(255,255,255,0.15)' : 'var(--background)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0,
                                      }}>
                                        {m.attachmentUrl?.match(/\.(pdf)$/i) ? <FileText size={18} /> : <FileIcon size={18} />}
                                      </div>
                                      <div style={{ minWidth: 0 }}>
                                        <p style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                          {m.content}
                                        </p>
                                        {m.attachmentSize && (
                                          <p style={{ fontSize: 11, opacity: 0.7 }}>
                                            {m.attachmentSize > 1024 * 1024
                                              ? `${(m.attachmentSize / (1024 * 1024)).toFixed(1)} MB`
                                              : `${(m.attachmentSize / 1024).toFixed(0)} KB`}
                                          </p>
                                        )}
                                      </div>
                                      <Download size={16} style={{ flexShrink: 0, opacity: 0.7 }} />
                                    </a>
                                  ) : m.isDeleted ? (
                                    <span style={{ fontSize: 13 }}>This message was deleted</span>
                                  ) : (
                                    <p style={{ fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{m.content}</p>
                                  )}
                                </div>

                                {/* Reactions */}
                                {m.reactions && m.reactions.length > 0 && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    style={{
                                      display: 'flex', gap: 2, marginTop: 2,
                                      flexWrap: 'wrap', alignSelf: 'flex-start',
                                    }}
                                  >
                                    {m.reactions.map((r) => (
                                      <span
                                        key={r.id}
                                        style={{
                                          fontSize: 14, padding: '1px 5px', borderRadius: 8,
                                          backgroundColor: r.userId === user?.id ? 'var(--primary-light)' : 'var(--surface)',
                                          border: r.userId === user?.id ? '1px solid var(--primary)' : '1px solid var(--border)',
                                          cursor: 'pointer',
                                          display: 'inline-flex', alignItems: 'center', gap: 2,
                                        }}
                                        title={r.user?.name || ''}
                                        onClick={() => handleReaction(m.id, r.emoji)}
                                      >
                                        {r.emoji}
                                      </span>
                                    ))}
                                  </motion.div>
                                )}

                                {/* Timestamp + read status */}
                                <span style={{
                                  fontSize: 10,
                                  color: 'var(--text-muted)',
                                  display: 'block',
                                  textAlign: 'right',
                                  marginTop: 2,
                                  paddingRight: 4,
                                  paddingLeft: 4,
                                }}>
                                  {formatMessageTime(m.createdAt)}
                                  {m.editedAt && !m.isDeleted && (
                                    <span style={{ marginLeft: 4 }}>(edited)</span>
                                  )}
                                  {isMine && (
                                    <span style={{ marginLeft: 4, display: 'inline-flex', gap: 2, verticalAlign: 'middle' }}>
                                      {m._optimistic && <Clock size={10} style={{ color: 'var(--text-muted)' }} />}
                                      {!m._optimistic && !m.deliveredAt && <Clock size={10} style={{ color: 'var(--text-muted)' }} />}
                                      {m.deliveredAt && !m.readAt && <CheckCheck size={10} style={{ color: 'var(--text-muted)' }} />}
                                      {m.readAt && <CheckCheck size={10} style={{ color: 'var(--accent)' }} />}
                                    </span>
                                  )}
                                </span>

                                {/* Hover actions */}
                                {hoveredMsgId === m.id && !m.isDeleted && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                      display: 'flex', gap: 1, marginTop: 2,
                                      alignSelf: isMine ? 'flex-end' : 'flex-start',
                                      backgroundColor: 'var(--surface)',
                                      border: '1px solid var(--border)',
                                      borderRadius: 8,
                                      padding: 2,
                                      boxShadow: 'var(--shadow-md)',
                                    }}
                                  >
                                    <button
                                      onClick={() => setReactionPicker(reactionPicker === m.id ? null : m.id)}
                                      style={{ ...iconBtnStyle, width: 26, height: 26, borderRadius: 6 }}
                                      title="React"
                                    >
                                      <SmilePlus size={13} />
                                    </button>
                                    <button
                                      onClick={() => setReplyingTo({ id: m.id, content: m.content, senderId: sender.id || m.senderId, sender: sender })}
                                      style={{ ...iconBtnStyle, width: 26, height: 26, borderRadius: 6 }}
                                      title="Reply"
                                    >
                                      <ReplyIcon size={13} />
                                    </button>
                                    {isMine && (
                                      <button
                                        onClick={() => handleDelete(m.id)}
                                        style={{ ...iconBtnStyle, width: 26, height: 26, borderRadius: 6, color: 'var(--danger)' }}
                                        title="Delete"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    )}
                                  </motion.div>
                                )}

                                {/* Reaction picker popup */}
                                <AnimatePresence>
                                  {reactionPicker === m.id && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.9, y: 5 }}
                                      style={{
                                        position: 'absolute', bottom: '100%',
                                        left: isMine ? 'auto' : 0,
                                        right: isMine ? 0 : 'auto',
                                        display: 'flex', gap: 2, padding: '4px 6px',
                                        backgroundColor: 'var(--surface)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 100,
                                        boxShadow: 'var(--shadow-lg)',
                                        zIndex: 10, marginBottom: 4,
                                      }}
                                    >
                                      {REACTION_EMOJIS.map((emoji) => (
                                        <button
                                          key={emoji}
                                          onClick={() => handleReaction(m.id, emoji)}
                                          style={{
                                            border: 'none', background: 'none', fontSize: 20,
                                            cursor: 'pointer', padding: 2, borderRadius: 4,
                                            lineHeight: 1, transition: 'transform 0.1s',
                                          }}
                                          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.3)'; e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                                        >{emoji}</button>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ))}
                  </AnimatePresence>

                  {/* Typing indicator */}
                  <AnimatePresence>
                    {typingUsers.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        style={{
                          display: 'flex', gap: 10, padding: '4px 24px', marginTop: 4,
                          alignItems: 'center',
                        }}
                      >
                        <Avatar name={typingUsers[0]?.name || '?'} src={''} size={28} />
                        <div style={{
                          padding: '10px 16px', borderRadius: 16,
                          borderBottomLeftRadius: 4,
                          backgroundColor: 'var(--surface)',
                          display: 'flex', gap: 4, alignItems: 'center',
                          boxShadow: 'var(--shadow-sm)',
                        }}>
                          {[0, 1, 2].map((i) => (
                            <span key={i} style={{
                              width: 7, height: 7, borderRadius: '50%',
                              backgroundColor: 'var(--text-muted)',
                              animation: `bounce 1.4s infinite ${i * 0.2}s`,
                            }} />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              style={{
                padding: '14px 24px', borderTop: '1px solid var(--border)',
                backgroundColor: 'var(--surface)',
                flexShrink: 0,
              }}
            >
              {/* Reply preview */}
              <AnimatePresence>
                {replyingTo && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 12px', marginBottom: 8,
                      backgroundColor: 'var(--background)',
                      borderRadius: 'var(--radius-sm)',
                      borderLeft: '3px solid var(--primary)',
                      fontSize: 13, color: 'var(--text-secondary)',
                    }}
                  >
                    <ReplyIcon size={14} style={{ flexShrink: 0 }} />
                    <div style={{
                      flex: 1, minWidth: 0, whiteSpace: 'nowrap',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      <span style={{ fontWeight: 600 }}>{replyingTo.sender?.name || 'Unknown'}</span>: {replyingTo.content}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setReplyingTo(null)}
                      style={{
                        background: 'none', border: 'none', color: 'var(--text-muted)',
                        cursor: 'pointer', padding: 2, flexShrink: 0,
                      }}
                    >
                      <X size={16} />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end' }}>
                    {/* Emoji button */}
                    <div style={{ position: 'relative' }}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setEmojiOpen(!emojiOpen); setQuickReplyOpen(false); }}
                        style={{ ...iconBtnStyle, marginBottom: 2 }} title="Emoji"
                      >
                        <SmilePlus size={18} />
                      </motion.button>
                      <AnimatePresence>
                        {emojiOpen && <EmojiPicker onSelect={(emoji) => { setNewMessage((prev) => prev + emoji); }} onClose={() => setEmojiOpen(false)} />}
                      </AnimatePresence>
                    </div>

                    {/* Quick replies */}
                    <div style={{ position: 'relative' }}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setQuickReplyOpen(!quickReplyOpen); setEmojiOpen(false); }}
                        style={{ ...iconBtnStyle, marginBottom: 2 }} title="Quick reply"
                      >
                        <Zap size={18} />
                      </motion.button>
                      <AnimatePresence>
                        {quickReplyOpen && <QuickReplies onSelect={(reply) => { setNewMessage((prev) => prev + reply); setQuickReplyOpen(false); }} />}
                      </AnimatePresence>
                    </div>

                    {/* File upload */}
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fileInputRef.current?.click()}
                      style={{ ...iconBtnStyle, marginBottom: 2, opacity: uploading ? 0.5 : 1 }}
                      disabled={uploading} title="Attach file"
                    >
                      <Paperclip size={18} />
                    </motion.button>

                    {/* Text input */}
                    <div style={{ flex: 1, position: 'relative' }}>
                      <input
                        value={newMessage}
                        onChange={handleInputChange}
                        placeholder="Type a message..."
                        disabled={sending}
                        style={{
                          width: '100%', padding: '10px 16px', fontSize: 14,
                          backgroundColor: 'var(--background)',
                          border: '1px solid var(--border)',
                          borderRadius: 24,
                          color: 'var(--text)', outline: 'none',
                          opacity: sending ? 0.6 : 1,
                          transition: 'border-color 0.15s',
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        maxLength={5000}
                      />
                    </div>
                  </div>
                </div>

                {/* Send button */}
                <motion.button
                  whileHover={newMessage.trim() ? { scale: 1.05 } : {}}
                  whileTap={newMessage.trim() ? { scale: 0.95 } : {}}
                  onClick={handleSend}
                  disabled={sending || !newMessage.trim()}
                  style={{
                    width: 42, height: 42, borderRadius: '50%',
                    backgroundColor: newMessage.trim() ? 'var(--primary)' : 'var(--border)',
                    color: newMessage.trim() ? '#fff' : 'var(--text-muted)',
                    border: 'none', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0,
                    cursor: newMessage.trim() ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    boxShadow: newMessage.trim() ? '0 4px 12px rgba(37,99,235,0.3)' : 'none',
                  }}
                >
                  {sending ? (
                    <Spinner size={16} style={{ animation: 'spin 0.7s linear infinite' }} />
                  ) : (
                    <Send size={18} />
                  )}
                </motion.button>
              </div>

              {/* Character counter */}
              {newMessage.length > 4000 && (
                <div style={{
                  textAlign: 'right', fontSize: 11, color: newMessage.length >= 5000 ? 'var(--danger)' : 'var(--text-muted)',
                  marginTop: 4, paddingRight: 56,
                }}>
                  {newMessage.length}/5000
                </div>
              )}
            </motion.div>
          </>
        ) : (
          /* Empty State - No conversation selected */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 20, padding: 40,
            }}
          >
            <div style={{
              width: 96, height: 96, borderRadius: 24,
              background: 'linear-gradient(135deg, var(--primary-light), var(--accent-light))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <MessageCircle size={44} style={{ color: 'var(--primary)' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.3px' }}>
                Your Messages
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 360, lineHeight: 1.6 }}>
                Select a conversation from the sidebar or discover new people to connect with.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8, width: '100%', maxWidth: 380 }}>
              <motion.div
                whileHover={{ y: -2, boxShadow: 'var(--shadow-md)' }}
                onClick={() => navigate('/discover')}
                style={{
                  padding: 16, borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)', cursor: 'pointer',
                  textAlign: 'center', transition: 'all 0.15s',
                  backgroundColor: 'var(--surface)',
                }}
              >
                <Briefcase size={24} style={{ color: 'var(--primary)', marginBottom: 6 }} />
                <p style={{ fontSize: 13, fontWeight: 600 }}>Browse Opportunities</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Find investments</p>
              </motion.div>
              <motion.div
                whileHover={{ y: -2, boxShadow: 'var(--shadow-md)' }}
                onClick={() => setShowNewChat(true)}
                style={{
                  padding: 16, borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)', cursor: 'pointer',
                  textAlign: 'center', transition: 'all 0.15s',
                  backgroundColor: 'var(--surface)',
                }}
              >
                <User size={24} style={{ color: '#EC4899', marginBottom: 6 }} />
                <p style={{ fontSize: 13, fontWeight: 600 }}>New Conversation</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Start chatting</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            items={contextMenu.items}
            onClose={() => setContextMenu(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
