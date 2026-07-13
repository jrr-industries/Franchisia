import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

const requireAdmin = async (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

router.use(requireAdmin);

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
    const item = await prisma.blogPost.create({ data: req.body });
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
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/blog/:id", async (req, res) => {
  try {
    await prisma.blogPost.delete({ where: { id: req.params.id } });
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
    const item = await prisma.plan.create({ data: req.body });
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
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/plans/:id", async (req, res) => {
  try {
    await prisma.plan.delete({ where: { id: req.params.id } });
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

router.get("/settings/:id", async (req, res) => {
  try {
    const item = await prisma.siteSetting.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/settings", async (req, res) => {
  try {
    const item = await prisma.siteSetting.create({ data: req.body });
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
      update: { key: req.body.key, value: req.body.value },
      create: { id: req.params.id, key: req.body.key, value: req.body.value },
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/settings/:id", async (req, res) => {
  try {
    await prisma.siteSetting.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
