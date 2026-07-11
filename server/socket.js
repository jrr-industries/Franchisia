import { Server } from "socket.io";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "./lib/auth.ts";
import prisma from "./prisma.js";

const onlineUsers = new Map();
const userSockets = new Map();
let ioInstance = null;

export function getIO() {
  return ioInstance;
}

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        process.env.CLIENT_URL || "http://localhost:5173",
        "http://localhost:5174",
      ],
      credentials: true,
      methods: ["GET", "POST"],
    },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  ioInstance = io;

  const authenticateSocket = async (socket, next) => {
    try {
      const cookies = socket.handshake.headers.cookie || "";
      const mockReq = { headers: { cookie: cookies } };
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(mockReq.headers),
      });
      if (!session?.user) {
        return next(new Error("Authentication required"));
      }
      socket.userId = session.user.id;
      socket.user = session.user;
      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  };

  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    const userId = socket.userId;
    console.log(`User connected: ${userId}`);

    trackUserOnline(userId, socket.id);
    socket.join(userId);
    broadcastOnlineStatus(io, userId, true);

    socket.on("send-message", async (data, callback) => {
      try {
        const { receiverId, conversationId, content, messageType, parentId } = data;
        if (!receiverId || !conversationId || !content?.trim()) {
          return callback?.({ error: "Invalid payload" });
        }

        const participant = await prisma.conversationParticipant.findUnique({
          where: {
            conversationId_userId: {
              conversationId,
              userId,
            },
          },
        });
        if (!participant) {
          return callback?.({ error: "Not a participant" });
        }

        const receiverExists = await prisma.conversationParticipant.findUnique({
          where: {
            conversationId_userId: {
              conversationId,
              userId: receiverId,
            },
          },
        });
        if (!receiverExists) {
          return callback?.({ error: "Receiver not in conversation" });
        }

        const message = await prisma.message.create({
          data: {
            conversationId,
            senderId: userId,
            content: content.trim(),
            messageType: messageType || "text",
            parentId: parentId || null,
          },
          include: {
            sender: {
              select: { id: true, name: true, image: true, role: true },
            },
            parent: {
              select: {
                id: true,
                content: true,
                senderId: true,
                sender: { select: { id: true, name: true } },
              },
            },
          },
        });

        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        });

        io.to(receiverId).emit("new-message", message);
        io.to(userId).emit("new-message", message);

        if (isUserOnline(receiverId)) {
          await prisma.message.update({
            where: { id: message.id },
            data: { deliveredAt: new Date() },
          });
          io.to(receiverId).emit("message-delivered", {
            messageId: message.id,
            conversationId,
          });
          callback?.({ message: { ...message, deliveredAt: new Date().toISOString() } });
        } else {
          callback?.({ message });
        }

        const notifyReceiver = !isUserOnline(receiverId);
        if (notifyReceiver || true) {
          const notification = await prisma.notification.create({
            data: {
              userId: receiverId,
              type: "new_message",
              title: "New Message",
              body: `${socket.user?.name || "Someone"}: ${content.substring(0, 100)}`,
              data: { conversationId, senderId: userId },
            },
          });
          io.to(receiverId).emit("notification", notification);
        }
      } catch (err) {
        console.error("send-message error:", err);
        callback?.({ error: "Failed to send message" });
      }
    });

    socket.on("typing-start", (data) => {
      const { conversationId, receiverId } = data;
      if (!conversationId || !receiverId) return;
      io.to(receiverId).emit("typing-start", {
        conversationId,
        userId,
        name: socket.user?.name,
      });
    });

    socket.on("typing-stop", (data) => {
      const { conversationId, receiverId } = data;
      if (!conversationId || !receiverId) return;
      io.to(receiverId).emit("typing-stop", {
        conversationId,
        userId,
      });
    });

    socket.on("message-read", async (data) => {
      try {
        const { conversationId, messageIds } = data;
        if (!conversationId) return;

        await prisma.conversationParticipant.updateMany({
          where: { conversationId, userId },
          data: { lastReadAt: new Date() },
        });

        if (messageIds?.length > 0) {
          await prisma.message.updateMany({
            where: {
              id: { in: messageIds },
              conversationId,
              senderId: { not: userId },
              readAt: null,
            },
            data: { readAt: new Date() },
          });
        }

        const participants = await prisma.conversationParticipant.findMany({
          where: { conversationId, userId: { not: userId } },
          select: { userId: true },
        });

        for (const p of participants) {
          io.to(p.userId).emit("message-read", {
            conversationId,
            readBy: userId,
            messageIds,
          });
        }
      } catch (err) {
        console.error("message-read error:", err);
      }
    });

    socket.on("reaction-add", async (data, callback) => {
      try {
        const { messageId, emoji } = data;
        if (!messageId || !emoji) return callback?.({ error: "Invalid payload" });

        const message = await prisma.message.findUnique({
          where: { id: messageId },
          include: { conversation: { include: { participants: { select: { userId: true } } } } },
        });
        if (!message) return callback?.({ error: "Message not found" });

        const reaction = await prisma.messageReaction.upsert({
          where: { messageId_userId: { messageId, userId } },
          update: { emoji },
          create: { messageId, userId, emoji },
          include: { user: { select: { id: true, name: true, image: true } } },
        });

        for (const p of message.conversation.participants) {
          io.to(p.userId).emit("reaction-added", { messageId, reaction });
        }
        callback?.({ reaction });
      } catch (err) {
        console.error("reaction-add error:", err);
        callback?.({ error: "Failed to add reaction" });
      }
    });

    socket.on("reaction-remove", async (data, callback) => {
      try {
        const { messageId } = data;
        if (!messageId) return callback?.({ error: "Invalid payload" });

        const message = await prisma.message.findUnique({
          where: { id: messageId },
          include: { conversation: { include: { participants: { select: { userId: true } } } } },
        });
        if (!message) return callback?.({ error: "Message not found" });

        await prisma.messageReaction.deleteMany({
          where: { messageId, userId },
        });

        for (const p of message.conversation.participants) {
          io.to(p.userId).emit("reaction-removed", { messageId, userId });
        }
        callback?.({ success: true });
      } catch (err) {
        console.error("reaction-remove error:", err);
        callback?.({ error: "Failed to remove reaction" });
      }
    });

    socket.on("message-delete", async (data, callback) => {
      try {
        const { messageId, conversationId } = data;
        if (!messageId) return callback?.({ error: "Invalid payload" });

        const message = await prisma.message.findUnique({ where: { id: messageId } });
        if (!message) return callback?.({ error: "Message not found" });
        if (message.senderId !== userId) return callback?.({ error: "Not authorized" });

        await prisma.message.update({
          where: { id: messageId },
          data: { content: "[deleted]", isDeleted: true, deletedAt: new Date() },
        });

        const participants = await prisma.conversationParticipant.findMany({
          where: { conversationId: message.conversationId },
          select: { userId: true },
        });
        for (const p of participants) {
          io.to(p.userId).emit("message-deleted", {
            messageId,
            conversationId: message.conversationId,
          });
        }
        callback?.({ success: true });
      } catch (err) {
        console.error("message-delete error:", err);
        callback?.({ error: "Failed to delete message" });
      }
    });

    socket.on("check-online", (data, callback) => {
      const { userId: targetUserId } = data;
      if (!targetUserId) return;
      callback?.({ online: isUserOnline(targetUserId) });
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${userId}`);
      removeUserSocket(userId, socket.id);
      if (!isUserOnline(userId)) {
        broadcastOnlineStatus(io, userId, false);
      }
    });
  });

  return io;
}

function trackUserOnline(userId, socketId) {
  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }
  userSockets.get(userId).add(socketId);
  onlineUsers.set(userId, true);
}

function removeUserSocket(userId, socketId) {
  const sockets = userSockets.get(userId);
  if (sockets) {
    sockets.delete(socketId);
    if (sockets.size === 0) {
      userSockets.delete(userId);
      onlineUsers.delete(userId);
    }
  }
}

export function isUserOnline(userId) {
  return onlineUsers.has(userId) && userSockets.has(userId) && userSockets.get(userId).size > 0;
}

function broadcastOnlineStatus(io, userId, online) {
  io.emit(online ? "user-online" : "user-offline", { userId });
}

export function getOnlineUsers() {
  return Array.from(onlineUsers.keys());
}

export function emitCompanyCreated(company) {
  ioInstance?.emit("company-created", company);
}

export function emitCompanyUpdated(company) {
  ioInstance?.emit("company-updated", company);
}

export function emitCompanyDeleted(companyId) {
  ioInstance?.emit("company-deleted", { id: companyId });
}

export function emitCompanyVerified(company) {
  ioInstance?.emit("company-verified", company);
}
