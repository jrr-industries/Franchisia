import { Router } from "express";
import prisma from "../prisma.js";
import { authenticate } from "../middleware/auth.js";
import { emitListingCreated, emitListingUpdate, emitListingDeleted } from "../socket.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { industry, status, minInvestment, maxInvestment, city, country, search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (industry) where.industry = industry;
    if (status) where.status = status;
    else where.status = "active";
    if (city) where.city = { contains: city, mode: "insensitive" };
    if (country) where.country = { contains: country, mode: "insensitive" };
    if (minInvestment) where.investmentMin = { gte: parseFloat(minInvestment) };
    if (maxInvestment) where.investmentMax = { lte: parseFloat(maxInvestment) };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [listings, total] = await Promise.all([
      prisma.franchiseListing.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          company: { select: { id: true, name: true, slug: true, logoUrl: true } },
          _count: { select: { applications: true } },
        },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      }),
      prisma.franchiseListing.count({ where }),
    ]);

    res.json({ listings, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error("Listings route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/my", authenticate, async (req, res) => {
  try {
    const company = await prisma.company.findFirst({
      where: { ownerId: req.user.id },
    });
    if (!company) return res.json({ listings: [] });

    const { status, search, page = 1, limit = 20 } = req.query;
    const where = { companyId: company.id };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [listings, total] = await Promise.all([
      prisma.franchiseListing.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          _count: { select: { applications: true, bookmarks: true } },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.franchiseListing.count({ where }),
    ]);
    res.json({ listings, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error("Listings route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/company/:companyId", async (req, res) => {
  try {
    const { status } = req.query;
    const where = { companyId: req.params.companyId };
    if (status) where.status = status;

    const listings = await prisma.franchiseListing.findMany({
      where,
      include: {
        company: { select: { id: true, name: true, slug: true, logoUrl: true, isVerified: true } },
        _count: { select: { applications: true, bookmarks: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ listings });
  } catch (error) {
    console.error("Listings route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const listing = await prisma.franchiseListing.findUnique({
      where: { slug: req.params.slug },
      include: {
        company: {
          select: { id: true, name: true, slug: true, logoUrl: true, bannerUrl: true, isVerified: true },
        },
      },
    });
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    await prisma.franchiseListing.update({
      where: { id: listing.id },
      data: { viewCount: { increment: 1 } },
    });

    res.json(listing);
  } catch (error) {
    console.error("Listings route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/duplicate", authenticate, async (req, res) => {
  try {
    const original = await prisma.franchiseListing.findUnique({
      where: { id: req.params.id },
      include: { company: true },
    });
    if (!original) return res.status(404).json({ error: "Listing not found" });
    if (original.company.ownerId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const baseSlug = original.slug + "-copy";
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.franchiseListing.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const listing = await prisma.franchiseListing.create({
      data: {
        companyId: original.companyId,
        createdBy: req.user.id,
        title: `${original.title} (Copy)`,
        slug,
        description: original.description,
        industry: original.industry,
        businessType: original.businessType,
        investmentMin: original.investmentMin,
        investmentMax: original.investmentMax,
        roiPercentage: original.roiPercentage,
        franchiseFee: original.franchiseFee,
        royaltyFee: original.royaltyFee,
        breakEvenMonths: original.breakEvenMonths,
        location: original.location,
        city: original.city,
        country: original.country,
        state: original.state,
        isRemote: original.isRemote,
        images: original.images,
        videoUrl: original.videoUrl,
        areaRequired: original.areaRequired,
        requirements: original.requirements,
        support: original.support,
        training: original.training,
        status: "draft",
      },
    });

    await prisma.company.update({
      where: { id: original.companyId },
      data: { listingCount: { increment: 1 } },
    });

    try { emitListingCreated(listing); } catch {}
    res.status(201).json(listing);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "A listing with this slug already exists" });
    }
    console.error("Listings route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/", authenticate, async (req, res) => {
  try {
    let { companyId, title, slug: rawSlug, description, industry, businessType, investmentMin, investmentMax, roiPercentage, franchiseFee, royaltyFee, breakEvenMonths, location, city, country, state, isRemote, images, videoUrl, areaRequired, requirements, support, training } = req.body;

    if (!title?.trim()) return res.status(400).json({ error: "Title is required" });
    if (!industry?.trim()) return res.status(400).json({ error: "Industry is required" });

    const slug = rawSlug?.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    if (images && !Array.isArray(images)) {
      images = typeof images === "string" ? images.split("\n").map(s => s.trim()).filter(Boolean) : [];
    }

    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) return res.status(404).json({ error: "Company not found" });
    if (company.ownerId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const listing = await prisma.franchiseListing.create({
      data: {
        companyId, createdBy: req.user.id, title, slug, description, industry,
        businessType, investmentMin, investmentMax, roiPercentage, franchiseFee,
        royaltyFee, breakEvenMonths, location, city, country, state, isRemote,
        images: images || [], videoUrl, areaRequired, requirements, support, training,
      },
    });

    await prisma.company.update({
      where: { id: companyId },
      data: { listingCount: { increment: 1 } },
    });

    try { emitListingCreated(listing); } catch {}
    res.status(201).json(listing);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "A listing with this slug already exists" });
    }
    console.error("Listings route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", authenticate, async (req, res) => {
  try {
    const listing = await prisma.franchiseListing.findUnique({ where: { id: req.params.id } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    const company = await prisma.company.findUnique({ where: { id: listing.companyId } });
    if (company.ownerId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const allowedFields = ["title", "description", "industry", "businessType", "investmentMin", "investmentMax", "roiPercentage", "franchiseFee", "royaltyFee", "breakEvenMonths", "location", "city", "country", "state", "isRemote", "images", "videoUrl", "areaRequired", "requirements", "support", "training"];
    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const updated = await prisma.franchiseListing.update({
      where: { id: req.params.id },
      data: updates,
    });
    try { emitListingUpdate(updated); } catch {}
    res.json(updated);
  } catch (error) {
    console.error("Listings route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id/publish", authenticate, async (req, res) => {
  try {
    const listing = await prisma.franchiseListing.findUnique({ where: { id: req.params.id } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    const company = await prisma.company.findUnique({ where: { id: listing.companyId } });
    if (company.ownerId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }
    const updated = await prisma.franchiseListing.update({
      where: { id: req.params.id },
      data: { status: "active", publishedAt: new Date() },
    });
    try { emitListingUpdate(updated); } catch {}
    res.json(updated);
  } catch (error) {
    console.error("Listings route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id/unpublish", authenticate, async (req, res) => {
  try {
    const listing = await prisma.franchiseListing.findUnique({ where: { id: req.params.id } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    const company = await prisma.company.findUnique({ where: { id: listing.companyId } });
    if (company.ownerId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }
    const updated = await prisma.franchiseListing.update({
      where: { id: req.params.id },
      data: { status: "draft" },
    });
    res.json(updated);
  } catch (error) {
    console.error("Listings route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id/close", authenticate, async (req, res) => {
  try {
    const listing = await prisma.franchiseListing.findUnique({ where: { id: req.params.id } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    const company = await prisma.company.findUnique({ where: { id: listing.companyId } });
    if (company.ownerId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }
    const updated = await prisma.franchiseListing.update({
      where: { id: req.params.id },
      data: { status: "closed" },
    });
    try { emitListingUpdate(updated); } catch {}
    res.json(updated);
  } catch (error) {
    console.error("Listings route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  try {
    const listing = await prisma.franchiseListing.findUnique({ where: { id: req.params.id } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    const company = await prisma.company.findUnique({ where: { id: listing.companyId } });
    if (company.ownerId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }
    await prisma.franchiseListing.delete({ where: { id: req.params.id } });
    await prisma.company.update({
      where: { id: listing.companyId },
      data: { listingCount: { decrement: 1 } },
    });
    try { emitListingDeleted(req.params.id); } catch {}
    res.json({ success: true });
  } catch (error) {
    console.error("Listings route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
