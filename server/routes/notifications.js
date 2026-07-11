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

const TYPE_GROUPS = {
  messages: ["new_message", "message_request", "message_request_accepted"],
  follows: ["new_follower", "company_followed", "connection_request"],
  applications: ["application_received", "application_status_changed", "new_lead"],
  verification: ["verification_approved", "verification_rejected"],
  companies: ["company_followed", "new_lead"],
  system: ["system_alert", "account_suspended", "account_reactivated", "admin_promoted", "admin_demoted", "meeting_reminder", "new_review"],
};

router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 50, type, unread } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { userId: req.user.id };
    if (unread === "true") where.isRead = false;
    if (type && type !== "all") {
      const types = TYPE_GROUPS[type];
      if (types) where.type = { in: types };
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where: { userId: req.user.id } }),
      prisma.notification.count({ where: { userId: req.user.id, isRead: false } }),
    ]);

    const typeCounts = await prisma.notification.groupBy({
      by: ["type"],
      where: { userId: req.user.id },
      _count: { type: true },
    });
    const countByType = Object.fromEntries(typeCounts.map((t) => [t.type, t._count.type]));
    const groupCounts = {};
    for (const [group, types] of Object.entries(TYPE_GROUPS)) {
      groupCounts[group] = types.reduce((sum, t) => sum + (countByType[t] || 0), 0);
    }

    res.json({
      notifications,
      total,
      unreadCount,
      groupCounts,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error("Notifications route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id/read", async (req, res) => {
  try {
    await prisma.notification.updateMany({ where: { id: req.params.id, userId: req.user.id }, data: { isRead: true } });
    res.json({ success: true });
  } catch (error) {
    console.error("Notifications route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/read-all", async (req, res) => {
  try {
    await prisma.notification.updateMany({ where: { userId: req.user.id, isRead: false }, data: { isRead: true } });
    res.json({ success: true, unreadCount: 0 });
  } catch (error) {
    console.error("Notifications route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.notification.deleteMany({ where: { id: req.params.id, userId: req.user.id } });
    res.json({ success: true });
  } catch (error) {
    console.error("Notifications route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/", async (req, res) => {
  try {
    const { type } = req.query;
    const where = { userId: req.user.id };
    if (type && type !== "all") {
      const types = TYPE_GROUPS[type];
      if (types) where.type = { in: types };
    }
    await prisma.notification.deleteMany({ where });
    res.json({ success: true });
  } catch (error) {
    console.error("Notifications route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/unread-count", async (req, res) => {
  try {
    const count = await prisma.notification.count({ where: { userId: req.user.id, isRead: false } });
    res.json({ count });
  } catch (error) {
    console.error("Notifications route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
