import { Router } from "express";
import prisma from "../prisma.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { industry, status, search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (industry) where.industry = industry;
    if (status) where.status = status;
    else where.status = "active";
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          owner: { select: { id: true, fullName: true, avatarUrl: true } },
          _count: { select: { listings: true, followers: true } },
        },
        orderBy: [{ isVerified: "desc" }, { createdAt: "desc" }],
      }),
      prisma.company.count({ where }),
    ]);

    res.json({ companies, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error("Companies route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const company = await prisma.company.findUnique({
      where: { slug: req.params.slug },
      include: {
        owner: { select: { id: true, fullName: true, avatarUrl: true } },
        listings: { where: { status: "active" }, orderBy: { createdAt: "desc" } },
        _count: { select: { followers: true } },
      },
    });
    if (!company) return res.status(404).json({ error: "Company not found" });
    res.json(company);
  } catch (error) {
    console.error("Companies route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", authenticate, async (req, res) => {
  try {
    const { name, slug, industry, description, website, foundedYear, employeeCount, email, phone, address, city, country } = req.body;

    const company = await prisma.company.create({
      data: {
        ownerId: req.user.id,
        name, slug, industry, description, website, foundedYear,
        employeeCount, email, phone, address, city, country,
      },
    });
    res.status(201).json(company);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "A company with this slug already exists" });
    }
    console.error("Companies route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", authenticate, async (req, res) => {
  try {
    const company = await prisma.company.findUnique({ where: { id: req.params.id } });
    if (!company) return res.status(404).json({ error: "Company not found" });
    if (company.ownerId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const allowedFields = ["name", "industry", "description", "website", "foundedYear", "employeeCount", "email", "phone", "address", "city", "country"];
    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const updated = await prisma.company.update({
      where: { id: req.params.id },
      data: updates,
    });
    res.json(updated);
  } catch (error) {
    console.error("Companies route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/follow", authenticate, async (req, res) => {
  try {
    const existing = await prisma.companyFollower.findUnique({
      where: { userId_companyId: { userId: req.user.id, companyId: req.params.id } },
    });

    if (existing) {
      await prisma.companyFollower.delete({ where: { id: existing.id } });
      const current = await prisma.company.findUnique({ where: { id: req.params.id }, select: { followerCount: true } });
      if ((current?.followerCount || 0) > 0) {
        await prisma.company.update({
          where: { id: req.params.id },
          data: { followerCount: { decrement: 1 } },
        });
      }
      return res.json({ following: false });
    }

    await prisma.companyFollower.create({
      data: { userId: req.user.id, companyId: req.params.id },
    });
    await prisma.company.update({
      where: { id: req.params.id },
      data: { followerCount: { increment: 1 } },
    });
    res.json({ following: true });
  } catch (error) {
    console.error("Companies route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
