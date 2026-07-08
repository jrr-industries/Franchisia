import { Router } from "express";
import prisma from "../prisma.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/conversations", authenticate, async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { participants: { some: { userId: req.user.id } } },
      include: {
        participants: {
          include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
        },
        messages: { take: 1, orderBy: { createdAt: "desc" } },
      },
      orderBy: { updatedAt: "desc" },
    });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/conversations/:id", authenticate, async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: { conversationId: req.params.id },
      include: { sender: { select: { id: true, fullName: true, avatarUrl: true } } },
      orderBy: { createdAt: "asc" },
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/conversations", authenticate, async (req, res) => {
  try {
    const { participantId, subject, content } = req.body;

    const existing = await prisma.conversation.findFirst({
      where: {
        participants: { every: { userId: { in: [req.user.id, participantId] } } },
      },
    });
    if (existing) return res.json(existing);

    const conversation = await prisma.conversation.create({
      data: {
        subject,
        participants: {
          createMany: {
            data: [{ userId: req.user.id }, { userId: participantId }],
          },
        },
        messages: content
          ? { create: { senderId: req.user.id, content } }
          : undefined,
      },
      include: { participants: true },
    });
    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/conversations/:id/messages", authenticate, async (req, res) => {
  try {
    const { content, messageType, attachmentUrl } = req.body;

    const message = await prisma.message.create({
      data: {
        conversationId: req.params.id,
        senderId: req.user.id,
        content, messageType, attachmentUrl,
      },
      include: { sender: { select: { id: true, fullName: true, avatarUrl: true } } },
    });

    await prisma.conversation.update({
      where: { id: req.params.id },
      data: { updatedAt: new Date() },
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
