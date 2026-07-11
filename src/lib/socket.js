import { io } from "socket.io-client";

let socket = null;

export function getSocket() {
  return socket;
}

export function connectSocket() {
  if (socket?.connected) return socket;
  socket = io(undefined, {
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    transports: ["websocket", "polling"],
  });
  socket.on("connect", () => {
    console.log("[Socket] Connected:", socket.id);
  });
  socket.on("disconnect", (reason) => {
    console.log("[Socket] Disconnected:", reason);
  });
  socket.on("connect_error", (err) => {
    console.error("[Socket] Connection error:", err.message);
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

export function sendMessage({ receiverId, conversationId, content, messageType = "text", parentId = null }) {
  return new Promise((resolve, reject) => {
    if (!socket?.connected) return reject(new Error("Socket not connected"));
    socket.emit("send-message", { receiverId, conversationId, content, messageType, parentId }, (response) => {
      if (response?.error) return reject(new Error(response.error));
      resolve(response);
    });
  });
}

export function startTyping({ conversationId, receiverId }) {
  if (!socket?.connected) return;
  socket.emit("typing-start", { conversationId, receiverId });
}

export function stopTyping({ conversationId, receiverId }) {
  if (!socket?.connected) return;
  socket.emit("typing-stop", { conversationId, receiverId });
}

export function markAsRead({ conversationId, messageIds = [] }) {
  if (!socket?.connected) return;
  socket.emit("message-read", { conversationId, messageIds });
}

export function addReaction({ messageId, emoji }) {
  return new Promise((resolve, reject) => {
    if (!socket?.connected) return reject(new Error("Socket not connected"));
    socket.emit("reaction-add", { messageId, emoji }, (response) => {
      if (response?.error) return reject(new Error(response.error));
      resolve(response);
    });
  });
}

export function removeReaction({ messageId }) {
  return new Promise((resolve, reject) => {
    if (!socket?.connected) return reject(new Error("Socket not connected"));
    socket.emit("reaction-remove", { messageId }, (response) => {
      if (response?.error) return reject(new Error(response.error));
      resolve(response);
    });
  });
}

export function deleteMessageSocket({ messageId, conversationId }) {
  return new Promise((resolve, reject) => {
    if (!socket?.connected) return reject(new Error("Socket not connected"));
    socket.emit("message-delete", { messageId, conversationId }, (response) => {
      if (response?.error) return reject(new Error(response.error));
      resolve(response);
    });
  });
}

export function checkOnline(userId) {
  return new Promise((resolve) => {
    if (!socket?.connected) return resolve({ online: false });
    socket.emit("check-online", { userId }, (response) => {
      resolve(response || { online: false });
    });
  });
}
