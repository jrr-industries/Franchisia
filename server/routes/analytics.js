import { Router } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.ts";
import prisma from "../prisma.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();
router.use(authenticate, authorize("admin"));

function getDateRange(from, to) {
  const end = to ? new Date(to) : new Date();
  const start = from ? new Date(from) : new Date(end.getTime() - 30 * 86400000);
  return { start, end };
}

function buildDayBuckets(start, end) {
  const days = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

router.get("/user-growth", async (req, res) => {
  try {
    const { start: from, end: to } = getDateRange(req.query.from, req.query.to);
    const days = buildDayBuckets(from, to);
    const users = await prisma.user.findMany({
      where: { createdAt: { gte: from, lte: to } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    const series = days.map((day) => {
      const next = new Date(day.getTime() + 86400000);
      return {
        date: day.toISOString().split("T")[0],
        count: users.filter((u) => u.createdAt >= day && u.createdAt < next).length,
      };
    });
    let cumulative = 0;
    const cumulativeSeries = series.map((s) => {
      cumulative += s.count;
      return { ...s, cumulative };
    });
    res.json({ series: cumulativeSeries });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/verification-trend", async (req, res) => {
  try {
    const { start: from, end: to } = getDateRange(req.query.from, req.query.to);
    const days = buildDayBuckets(from, to);
    const history = await prisma.verificationHistory.findMany({
      where: { createdAt: { gte: from, lte: to }, action: "approved" },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    const series = days.map((day) => {
      const next = new Date(day.getTime() + 86400000);
      return {
        date: day.toISOString().split("T")[0],
        count: history.filter((h) => h.createdAt >= day && h.createdAt < next).length,
      };
    });
    res.json({ series });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/companies-by-industry", async (req, res) => {
  try {
    const groups = await prisma.company.groupBy({
      by: ["industry"],
      _count: true,
      orderBy: { _count: { industry: "desc" } },
    });
    res.json({ data: groups.map((g) => ({ name: g.industry || "Unknown", value: g._count })) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/role-distribution", async (req, res) => {
  try {
    const groups = await prisma.user.groupBy({
      by: ["role"],
      _count: true,
    });
    res.json({ data: groups.map((g) => ({ name: g.role || "none", value: g._count })) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/daily-active-users", async (req, res) => {
  try {
    const { start: from, end: to } = getDateRange(req.query.from, req.query.to);
    const days = buildDayBuckets(from, to);
    const users = await prisma.user.findMany({
      where: { lastLoginAt: { gte: from, lte: to } },
      select: { lastLoginAt: true },
    });
    const series = days.map((day) => {
      const next = new Date(day.getTime() + 86400000);
      return {
        date: day.toISOString().split("T")[0],
        count: users.filter((u) => u.lastLoginAt >= day && u.lastLoginAt < next).length,
      };
    });
    res.json({ series });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/monthly-signups", async (req, res) => {
  try {
    const { start: from, end: to } = getDateRange(req.query.from, req.query.to);
    const months = [];
    const cursor = new Date(from.getFullYear(), from.getMonth(), 1);
    while (cursor <= to) {
      months.push(new Date(cursor));
      cursor.setMonth(cursor.getMonth() + 1);
    }
    const users = await prisma.user.findMany({
      where: { createdAt: { gte: from, lte: to } },
      select: { createdAt: true },
    });
    const series = months.map((m) => {
      const next = new Date(m.getFullYear(), m.getMonth() + 1, 1);
      return {
        month: m.toISOString().slice(0, 7),
        count: users.filter((u) => u.createdAt >= m && u.createdAt < next).length,
      };
    });
    res.json({ series });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/messages-sent", async (req, res) => {
  try {
    const { start: from, end: to } = getDateRange(req.query.from, req.query.to);
    const days = buildDayBuckets(from, to);
    const messages = await prisma.message.findMany({
      where: { createdAt: { gte: from, lte: to } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    const series = days.map((day) => {
      const next = new Date(day.getTime() + 86400000);
      return {
        date: day.toISOString().split("T")[0],
        count: messages.filter((m) => m.createdAt >= day && m.createdAt < next).length,
      };
    });
    res.json({ series });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/followers-growth", async (req, res) => {
  try {
    const { start: from, end: to } = getDateRange(req.query.from, req.query.to);
    const days = buildDayBuckets(from, to);
    const followers = await prisma.companyFollower.findMany({
      where: { createdAt: { gte: from, lte: to } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    const series = days.map((day) => {
      const next = new Date(day.getTime() + 86400000);
      return {
        date: day.toISOString().split("T")[0],
        count: followers.filter((f) => f.createdAt >= day && f.createdAt < next).length,
      };
    });
    res.json({ series });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/applications-trend", async (req, res) => {
  try {
    const { start: from, end: to } = getDateRange(req.query.from, req.query.to);
    const days = buildDayBuckets(from, to);
    const applications = await prisma.application.findMany({
      where: { createdAt: { gte: from, lte: to } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    const series = days.map((day) => {
      const next = new Date(day.getTime() + 86400000);
      return {
        date: day.toISOString().split("T")[0],
        count: applications.filter((a) => a.createdAt >= day && a.createdAt < next).length,
      };
    });
    res.json({ series });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
