import { Router } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.ts";
import prisma from "../prisma.js";
import { authenticate } from "../middleware/auth.js";
import { emitCompanyCreated, emitCompanyUpdated } from "../socket.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { industry, status, search, franchisor, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (industry) where.industry = industry;
    if (status) where.status = status;
    else where.status = "active";
    if (franchisor === "true") {
      where.owner = { role: "franchisor" };
    }
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
          owner: { select: { id: true, name: true, image: true, role: true } },
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
    let currentUserId = null;
    try {
      const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
      if (session?.user) currentUserId = session.user.id;
    } catch {}

    const company = await prisma.company.findUnique({
      where: { slug: req.params.slug },
      include: {
        owner: { select: { id: true, name: true, image: true, role: true } },
        listings: { where: { status: "active" }, orderBy: { createdAt: "desc" } },
        _count: { select: { followers: true, listings: true } },
      },
    });
    if (!company) return res.status(404).json({ error: "Company not found" });

    let isFollowing = false;
    if (currentUserId) {
      const follow = await prisma.companyFollower.findUnique({
        where: { userId_companyId: { userId: currentUserId, companyId: company.id } },
      });
      isFollowing = !!follow;
    }

    res.json({ ...company, isFollowing });
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
      include: { _count: { select: { followers: true, listings: true } } },
    });
    emitCompanyCreated(company);
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
      include: { _count: { select: { followers: true, listings: true } } },
    });
    emitCompanyUpdated(updated);
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

    let updatedCompany;
    if (existing) {
      await prisma.companyFollower.delete({ where: { id: existing.id } });
      const current = await prisma.company.findUnique({ where: { id: req.params.id }, select: { followerCount: true } });
      if ((current?.followerCount || 0) > 0) {
        updatedCompany = await prisma.company.update({
          where: { id: req.params.id },
          data: { followerCount: { decrement: 1 } },
          include: { _count: { select: { followers: true, listings: true } } },
        });
      }
    } else {
      await prisma.companyFollower.create({
        data: { userId: req.user.id, companyId: req.params.id },
      });
      updatedCompany = await prisma.company.update({
        where: { id: req.params.id },
        data: { followerCount: { increment: 1 } },
        include: { _count: { select: { followers: true, listings: true } } },
      });
    }
    if (updatedCompany) emitCompanyUpdated(updatedCompany);
    res.json({ following: !existing });
  } catch (error) {
    console.error("Companies route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/reviews", authenticate, async (req, res) => {
  try {
    const { rating, title, content } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: "Rating must be between 1 and 5" });
    if (!content?.trim()) return res.status(400).json({ error: "Content is required" });

    const existing = await prisma.review.findUnique({
      where: { reviewerId_companyId: { reviewerId: req.user.id, companyId: req.params.id } },
    });
    if (existing) return res.status(409).json({ error: "You have already reviewed this company" });

    const company = await prisma.company.findUnique({ where: { id: req.params.id } });
    if (!company) return res.status(404).json({ error: "Company not found" });

    const review = await prisma.review.create({
      data: {
        rating: parseInt(rating),
        title: title?.trim() || null,
        content: content.trim(),
        reviewerId: req.user.id,
        companyId: req.params.id,
      },
      include: {
        reviewer: { select: { id: true, name: true, image: true } },
      },
    });

    const allReviews = await prisma.review.findMany({
      where: { companyId: req.params.id },
      select: { rating: true },
    });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.company.update({
      where: { id: req.params.id },
      data: { averageRating: Math.round(avgRating * 10) / 10, reviewCount: allReviews.length },
    });

    res.status(201).json(review);
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
