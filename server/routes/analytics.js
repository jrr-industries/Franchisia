import { Router } from "express";
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

async function getDailySeries(table, dateCol, from, to) {
  const rows = await prisma.$queryRawUnsafe(`
    SELECT DATE_TRUNC('day', "${dateCol}"::timestamptz)::date AS day, COUNT(*)::int AS count
    FROM "${table}"
    WHERE "${dateCol}" >= $1::timestamptz AND "${dateCol}" <= $2::timestamptz
    GROUP BY DATE_TRUNC('day', "${dateCol}"::timestamptz)
    ORDER BY day ASC
  `, from, to);
  const countMap = {};
  for (const row of rows) {
    const key = new Date(row.day).toISOString().split("T")[0];
    countMap[key] = Number(row.count);
  }
  const days = buildDayBuckets(from, to);
  return days.map((d) => ({
    date: d.toISOString().split("T")[0],
    count: countMap[d.toISOString().split("T")[0]] || 0,
  }));
}

async function getMonthlySeries(table, dateCol, from, to) {
  const rows = await prisma.$queryRawUnsafe(`
    SELECT DATE_TRUNC('month', "${dateCol}"::timestamptz)::date AS month, COUNT(*)::int AS count
    FROM "${table}"
    WHERE "${dateCol}" >= $1::timestamptz AND "${dateCol}" <= $2::timestamptz
    GROUP BY DATE_TRUNC('month', "${dateCol}"::timestamptz)
    ORDER BY month ASC
  `, from, to);
  const countMap = {};
  for (const row of rows) {
    const key = new Date(row.month).toISOString().slice(0, 7);
    countMap[key] = Number(row.count);
  }
  const months = [];
  const cursor = new Date(from.getFullYear(), from.getMonth(), 1);
  while (cursor <= to) {
    months.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months.map((m) => ({
    month: m.toISOString().slice(0, 7),
    count: countMap[m.toISOString().slice(0, 7)] || 0,
  }));
}

router.get("/user-growth", async (req, res) => {
  try {
    const { start: from, end: to } = getDateRange(req.query.from, req.query.to);
    const daily = await getDailySeries("users", "created_at", from, to);
    let cumulative = 0;
    const series = daily.map((s) => {
      cumulative += s.count;
      return { ...s, cumulative };
    });
    res.json({ series });
  } catch (error) {
    console.error("Analytics route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/verification-trend", async (req, res) => {
  try {
    const { start: from, end: to } = getDateRange(req.query.from, req.query.to);
    const series = await getDailySeries("verification_history", "created_at", from, to);
    res.json({ series });
  } catch (error) {
    console.error("Analytics route error:", error);
    res.status(500).json({ error: "Internal server error" });
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
    console.error("Analytics route error:", error);
    res.status(500).json({ error: "Internal server error" });
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
    console.error("Analytics route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/daily-active-users", async (req, res) => {
  try {
    const { start: from, end: to } = getDateRange(req.query.from, req.query.to);
    const series = await getDailySeries("users", "last_login_at", from, to);
    res.json({ series });
  } catch (error) {
    console.error("Analytics route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/monthly-signups", async (req, res) => {
  try {
    const { start: from, end: to } = getDateRange(req.query.from, req.query.to);
    const series = await getMonthlySeries("users", "created_at", from, to);
    res.json({ series });
  } catch (error) {
    console.error("Analytics route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/messages-sent", async (req, res) => {
  try {
    const { start: from, end: to } = getDateRange(req.query.from, req.query.to);
    const series = await getDailySeries("messages", "created_at", from, to);
    res.json({ series });
  } catch (error) {
    console.error("Analytics route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/followers-growth", async (req, res) => {
  try {
    const { start: from, end: to } = getDateRange(req.query.from, req.query.to);
    const series = await getDailySeries("company_followers", "created_at", from, to);
    res.json({ series });
  } catch (error) {
    console.error("Analytics route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/applications-trend", async (req, res) => {
  try {
    const { start: from, end: to } = getDateRange(req.query.from, req.query.to);
    const series = await getDailySeries("applications", "created_at", from, to);
    res.json({ series });
  } catch (error) {
    console.error("Analytics route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;