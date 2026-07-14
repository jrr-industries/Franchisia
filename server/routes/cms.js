import { Router } from "express";
import prisma from "../prisma.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { emitCmsUpdate } from "../socket.js";

const router = Router();

router.use(authenticate, authorize("admin"));

const ADMIN_ONLY = ["title", "slug", "content", "shortDescription", "status", "category", "image", "featuredImage", "author", "tags", "publishedAt", "jobTitle", "department", "location", "jobType", "salaryRange", "description", "requirements", "responsibilities", "venue", "eventDate", "endDate", "startTime", "endTime", "eventType", "registrationLink", "organizer", "name", "partnerType", "logo", "website", "contactEmail", "testimonial", "company", "rating", "question", "answer", "order", "price", "interval", "features", "isFeatured", "popular", "type", "url", "fileName", "alt", "key", "value", "label", "sort", "displayOrder", "applyLink", "benefits", "employmentType", "experience", "salary", "subtitle", "quote", "backgroundType", "backgroundColor", "backgroundImage", "backgroundVideo", "ctaText", "ctaUrl", "secondaryCtaText", "secondaryCtaUrl", "heroImage", "isActive", "sortOrder", "icon", "buttonText", "buttonUrl", "color", "isPublished", "stepNumber", "illustration", "animation", "state", "isFeatured", "listingCount", "parentId", "isVisible", "label", "url"];

router.use((req, res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    req.body = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => ADMIN_ONLY.includes(k))
    );
  }
  next();
});

// Blog Posts
router.get("/blog", async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, category } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
      ];
    }
    const [items, total] = await Promise.all([
      prisma.blogPost.findMany({
        where, skip, take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.blogPost.count({ where }),
    ]);
    res.json({ items, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error("Blog CMS error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/blog/:id", async (req, res) => {
  try {
    const item = await prisma.blogPost.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/blog", async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.slug && data.title) data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const item = await prisma.blogPost.create({ data });
    try { emitCmsUpdate("blog"); } catch {}
    res.status(201).json(item);
  } catch (error) {
    console.error("Blog create error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/blog/:id", async (req, res) => {
  try {
    const item = await prisma.blogPost.update({
      where: { id: req.params.id },
      data: req.body,
    });
    try { emitCmsUpdate("blog"); } catch {}
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/blog/:id", async (req, res) => {
  try {
    await prisma.blogPost.delete({ where: { id: req.params.id } });
    try { emitCmsUpdate("blog"); } catch {}
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Careers
router.get("/careers", async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, department } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (status) where.status = status;
    if (department) where.department = department;
    if (search) {
      where.OR = [
        { jobTitle: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }
    const [items, total] = await Promise.all([
      prisma.career.findMany({
        where, skip, take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.career.count({ where }),
    ]);
    res.json({ items, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error("Career CMS error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/careers/:id", async (req, res) => {
  try {
    const item = await prisma.career.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/careers", async (req, res) => {
  try {
    const item = await prisma.career.create({ data: req.body });
    res.status(201).json(item);
  } catch (error) {
    console.error("Career create error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/careers/:id", async (req, res) => {
  try {
    const item = await prisma.career.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/careers/:id", async (req, res) => {
  try {
    await prisma.career.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Events
router.get("/events", async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { venue: { contains: search, mode: "insensitive" } },
      ];
    }
    const [items, total] = await Promise.all([
      prisma.event.findMany({
        where, skip, take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.event.count({ where }),
    ]);
    res.json({ items, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error("Event CMS error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/events/:id", async (req, res) => {
  try {
    const item = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/events", async (req, res) => {
  try {
    const item = await prisma.event.create({ data: req.body });
    res.status(201).json(item);
  } catch (error) {
    console.error("Event create error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/events/:id", async (req, res) => {
  try {
    const item = await prisma.event.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/events/:id", async (req, res) => {
  try {
    await prisma.event.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Partners
router.get("/partners", async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, partnerType } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (status) where.status = status;
    if (partnerType) where.partnerType = partnerType;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { partnerType: { contains: search, mode: "insensitive" } },
      ];
    }
    const [items, total] = await Promise.all([
      prisma.partner.findMany({
        where, skip, take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.partner.count({ where }),
    ]);
    res.json({ items, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error("Partner CMS error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/partners/:id", async (req, res) => {
  try {
    const item = await prisma.partner.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/partners", async (req, res) => {
  try {
    const item = await prisma.partner.create({ data: req.body });
    res.status(201).json(item);
  } catch (error) {
    console.error("Partner create error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/partners/:id", async (req, res) => {
  try {
    const item = await prisma.partner.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/partners/:id", async (req, res) => {
  try {
    await prisma.partner.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Testimonials
router.get("/testimonials", async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
      ];
    }
    const [items, total] = await Promise.all([
      prisma.testimonial.findMany({
        where, skip, take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.testimonial.count({ where }),
    ]);
    res.json({ items, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error("Testimonial CMS error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/testimonials/:id", async (req, res) => {
  try {
    const item = await prisma.testimonial.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/testimonials", async (req, res) => {
  try {
    const item = await prisma.testimonial.create({ data: req.body });
    res.status(201).json(item);
  } catch (error) {
    console.error("Testimonial create error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/testimonials/:id", async (req, res) => {
  try {
    const item = await prisma.testimonial.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/testimonials/:id", async (req, res) => {
  try {
    await prisma.testimonial.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Site FAQ
router.get("/faq", async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (search) {
      where.OR = [
        { question: { contains: search, mode: "insensitive" } },
        { answer: { contains: search, mode: "insensitive" } },
      ];
    }
    const [items, total] = await Promise.all([
      prisma.siteFAQ.findMany({
        where, skip, take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.siteFAQ.count({ where }),
    ]);
    res.json({ items, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error("FAQ CMS error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/faq/:id", async (req, res) => {
  try {
    const item = await prisma.siteFAQ.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/faq", async (req, res) => {
  try {
    const item = await prisma.siteFAQ.create({ data: req.body });
    res.status(201).json(item);
  } catch (error) {
    console.error("FAQ create error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/faq/:id", async (req, res) => {
  try {
    const item = await prisma.siteFAQ.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/faq/:id", async (req, res) => {
  try {
    await prisma.siteFAQ.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Plans
router.get("/plans", async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
      ];
    }
    const [items, total] = await Promise.all([
      prisma.plan.findMany({
        where, skip, take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.plan.count({ where }),
    ]);
    res.json({ items, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error("Plan CMS error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/plans/:id", async (req, res) => {
  try {
    const item = await prisma.plan.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/plans", async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.slug && data.name) data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const item = await prisma.plan.create({ data });
    try { emitCmsUpdate("plans"); } catch {}
    res.status(201).json(item);
  } catch (error) {
    console.error("Plan create error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/plans/:id", async (req, res) => {
  try {
    const item = await prisma.plan.update({
      where: { id: req.params.id },
      data: req.body,
    });
    try { emitCmsUpdate("plans"); } catch {}
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/plans/:id", async (req, res) => {
  try {
    await prisma.plan.delete({ where: { id: req.params.id } });
    try { emitCmsUpdate("plans"); } catch {}
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Media
router.get("/media", async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (type) where.type = type;
    const [items, total] = await Promise.all([
      prisma.media.findMany({
        where, skip, take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.media.count({ where }),
    ]);
    res.json({ items, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error("Media CMS error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/media/:id", async (req, res) => {
  try {
    const item = await prisma.media.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/media", async (req, res) => {
  try {
    const item = await prisma.media.create({ data: req.body });
    res.status(201).json(item);
  } catch (error) {
    console.error("Media create error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/media/:id", async (req, res) => {
  try {
    const item = await prisma.media.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/media/:id", async (req, res) => {
  try {
    await prisma.media.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Site Settings
router.get("/settings", async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [items, total] = await Promise.all([
      prisma.siteSetting.findMany({
        skip, take: parseInt(limit),
        orderBy: { key: "asc" },
      }),
      prisma.siteSetting.count(),
    ]);
    res.json({ items, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error("Settings CMS error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Hero Slides ──

router.get("/hero-slides", async (req, res) => {
  try {
    const { page = 1, limit = 50, isActive } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (isActive !== undefined) where.isActive = isActive === "true";
    const [items, total] = await Promise.all([
      prisma.heroSlide.findMany({ where, skip, take: parseInt(limit), orderBy: { sortOrder: "asc" } }),
      prisma.heroSlide.count({ where }),
    ]);
    res.json({ items, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/hero-slides/:id", async (req, res) => {
  try {
    const item = await prisma.heroSlide.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/hero-slides", async (req, res) => {
  try {
    const item = await prisma.heroSlide.create({ data: req.body });
    try { emitCmsUpdate("hero-slides"); } catch {}
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/hero-slides/:id", async (req, res) => {
  try {
    const item = await prisma.heroSlide.update({ where: { id: req.params.id }, data: req.body });
    try { emitCmsUpdate("hero-slides"); } catch {}
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/hero-slides/:id", async (req, res) => {
  try {
    await prisma.heroSlide.delete({ where: { id: req.params.id } });
    try { emitCmsUpdate("hero-slides"); } catch {}
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Navigation Links ──

router.get("/navigation", async (req, res) => {
  try {
    const items = await prisma.navigationLink.findMany({ where: { isVisible: true }, orderBy: { sortOrder: "asc" } });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/navigation/all", async (req, res) => {
  try {
    const items = await prisma.navigationLink.findMany({ orderBy: { sortOrder: "asc" } });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/navigation/:id", async (req, res) => {
  try {
    const item = await prisma.navigationLink.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/navigation", async (req, res) => {
  try {
    const item = await prisma.navigationLink.create({ data: req.body });
    try { emitCmsUpdate("navigation"); } catch {}
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/navigation/:id", async (req, res) => {
  try {
    const item = await prisma.navigationLink.update({ where: { id: req.params.id }, data: req.body });
    try { emitCmsUpdate("navigation"); } catch {}
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/navigation/:id", async (req, res) => {
  try {
    await prisma.navigationLink.delete({ where: { id: req.params.id } });
    try { emitCmsUpdate("navigation"); } catch {}
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Settings ──
router.get("/settings/:id", async (req, res) => {
  try {
    let item = await prisma.siteSetting.findUnique({ where: { id: req.params.id } });
    if (!item) {
      item = { id: req.params.id, key: req.params.id, value: {} };
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/settings", async (req, res) => {
  try {
    const item = await prisma.siteSetting.create({ data: req.body });
    try { emitCmsUpdate("settings"); } catch {}
    res.status(201).json(item);
  } catch (error) {
    console.error("Settings create error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/settings/:id", async (req, res) => {
  try {
    const item = await prisma.siteSetting.upsert({
      where: { id: req.params.id },
      update: { key: req.params.id, value: req.body.value },
      create: { id: req.params.id, key: req.params.id, value: req.body.value },
    });
    try { emitCmsUpdate("settings"); } catch {}
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/settings/:id", async (req, res) => {
  try {
    await prisma.siteSetting.delete({ where: { id: req.params.id } });
    try { emitCmsUpdate("settings"); } catch {}
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Contact
router.get("/contact", async (req, res) => {
  try {
    const item = await prisma.siteContact.findFirst();
    res.json(item || { email: "", phone: "", address: "" });
  } catch (error) {
    console.error("Contact CMS error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/contact", async (req, res) => {
  try {
    const existing = await prisma.siteContact.findFirst();
    let item;
    if (existing) {
      item = await prisma.siteContact.update({
        where: { id: existing.id },
        data: { email: req.body.email, phone: req.body.phone, address: req.body.address },
      });
    } else {
      item = await prisma.siteContact.create({
        data: { email: req.body.email, phone: req.body.phone, address: req.body.address },
      });
    }
    try { emitCmsUpdate("contact"); } catch {}
    res.json(item);
  } catch (error) {
    console.error("Contact update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Content Pages
router.get("/pages", async (req, res) => {
  try {
    const { page = 1, limit = 50, search, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }
    const [items, total] = await Promise.all([
      prisma.contentPage.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: "desc" } }),
      prisma.contentPage.count({ where }),
    ]);
    res.json({ items, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error("Page CMS error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/pages/:id", async (req, res) => {
  try {
    const item = await prisma.contentPage.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/pages", async (req, res) => {
  try {
    const item = await prisma.contentPage.create({ data: req.body });
    try { emitCmsUpdate("pages"); } catch {}
    res.status(201).json(item);
  } catch (error) {
    console.error("Page create error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/pages/:id", async (req, res) => {
  try {
    const item = await prisma.contentPage.update({
      where: { id: req.params.id },
      data: req.body,
    });
    try { emitCmsUpdate("pages"); } catch {}
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/pages/:id", async (req, res) => {
  try {
    await prisma.contentPage.delete({ where: { id: req.params.id } });
    try { emitCmsUpdate("pages"); } catch {}
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Statistics
router.get("/stats", async (req, res) => {
  try {
    const items = await prisma.siteStat.findMany({ orderBy: { sort: "asc" } });
    res.json({ items });
  } catch (error) {
    console.error("Stats CMS error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/stats", async (req, res) => {
  try {
    const item = await prisma.siteStat.create({ data: req.body });
    try { emitCmsUpdate("stats"); } catch {}
    res.status(201).json(item);
  } catch (error) {
    console.error("Stat create error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/stats/:id", async (req, res) => {
  try {
    const item = await prisma.siteStat.update({
      where: { id: req.params.id },
      data: req.body,
    });
    try { emitCmsUpdate("stats"); } catch {}
    res.json(item);
  } catch (error) {
    console.error("Stat update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/stats/:id", async (req, res) => {
  try {
    await prisma.siteStat.delete({ where: { id: req.params.id } });
    try { emitCmsUpdate("stats"); } catch {}
    res.json({ success: true });
  } catch (error) {
    console.error("Stat delete error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
