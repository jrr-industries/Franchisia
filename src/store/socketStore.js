import { create } from "zustand";
import { connectSocket, disconnectSocket, getSocket } from "../lib/socket";

const useSocketStore = create((set, get) => ({
  isConnected: false,
  socketId: null,
  onlineUsers: {},
  typingUsers: {},
  unreadCount: 0,
  notificationCount: 0,
  conversations: [],

  connect: () => {
    const socket = connectSocket();
    if (!socket) return;

    socket.on("connect", () => {
      set({ isConnected: true, socketId: socket.id });
    });

    socket.on("disconnect", () => {
      set({ isConnected: false, socketId: null });
    });

    socket.on("user-online", ({ userId }) => {
      set((state) => ({
        onlineUsers: { ...state.onlineUsers, [userId]: true },
      }));
    });

    socket.on("user-offline", ({ userId }) => {
      set((state) => {
        const updated = { ...state.onlineUsers };
        delete updated[userId];
        return { onlineUsers: updated };
      });
    });

    socket.on("new-message", (message) => {
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === message.conversationId
            ? { ...c, lastMessage: message, updatedAt: new Date().toISOString(), unreadCount: c.id === get().activeConversationId ? c.unreadCount : (c.unreadCount || 0) + 1 }
            : c
        ),
      }));
    });

    socket.on("message-delivered", ({ messageId, conversationId }) => {
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversationId ? { ...c, messages: c.messages?.map((m) => m.id === messageId ? { ...m, deliveredAt: new Date().toISOString() } : m) } : c
        ),
      }));
    });

    socket.on("message-read", ({ conversationId, readBy, messageIds }) => {
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversationId ? { ...c, messages: c.messages?.map((m) => messageIds?.includes(m.id) ? { ...m, readAt: new Date().toISOString() } : m) } : c
        ),
      }));
    });

    socket.on("message-deleted", ({ messageId, conversationId }) => {
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversationId
            ? { ...c, messages: c.messages?.map((m) => m.id === messageId ? { ...m, content: "[deleted]", isDeleted: true } : m) }
            : c
        ),
      }));
    });

    socket.on("notification", (notification) => {
      set((state) => ({
        notificationCount: state.notificationCount + 1,
      }));
    });

    return socket;
  },

  disconnect: () => {
    disconnectSocket();
    set({
      isConnected: false,
      socketId: null,
      onlineUsers: {},
      typingUsers: {},
    });
  },

  setConversations: (conversations) => set({ conversations }),

  setActiveConversationId: (id) => set({ activeConversationId: id }),

  setTyping: (conversationId, userId, name, isTyping) => {
    set((state) => {
      const key = `${conversationId}-${userId}`;
      const typing = { ...state.typingUsers };
      if (isTyping) {
        typing[key] = { userId, name, timestamp: Date.now() };
      } else {
        delete typing[key];
      }
      return { typingUsers: typing };
    });
  },

  clearTyping: (conversationId, userId) => {
    set((state) => {
      const typing = { ...state.typingUsers };
      delete typing[`${conversationId}-${userId}`];
      return { typingUsers: typing };
    });
  },
}));

export default useSocketStore;
