import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Send, Search as SearchIcon, ArrowLeft, Phone, Video,
  MoreHorizontal, ChevronDown, Loader as Spinner, Inbox,
  User, Clock, CheckCheck, AlertCircle, Trash2, Reply as ReplyIcon,
  SmilePlus, X, Paperclip, Image as ImageIcon, Plus, MessageCircle,
  Share2, Briefcase, Calendar, Building2, MapPin, Award, Target, Globe, DollarSign,
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

const EMOJIS = ['😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','😍','🥰','😘','😗','😙','🥲','😛','😜','🤪','😝','🤑','🤗','🤭','🫡','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','😮','😯','😲','😳','🥺','😢','😭','😤','😡','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖','🎃','😺','😸','😹','😻','😼','😽','🙀','😿','😾','💋','👋','🤚','🖐','✋','🖖','👌','🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','🫶','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦵','🦶','👂','🦻','👃','🧠','🫀','🫁','🦷','🦴','👀','👁','👅','👄','💘','❤️','🩷','🧡','💛','💚','💙','🩵','💜','🖤','🩶','🤍','🤎','💔','❤️‍🔥','❤️‍🩹','❣️','💕','💞','💓','💗','💖','💝','💟','☮️','✝️','☪️','🕉','☸️','✡️','🔯','🕎','☯️','☦️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','🆔','⚕️','🌍','🌎','🌏','🌐','🗺','🧭','🏔','⛰','🌋','🗻','🏕','🏖','🏜','🏝','🏞','🏟','🏛','🏗','🛖','🏘','🏚','🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏨','🏩','🏪','🏫','🏬','🏭','🏯','🏰','💒','🗼','🗽','⛪','🕌','🛕','🕍','⛩','🕋','⛲','⛺','🌁','🌃','🏙','🌄','🌅','🌆','🌇','🌇','🌉','🎠','🎡','🎢','💈','🎪','🚂','🚃','🚄','🚅','🚆','🚇','🚈','🚉','🚊','🚝','🚞','🚋','🚌','🚍','🚎','🚐','🚑','🚒','🚓','🚔','🚕','🚖','🚗','🚘','🚙','🛻','🚚','🚛','🚜','🏎','🏍','🛵','🛺','🚲','🛴','🛹','🛼','🚏','🛣','🛤','⛽','🛞','🚨','🚥','🚦','🛑','🚧','⚓','🛟','⛵','🛶','🚤','🛳','⛴','🛥','🚢','✈️','🛩','🛫','🛬','🪂','💺','🚁','🚟','🚠','🚡','🛰','🚀','🛸','🏧','🚮','🚰','♿','🚹','🚺','🚻','🚼','🚾','🛂','🛃','🛄','🛅','⚠️','🚸','⛔','🚫','🚳','🚭','🚯','🚱','🚷','📵','🔞','☢️','☣️','💯','♻️','✅','🈯','💹','❇️','✳️','❌','❎','💠','🏁','🚩','🎌','🏴','🏳️‍🌈','🏳️‍⚧️'];

const REACTION_EMOJIS = ['❤️', '👍', '🔥', '😂', '👏', '🎉'];

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

  const [typingUsers, setTypingUsers] = useState([]);
  const [convTypingUsers, setConvTypingUsers] = useState({});
  const [reactionPicker, setReactionPicker] = useState(null);
  const [onlineStatuses, setOnlineStatuses] = useState({});

  const [showShareModal, setShowShareModal] = useState(false);
  const [shareSearch, setShareSearch] = useState('');
  const [shareOpportunities, setShareOpportunities] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleDescription, setScheduleDescription] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const previousScrollHeight = useRef(0);
  const prevFirstMessageId = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socketConnected = useSocketStore((s) => s.isConnected);

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
      addToast(err.message, 'error');
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
      setConversations((prev) => prev.map((c) =>
        c.id === activeConv
          ? { ...c, updatedAt: new Date().toISOString() }
          : c
      ));
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
        setConversations((prev) => prev.map((c) =>
          c.id === msg.conversationId
            ? { ...c, updatedAt: new Date().toISOString(), unreadCount: (c.unreadCount || 0) + 1 }
            : c
        ));
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

    const handleMessageReadEvent = ({ conversationId, messageIds }) => {
      if (messageIds?.length > 0) {
        setMessages((prev) => prev.map((m) =>
          m.senderId === user?.id && messageIds.includes(m.id) ? { ...m, readAt: new Date().toISOString() } : m
        ));
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

  const isUserOnline = (userId) => onlineStatuses[userId] === true;

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

  useEffect(() => {
    if (!showShareModal) { setShareOpportunities([]); setShareSearch(''); return; }
    let cancelled = false;
    setShareLoading(true);
    fetch(`${API}/discover/listings?limit=10`, { credentials: 'include' })
      .then((r) => r.ok ? r.json() : { listings: [] })
      .then((data) => { if (!cancelled) setShareOpportunities(data.listings || []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setShareLoading(false); });
    return () => { cancelled = true; };
  }, [showShareModal]);

  useEffect(() => {
    if (!shareSearch.trim() || !showShareModal) return;
    const timer = setTimeout(() => {
      fetch(`${API}/discover/listings?search=${encodeURIComponent(shareSearch)}&limit=10`, { credentials: 'include' })
        .then((r) => r.ok ? r.json() : { listings: [] })
        .then((data) => setShareOpportunities(data.listings || []))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [shareSearch, showShareModal]);

  const handleShareOpportunity = () => {
    setShowShareModal(true);
  };

  const handleConfirmShare = async (opp) => {
    if (!activeConv || !otherParticipant?.id) return;
    try {
      const content = `${opp.title} — ${opp.company?.name || ''} ${window.location.origin}/listing/${opp.slug || opp.id}`;
      const result = await sendMessage({
        receiverId: otherParticipant.id,
        conversationId: activeConv,
        content,
        messageType: 'text',
      });
      if (result.message) {
        setMessages((prev) => [...prev, result.message]);
        addToast('Opportunity shared!', 'success');
      }
      setShowShareModal(false);
    } catch (err) {
      addToast(err.message || 'Failed to share', 'error');
    }
  };

  const handleScheduleMeeting = () => {
    setShowScheduleModal(true);
  };

  const handleConfirmSchedule = async () => {
    if (!scheduleDate || !scheduleTitle.trim() || !activeConv || !otherParticipant?.id) return;
    setScheduleLoading(true);
    try {
      const content = `/meeting:${scheduleTitle.trim()}|${scheduleDate}|${scheduleDescription.trim()}`;
      const result = await sendMessage({
        receiverId: otherParticipant.id,
        conversationId: activeConv,
        content,
        messageType: 'text',
      });
      if (result.message) {
        setMessages((prev) => [...prev, result.message]);
        addToast('Meeting invitation sent!', 'success');
      }
      setShowScheduleModal(false);
      setScheduleTitle('');
      setScheduleDate('');
      setScheduleDescription('');
    } catch (err) {
      addToast(err.message || 'Failed to schedule meeting', 'error');
    } finally {
      setScheduleLoading(false);
    }
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
                        <div key={u.id}
                          style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius-sm)', transition: 'background 0.15s' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <div style={{ position: 'relative' }}>
                            <Avatar name={u.name} src={u.image} size={36} />
                            {isUserOnline(u.id) && <span style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', backgroundColor: '#22C55E', border: '2px solid var(--surface)' }} />}
                          </div>
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
                            <button onClick={(e) => { e.stopPropagation(); handleToggleFollow(u.id); }}
                              disabled={fl}
                              style={{
                                padding: '4px 10px', fontSize: 12, fontWeight: 600, borderRadius: 100,
                                border: following ? '1px solid var(--border)' : 'none',
                                backgroundColor: following ? 'transparent' : 'var(--primary)',
                                color: following ? 'var(--text-secondary)' : '#fff',
                                cursor: fl ? 'default' : 'pointer', opacity: fl ? 0.6 : 1,
                                whiteSpace: 'nowrap',
                              }}
                            >{fl ? '...' : following ? 'Following' : 'Follow'}</button>
                            {isMutual && (
                              <button onClick={() => handleStartChat(u)}
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
                        <div key={u.id}
                          style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius-sm)', transition: 'background 0.15s' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <div style={{ position: 'relative' }}>
                            <Avatar name={u.name} src={u.image} size={36} />
                            {isUserOnline(u.id) && <span style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', backgroundColor: '#22C55E', border: '2px solid var(--surface)' }} />}
                          </div>
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
                            <button onClick={(e) => { e.stopPropagation(); handleToggleFollow(u.id); }}
                              disabled={fl}
                              style={{
                                padding: '4px 10px', fontSize: 12, fontWeight: 600, borderRadius: 100,
                                border: following ? '1px solid var(--border)' : 'none',
                                backgroundColor: following ? 'transparent' : 'var(--primary)',
                                color: following ? 'var(--text-secondary)' : '#fff',
                                cursor: fl ? 'default' : 'pointer', opacity: fl ? 0.6 : 1,
                                whiteSpace: 'nowrap',
                              }}
                            >{fl ? '...' : following ? 'Following' : 'Follow'}</button>
                            {isMutual && (
                              <button onClick={() => handleStartChat(u)}
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
                        {isUserOnline(participant?.id) && (
                          <span style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: '50%', backgroundColor: '#22C55E', border: '2px solid var(--surface)' }} />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 14, fontWeight: 400 }}>
                            {displayName}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {c.unreadCount > 0 && (
                              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', backgroundColor: 'var(--primary-light)', borderRadius: 100, padding: '1px 7px', lineHeight: '18px', minWidth: 18, textAlign: 'center' }}>{c.unreadCount}</span>
                            )}
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lastMsgTime(c)}</span>
                          </div>
                        </div>
                        <p style={{
                          fontSize: 13, color: convTypingUsers[c.id] ? 'var(--accent)' : 'var(--text-secondary)',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2,
                          fontStyle: convTypingUsers[c.id] ? 'italic' : 'normal',
                        }}>
                          {convTypingUsers[c.id] ? `${convTypingUsers[c.id].name} is typing...` : (participant?.id === c.lastMessage?.senderId ? '' : 'You: ') + (convTypingUsers[c.id] ? '' : lastMsgContent(c))}
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
              <div style={{ position: 'relative' }}>
                <Avatar name={otherParticipant?.name || activeConvData.subject || '?'} src={otherParticipant?.image} size={38} />
                {isUserOnline(otherParticipant?.id) && <span style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', backgroundColor: '#22C55E', border: '2px solid var(--surface)' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  {otherParticipant?.name || activeConvData.subject || 'Unknown'}
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
                  <Button variant="outline" size="sm" onClick={() => fetchMessagesApi(activeConv, 1)}>Retry</Button>
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
                              <Avatar name={sender.name || '?'} src={sender.image} size={28} style={{ marginTop: 4, flexShrink: 0 }} />
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
                                <p style={{ fontSize: 14, lineHeight: 1.5 }}>
                                  {m.isDeleted ? 'Message deleted' : m.messageType === 'image' ? (
                                    <img src={m.attachmentUrl} alt={m.content} style={{ maxWidth: 240, maxHeight: 240, borderRadius: 8, display: 'block' }} />
                                  ) : m.messageType === 'file' ? (
                                    <a href={m.attachmentUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <Paperclip size={14} /> {m.content}
                                    </a>
                                  ) : m.content}
                                </p>
                              </div>
                              {m.reactions && m.reactions.length > 0 && (
                                <div style={{ display: 'flex', gap: 2, marginTop: 2, flexWrap: 'wrap' }}>
                                  {m.reactions.map((r) => (
                                    <span key={r.id} style={{
                                      fontSize: 14, padding: '1px 4px', borderRadius: 8,
                                      backgroundColor: r.userId === user?.id ? 'var(--primary-light)' : 'var(--surface)',
                                      cursor: 'default',
                                    }} title={r.user?.name || ''}>
                                      {r.emoji}
                                    </span>
                                  ))}
                                </div>
                              )}
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
                                  <span style={{ marginLeft: 4, display: 'inline-flex', gap: 2, verticalAlign: 'middle' }}>
                                    {m.deliveredAt && !m.readAt && <CheckCheck size={12} style={{ color: 'var(--text-muted)' }} />}
                                    {m.readAt && <CheckCheck size={12} style={{ color: 'var(--accent)' }} />}
                                    {!m.deliveredAt && !m._optimistic && <Clock size={12} style={{ color: 'var(--text-muted)' }} />}
                                    {m._optimistic && <Clock size={12} style={{ color: 'var(--text-muted)' }} />}
                                  </span>
                                )}
                              </span>
                              {hoveredMsgId === m.id && (
                                <div style={{
                                  display: 'flex', gap: 2, marginTop: 2,
                                  alignSelf: isMine ? 'flex-end' : 'flex-start',
                                }}>
                                  <button onClick={() => setReactionPicker(reactionPicker === m.id ? null : m.id)}
                                    style={{ ...iconBtnStyle, width: 28, height: 28 }}
                                    title="React">
                                    <SmilePlus size={14} />
                                  </button>
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
                                  {reactionPicker === m.id && (
                                    <div style={{
                                      position: 'absolute', bottom: '100%', left: isMine ? 'auto' : 0, right: isMine ? 0 : 'auto',
                                      display: 'flex', gap: 2, padding: '4px 6px',
                                      backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
                                      borderRadius: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                      zIndex: 10, marginBottom: 4,
                                    }}>
                                      {REACTION_EMOJIS.map((emoji) => (
                                        <button key={emoji} onClick={() => handleReaction(m.id, emoji)}
                                          style={{
                                            border: 'none', background: 'none', fontSize: 18, cursor: 'pointer',
                                            padding: 2, borderRadius: 4, lineHeight: 1,
                                          }}
                                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >{emoji}</button>
                                      ))}
                                    </div>
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
                      <Avatar name={typingUsers[0]?.name || '?'} src={''} size={28} />
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
                    <button onClick={() => setEmojiOpen(!emojiOpen)} style={{ ...iconBtnStyle, marginBottom: 2 }} title="Emoji">
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
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 40 }}>
            <Inbox size={48} style={{ color: 'var(--text-muted)' }} />
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', fontWeight: 500 }}>Select a conversation</p>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center' }}>Choose a conversation from the left panel to start messaging</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12, width: '100%', maxWidth: 400 }}>
              <div onClick={() => navigate('/discover')} style={{ padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', cursor: 'pointer', textAlign: 'center', transition: 'background 0.15s', backgroundColor: 'var(--surface)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'} onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surface)'}>
                <Briefcase size={24} style={{ color: 'var(--primary)', marginBottom: 6 }} />
                <p style={{ fontSize: 13, fontWeight: 600 }}>Browse Opportunities</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Find franchise investments</p>
              </div>
              <div onClick={() => navigate('/companies')} style={{ padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', cursor: 'pointer', textAlign: 'center', transition: 'background 0.15s', backgroundColor: 'var(--surface)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'} onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surface)'}>
                <Building2 size={24} style={{ color: 'var(--accent)', marginBottom: 6 }} />
                <p style={{ fontSize: 13, fontWeight: 600 }}>Explore Companies</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Discover franchisors</p>
              </div>
              <div onClick={() => setShowNewChat(true)} style={{ padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', cursor: 'pointer', textAlign: 'center', transition: 'background 0.15s', backgroundColor: 'var(--surface)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'} onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surface)'}>
                <User size={24} style={{ color: '#EC4899', marginBottom: 6 }} />
                <p style={{ fontSize: 13, fontWeight: 600 }}>New Message</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Start a conversation</p>
              </div>
              <div onClick={() => navigate('/notifications')} style={{ padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', cursor: 'pointer', textAlign: 'center', transition: 'background 0.15s', backgroundColor: 'var(--surface)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'} onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surface)'}>
                <Bell size={24} style={{ color: '#F59E0B', marginBottom: 6 }} />
                <p style={{ fontSize: 13, fontWeight: 600 }}>Notifications</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>View your notifications</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{
        width: 300, borderLeft: '1px solid var(--border)', backgroundColor: 'var(--surface)',
        padding: 20, flexShrink: 0, overflowY: 'auto',
        ...(activeConvData ? {} : { display: 'none' }),
      }}>
        {otherParticipant ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Avatar name={otherParticipant.name} src={otherParticipant.image} size={64} style={{ margin: '0 auto 12px' }} />
                {isUserOnline(otherParticipant.id) && <span style={{ position: 'absolute', bottom: 4, right: 4, width: 14, height: 14, borderRadius: '50%', backgroundColor: '#22C55E', border: '3px solid var(--surface)' }} />}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>{otherParticipant.name}</h3>
              {otherParticipant.role && (
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{otherParticipant.role}</p>
              )}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
                {isUserOnline(otherParticipant.id) ? <Badge variant="success">Online</Badge> : <Badge variant="secondary">Offline</Badge>}
                {otherParticipant.email && <Badge variant="info">{otherParticipant.email}</Badge>}
              </div>
            </div>

            {otherCompany && !otherCompanyLoading ? (
              <div style={{ marginBottom: 16, padding: 12, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--background)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  {otherCompany.logoUrl ? (
                    <img src={otherCompany.logoUrl} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 700, fontSize: 16 }}>
                      {otherCompany.name?.[0] || '?'}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{otherCompany.name}</span>
                      {otherCompany.isVerified && <Badge variant="success" style={{ fontSize: 9, padding: '1px 5px' }}>✓</Badge>}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{otherCompany.industry || 'Company'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                  {otherCompany._count?.followers !== undefined && <span><Heart size={12} style={{ display: 'inline', marginRight: 2 }} />{otherCompany._count.followers} followers</span>}
                  {otherCompany._count?.listings !== undefined && <span><Briefcase size={12} style={{ display: 'inline', marginRight: 2 }} />{otherCompany._count.listings} listings</span>}
                  {otherCompany.location && <span><MapPin size={12} style={{ display: 'inline', marginRight: 2 }} />{otherCompany.location}</span>}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Button size="sm" variant="outline" style={{ flex: 1, padding: '4px 8px', fontSize: 11 }} onClick={() => navigate(`/company/${otherCompany.slug || otherCompany.id}`)}>
                    <Building2 size={12} /> View Company
                  </Button>
                  <Button size="sm" variant="outline" style={{ flex: 1, padding: '4px 8px', fontSize: 11 }} onClick={() => navigate(`/company/${otherCompany.slug || otherCompany.id}?tab=opportunities`)}>
                    <Target size={12} /> Opportunities
                  </Button>
                </div>
              </div>
            ) : otherCompanyLoading ? (
              <div style={{ marginBottom: 16, padding: 12, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--background)' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: 'var(--border)', animation: 'shimmer 1.5s infinite' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ width: '60%', height: 12, backgroundColor: 'var(--border)', borderRadius: 4, marginBottom: 6, animation: 'shimmer 1.5s infinite' }} />
                    <div style={{ width: '40%', height: 10, backgroundColor: 'var(--border)', borderRadius: 4, animation: 'shimmer 1.5s infinite' }} />
                  </div>
                </div>
              </div>
            ) : null}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2 }}>EMAIL</p>
                <p style={{ fontSize: 13, wordBreak: 'break-all' }}>{otherParticipant.email || '—'}</p>
              </div>
              {otherParticipant.phone && (
                <div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2 }}>PHONE</p>
                  <p style={{ fontSize: 13 }}>{otherParticipant.phone}</p>
                </div>
              )}
              {otherParticipant.location && (
                <div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2 }}>LOCATION</p>
                  <p style={{ fontSize: 13 }}>{otherParticipant.location}</p>
                </div>
              )}
            </div>
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Button variant="outline" size="sm" fullWidth icon={<Phone size={14} />}>Call</Button>
              <Button variant="outline" size="sm" fullWidth icon={<Video size={14} />}>Video</Button>
              <Button variant="primary" size="sm" fullWidth icon={<Share2 size={14} />} onClick={handleShareOpportunity}>Share Opportunity</Button>
              <Button variant="secondary" size="sm" fullWidth icon={<Calendar size={14} />} onClick={handleScheduleMeeting}>Schedule Meeting</Button>
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

      {showShareModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowShareModal(false)}>
          <div style={{ width: 420, maxHeight: '70vh', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: 24, overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600 }}>Share an Opportunity</h3>
              <button onClick={() => setShowShareModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}><X size={20} /></button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Send an opportunity link to {otherParticipant?.name}</p>
            <input
              placeholder="Search your opportunities..."
              value={shareSearch}
              onChange={(e) => setShareSearch(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', fontSize: 13, marginBottom: 12,
                backgroundColor: 'var(--background)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', color: 'var(--text)', outline: 'none',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {shareLoading ? (
                <div style={{ padding: 20, textAlign: 'center' }}><Spinner size={18} style={{ animation: 'spin 0.7s linear infinite', color: 'var(--text-muted)' }} /></div>
              ) : shareOpportunities.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No opportunities found</p>
              ) : shareOpportunities.map((opp) => (
                <div key={opp.id} onClick={() => handleConfirmShare(opp)} style={{ display: 'flex', gap: 12, padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706', flexShrink: 0 }}>
                    <Target size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600 }}>{opp.title}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{opp.company?.name}</p>
                    {opp.investmentMin && <p style={{ fontSize: 11, color: 'var(--text-muted)' }}><DollarSign size={10} style={{ display: 'inline' }} /> {formatCurrency(opp.investmentMin)} - {formatCurrency(opp.investmentMax)}</p>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, alignSelf: 'center' }}>Share →</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showScheduleModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowScheduleModal(false)}>
          <div style={{ width: 420, backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600 }}>Schedule a Meeting</h3>
              <button onClick={() => setShowScheduleModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Meeting Title</label>
                <input
                  placeholder="e.g. Discuss franchise opportunity"
                  value={scheduleTitle}
                  onChange={(e) => setScheduleTitle(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', fontSize: 13,
                    backgroundColor: 'var(--background)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', color: 'var(--text)', outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Date & Time</label>
                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', fontSize: 13,
                    backgroundColor: 'var(--background)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', color: 'var(--text)', outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Description (optional)</label>
                <textarea
                  placeholder="Meeting agenda, notes..."
                  value={scheduleDescription}
                  onChange={(e) => setScheduleDescription(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%', padding: '10px 14px', fontSize: 13, resize: 'vertical',
                    backgroundColor: 'var(--background)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', color: 'var(--text)', outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
              <Button variant="primary" fullWidth onClick={handleConfirmSchedule} disabled={scheduleLoading || !scheduleTitle.trim() || !scheduleDate}>
                {scheduleLoading ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
