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

router.post("/sales-inquiry", async (req, res) => {
  try {
    const { companyName, fullName, businessEmail, phoneNumber, companySize, message } = req.body;
    if (!companyName || !fullName || !businessEmail) {
      return res.status(400).json({ error: "Company name, full name, and business email are required" });
    }
    const inquiry = await prisma.salesInquiry.create({
      data: { companyName, fullName, businessEmail, phoneNumber, companySize, message },
    });
    res.status(201).json(inquiry);
  } catch (error) {
    console.error("Sales inquiry error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Public CMS endpoints ──

router.get("/blog", async (req, res) => {
  try {
    const { page = 1, limit = 12, category } = req.query;
    const where = { status: "published" };
    if (category) where.category = category;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [items, total] = await Promise.all([
      prisma.blogPost.findMany({
        where, skip, take: parseInt(limit),
        orderBy: { publishDate: "desc" },
        select: { id: true, title: true, slug: true, featuredImage: true, author: true, category: true, shortDescription: true, publishDate: true, readingTime: true, isFeatured: true },
      }),
      prisma.blogPost.count({ where }),
    ]);
    res.json({ items, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/blog/:slug", async (req, res) => {
  try {
    const item = await prisma.blogPost.findUnique({ where: { slug: req.params.slug } });
    if (!item || item.status !== "published") return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/careers", async (req, res) => {
  try {
    const { department } = req.query;
    const where = { status: "published" };
    if (department) where.department = department;
    const items = await prisma.career.findMany({
      where, orderBy: { createdAt: "desc" },
    });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/events", async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;
    const items = await prisma.event.findMany({
      where, orderBy: { date: "asc" },
    });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/partners", async (req, res) => {
  try {
    const items = await prisma.partner.findMany({
      where: { status: "published" },
      orderBy: { displayOrder: "asc" },
    });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/testimonials", async (req, res) => {
  try {
    const items = await prisma.testimonial.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/faq", async (req, res) => {
  try {
    const items = await prisma.siteFAQ.findMany({
      orderBy: { displayOrder: "asc" },
    });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/plans", async (req, res) => {
  try {
    const items = await prisma.plan.findMany({
      where: { status: "published" },
      orderBy: { displayOrder: "asc" },
    });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/statistics", async (req, res) => {
  try {
    const items = await prisma.siteStat.findMany({
      orderBy: { sort: "asc" },
    });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/settings", async (req, res) => {
  try {
    const settings = await prisma.siteSetting.findMany();
    const result = {};
    settings.forEach(s => { result[s.key] = s.value; });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/site-content", async (req, res) => {
  try {
    const [stats, testimonials, partners, faqs, plans, blogPosts] = await Promise.all([
      prisma.siteStat.findMany({ orderBy: { sort: "asc" } }),
      prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.partner.findMany({ where: { status: "published" }, orderBy: { displayOrder: "asc" } }),
      prisma.siteFAQ.findMany({ orderBy: { displayOrder: "asc" } }),
      prisma.plan.findMany({ where: { status: "published" }, orderBy: { displayOrder: "asc" } }),
      prisma.blogPost.findMany({ where: { status: "published", isFeatured: true }, orderBy: { publishDate: "desc" }, take: 6 }),
    ]);

    const contact = await prisma.siteContact.findFirst();
    const settings = await prisma.siteSetting.findMany();
    const settingsMap = {};
    settings.forEach(s => { settingsMap[s.key] = s.value; });

    res.json({
      stats,
      testimonials,
      partners,
      faqs,
      plans,
      blogPosts,
      contact,
      settings: settingsMap,
    });
  } catch (error) {
    console.error("Site content error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
