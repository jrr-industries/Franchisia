import { Router } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.ts";
import prisma from "../prisma.js";

const TypingTimers = {};

const router = Router();

router.use(async (req, res, next) => {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session?.user) return res.status(401).json({ error: "Authentication required" });
    req.user = session.user;
    next();
  } catch (e) {
    res.status(500).json({ error: "Auth failed" });
  }
});

router.get("/conversations", async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { participants: { some: { userId: req.user.id } } },
      include: {
        participants: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    });
    res.json({ conversations });
  } catch (error) {
    console.error("Messages route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/conversations", async (req, res) => {
  try {
    const { participantId, subject } = req.body;
    const existing = await prisma.conversation.findFirst({
      where: {
        participants: { every: { userId: { in: [req.user.id, participantId] } } },
      },
      orderBy: { createdAt: "desc" },
    });
    if (existing) return res.json({ conversation: existing });
    const conversation = await prisma.conversation.create({
      data: {
        subject,
        participants: {
          create: [
            { userId: req.user.id },
            { userId: participantId },
          ],
        },
      },
      include: {
        participants: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
      },
    });
    res.json({ conversation });
  } catch (error) {
    console.error("Messages route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/conversations/:id/messages", async (req, res) => {
  try {
    const participant = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId: req.params.id, userId: req.user.id } },
    });
    if (!participant) return res.status(403).json({ error: "Not a participant of this conversation" });

    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const messages = await prisma.message.findMany({
      where: { conversationId: req.params.id },
      skip,
      take: parseInt(limit),
      include: {
        sender: { select: { id: true, name: true, image: true } },
        parent: { select: { id: true, content: true, senderId: true, sender: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    const total = await prisma.message.count({ where: { conversationId: req.params.id } });
    await prisma.conversationParticipant.updateMany({
      where: { conversationId: req.params.id, userId: req.user.id },
      data: { lastReadAt: new Date() },
    });
    res.json({ messages: messages.reverse(), total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error("Messages route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/conversations/:id/messages", async (req, res) => {
  try {
    const participant = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId: req.params.id, userId: req.user.id } },
    });
    if (!participant) return res.status(403).json({ error: "Not a participant of this conversation" });

    const { content, messageType, attachmentUrl, parentId } = req.body;
    const message = await prisma.message.create({
      data: {
        conversationId: req.params.id,
        senderId: req.user.id,
        content,
        messageType: messageType || "text",
        attachmentUrl,
        parentId: parentId || null,
      },
      include: {
        sender: { select: { id: true, name: true, image: true, role: true } },
        parent: { select: { id: true, content: true, senderId: true, sender: { select: { id: true, name: true } } } },
      },
    });
    await prisma.conversation.update({ where: { id: req.params.id }, data: { updatedAt: new Date() } });
    const participants = await prisma.conversationParticipant.findMany({
      where: { conversationId: req.params.id, userId: { not: req.user.id } },
    });
    for (const p of participants) {
      await prisma.notification.create({
        data: {
          userId: p.userId,
          type: "new_message",
          title: "New Message",
          body: `${req.user.name || "Someone"}: ${content.substring(0, 100)}`,
          data: { conversationId: req.params.id, senderId: req.user.id },
        },
      });
    }
    res.json({ message });
  } catch (error) {
    console.error("Messages route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/request", async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    if (!recipientId) return res.status(400).json({ error: "recipientId is required" });
    if (recipientId === req.user.id) return res.status(400).json({ error: "Cannot send request to yourself" });

    const existing = await prisma.messageRequest.findUnique({
      where: { senderId_recipientId: { senderId: req.user.id, recipientId } },
    });
    if (existing && existing.status !== "declined") {
      return res.status(409).json({ error: "Message request already exists" });
    }

    const messageRequest = await prisma.messageRequest.create({
      data: {
        senderId: req.user.id,
        recipientId,
        status: "pending",
      },
    });

    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: "message_request",
        title: "New Message Request",
        body: `${req.user.name || "Someone"} wants to send you a message`,
        data: { senderId: req.user.id, requestId: messageRequest.id, content: content || null },
      },
    });

    res.json({ request: messageRequest });
  } catch (error) {
    console.error("Messages route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/accept/:requestId", async (req, res) => {
  try {
    const messageRequest = await prisma.messageRequest.findUnique({
      where: { id: req.params.requestId },
      include: { sender: { select: { id: true, name: true, image: true } } },
    });
    if (!messageRequest) return res.status(404).json({ error: "Message request not found" });
    if (messageRequest.recipientId !== req.user.id) return res.status(403).json({ error: "Not authorized" });
    if (messageRequest.status !== "pending") return res.status(400).json({ error: "Request is not pending" });

    await prisma.messageRequest.update({
      where: { id: req.params.requestId },
      data: { status: "accepted" },
    });

    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId: messageRequest.senderId },
            { userId: req.user.id },
          ],
        },
      },
    });

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: req.user.id,
        content: `${messageRequest.sender.name} connected with you`,
        messageType: "system",
      },
    });

    await prisma.notification.create({
      data: {
        userId: messageRequest.senderId,
        type: "message_request_accepted",
        title: "Message Request Accepted",
        body: `${req.user.name || "Someone"} accepted your message request`,
        data: { recipientId: req.user.id, conversationId: conversation.id },
      },
    });

    res.json({ conversation });
  } catch (error) {
    console.error("Messages route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/requests/pending", async (req, res) => {
  try {
    const requests = await prisma.messageRequest.findMany({
      where: { recipientId: req.user.id, status: "pending" },
      include: { sender: { select: { id: true, name: true, image: true, role: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ requests });
  } catch (error) {
    console.error("Messages route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/reject/:requestId", async (req, res) => {
  try {
    const messageRequest = await prisma.messageRequest.findUnique({
      where: { id: req.params.requestId },
    });
    if (!messageRequest) return res.status(404).json({ error: "Message request not found" });
    if (messageRequest.recipientId !== req.user.id) return res.status(403).json({ error: "Not authorized" });
    if (messageRequest.status !== "pending") return res.status(400).json({ error: "Request is not pending" });

    await prisma.messageRequest.update({
      where: { id: req.params.requestId },
      data: { status: "declined" },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Messages route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/conversations/:convId/messages/:msgId", async (req, res) => {
  try {
    const message = await prisma.message.findUnique({ where: { id: req.params.msgId } });
    if (!message) return res.status(404).json({ error: "Message not found" });
    if (message.senderId !== req.user.id) return res.status(403).json({ error: "Not authorized" });

    await prisma.message.update({ where: { id: req.params.msgId }, data: { content: "[deleted]", isDeleted: true } });
    res.json({ success: true });
  } catch (error) {
    console.error("Messages route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/conversations/:id/typing", async (req, res) => {
  try {
    const participant = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId: req.params.id, userId: req.user.id } },
    });
    if (!participant) return res.status(403).json({ error: "Not a participant" });

    const otherParticipants = await prisma.conversationParticipant.findMany({
      where: { conversationId: req.params.id, userId: { not: req.user.id } },
      select: { userId: true, typingAt: true },
    });

    const typingUsers = [];
    const now = Date.now();
    for (const p of otherParticipants) {
      if (p.typingAt && (now - new Date(p.typingAt).getTime()) < 3000) {
        const u = await prisma.user.findUnique({ where: { id: p.userId }, select: { id: true, name: true, image: true } });
        if (u) typingUsers.push(u);
      }
    }
    res.json({ typing: typingUsers });
  } catch (error) {
    console.error("Messages route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/conversations/:id/typing", async (req, res) => {
  try {
    const participant = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId: req.params.id, userId: req.user.id } },
    });
    if (!participant) return res.status(403).json({ error: "Not a participant" });

    await prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId: req.params.id, userId: req.user.id } },
      data: { typingAt: new Date() },
    });

    const key = `${req.params.id}-${req.user.id}`;
    if (TypingTimers[key]) clearTimeout(TypingTimers[key]);
    TypingTimers[key] = setTimeout(async () => {
      try {
        await prisma.conversationParticipant.update({
          where: { conversationId_userId: { conversationId: req.params.id, userId: req.user.id } },
          data: { typingAt: null },
        });
      } catch {}
      delete TypingTimers[key];
    }, 3000);

    res.json({ success: true });
  } catch (error) {
    console.error("Messages route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/conversations/:convId/messages/:msgId/read", async (req, res) => {
  try {
    const participant = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId: req.params.convId, userId: req.user.id } },
    });
    if (!participant) return res.status(403).json({ error: "Not a participant" });

    await prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId: req.params.convId, userId: req.user.id } },
      data: { lastReadAt: new Date() },
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Messages route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
