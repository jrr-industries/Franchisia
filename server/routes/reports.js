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

router.post("/", async (req, res) => {
  try {
    const { targetId, targetType, reason, description } = req.body;
    if (!targetId || !targetType || !reason) {
      return res.status(400).json({ error: "targetId, targetType, and reason are required" });
    }
    if (!["user", "company", "listing"].includes(targetType)) {
      return res.status(400).json({ error: "Invalid targetType" });
    }

    const report = await prisma.report.create({
      data: {
        reporterId: req.user.id,
        targetId,
        targetType,
        reason,
        description: description || null,
      },
    });

    res.status(201).json({ report });
  } catch (error) {
    console.error("Reports route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
