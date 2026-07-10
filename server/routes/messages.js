import { Router } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.ts";
import prisma from "../prisma.js";

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
    res.status(500).json({ error: error.message });
  }
});

router.post("/conversations", async (req, res) => {
  try {
    const { participantId, subject } = req.body;
    const existing = await prisma.conversation.findFirst({
      where: {
        participants: { every: { userId: { in: [req.user.id, participantId] } } },
      },
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
    res.status(500).json({ error: error.message });
  }
});

router.get("/conversations/:id/messages", async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const messages = await prisma.message.findMany({
      where: { conversationId: req.params.id },
      skip,
      take: parseInt(limit),
      include: { sender: { select: { id: true, name: true, email: true, image: true } } },
      orderBy: { createdAt: "desc" },
    });
    const total = await prisma.message.count({ where: { conversationId: req.params.id } });
    await prisma.conversationParticipant.updateMany({
      where: { conversationId: req.params.id, userId: req.user.id },
      data: { lastReadAt: new Date() },
    });
    res.json({ messages: messages.reverse(), total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/conversations/:id/messages", async (req, res) => {
  try {
    const { content, messageType, attachmentUrl } = req.body;
    const message = await prisma.message.create({
      data: {
        conversationId: req.params.id,
        senderId: req.user.id,
        content,
        messageType: messageType || "text",
        attachmentUrl,
      },
      include: { sender: { select: { id: true, name: true, email: true, image: true } } },
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
    res.status(500).json({ error: error.message });
  }
});

router.get("/can-message/:userId", async (req, res) => {
  try {
    const targetId = req.params.userId;
    if (req.user.role === "admin") return res.json({ canMessage: true });
    const targetUser = await prisma.user.findUnique({ where: { id: targetId }, select: { verified: true } });
    const currentUser = await prisma.user.findUnique({ where: { id: req.user.id }, select: { verified: true } });
    if (currentUser?.verified && targetUser?.verified) return res.json({ canMessage: true, reason: "Verified users can message each other" });
    const mutualFollow = await prisma.connection.findFirst({
      where: {
        OR: [
          { followerId: req.user.id, followingId: targetId },
          { followerId: targetId, followingId: req.user.id },
        ],
      },
    });
    if (!mutualFollow) return res.json({ canMessage: false, reason: "Follow each other to start messaging" });
    const followBack = await prisma.connection.findFirst({
      where: { followerId: targetId, followingId: req.user.id },
    });
    res.json({ canMessage: !!followBack, reason: followBack ? null : "They need to follow you back" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
