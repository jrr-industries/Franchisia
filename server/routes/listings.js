import { Router } from "express";
import prisma from "../prisma.js";
import { authenticate } from "../middleware/auth.js";

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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
});

router.post("/", authenticate, async (req, res) => {
  try {
    const { companyId, title, slug, description, industry, businessType, investmentMin, investmentMax, roiPercentage, franchiseFee, royaltyFee, breakEvenMonths, location, city, country, isRemote, images, videoUrl } = req.body;

    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) return res.status(404).json({ error: "Company not found" });
    if (company.ownerId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const listing = await prisma.franchiseListing.create({
      data: {
        companyId, createdBy: req.user.id, title, slug, description, industry,
        businessType, investmentMin, investmentMax, roiPercentage, franchiseFee,
        royaltyFee, breakEvenMonths, location, city, country, isRemote, images, videoUrl,
      },
    });

    await prisma.company.update({
      where: { id: companyId },
      data: { listingCount: { increment: 1 } },
    });

    res.status(201).json(listing);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "A listing with this slug already exists" });
    }
    res.status(500).json({ error: error.message });
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

    const updated = await prisma.franchiseListing.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
