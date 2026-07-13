import { Router } from "express";
import prisma from "../prisma.js";
import { getMaintenanceMode } from "../settings.js";
import { getSiteContent } from "../site-content.js";

const router = Router();

router.get("/stats", async (_req, res) => {
  try {
    const stats = await prisma.siteStat.findMany({ orderBy: { sort: "asc" } });
    res.json(stats);
  } catch (error) {
    console.error("Public route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/contact", async (_req, res) => {
  try {
    const contact = await prisma.siteContact.findFirst();
    res.json(contact);
  } catch (error) {
    console.error("Public route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/about", async (_req, res) => {
  try {
    const [sections, team, timeline] = await Promise.all([
      prisma.aboutPage.findMany(),
      prisma.aboutTeam.findMany({ orderBy: { sort: "asc" } }),
      prisma.aboutTimeline.findMany({ orderBy: { sort: "asc" } }),
    ]);

    const content = {};
    sections.forEach((s) => { content[s.section] = s.content; });

    res.json({ content, team, timeline });
  } catch (error) {
    console.error("Public route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/reviews", async (req, res) => {
  try {
    const { companyId, listingId, page = 1, limit = 10 } = req.query;
    const where = {};
    if (companyId) where.companyId = companyId;
    if (listingId) where.listingId = listingId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          reviewer: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.review.count({ where }),
    ]);
    res.json({ reviews, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error("Public route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/industries", async (_req, res) => {
  try {
    const companies = await prisma.company.findMany({
      where: { status: "active", owner: { role: "franchisor", isActive: true } },
      select: { industry: true },
      distinct: ["industry"],
    });
    const listings = await prisma.franchiseListing.findMany({
      where: { status: "active" },
      select: { industry: true },
      distinct: ["industry"],
    });

    const industries = [
      ...new Set([...companies.map((c) => c.industry), ...listings.map((l) => l.industry)]),
    ].sort();

    res.json(industries);
  } catch (error) {
    console.error("Public route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/site-content", (_req, res) => {
  res.json(getSiteContent());
});

router.get("/maintenance", (_req, res) => {
  res.json({ enabled: getMaintenanceMode() });
});

export default router;
