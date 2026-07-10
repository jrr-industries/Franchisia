import { Router } from "express";
import prisma from "../prisma.js";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.ts";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { industry, minInvestment, maxInvestment, city, country, verified, role, search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let currentUserId = null;
    try {
      const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
      if (session?.user) currentUserId = session.user.id;
    } catch {}

    const listingWhere = { status: "active" };
    if (industry) listingWhere.industry = industry;
    if (city) listingWhere.city = { contains: city, mode: "insensitive" };
    if (country) listingWhere.country = { contains: country, mode: "insensitive" };
    if (minInvestment) listingWhere.investmentMin = { gte: parseFloat(minInvestment) };
    if (maxInvestment) listingWhere.investmentMax = { lte: parseFloat(maxInvestment) };
    if (search) {
      listingWhere.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [listings, listingsTotal, featuredListings, companies, trendingListings, users] = await Promise.all([
      prisma.franchiseListing.findMany({
        where: listingWhere,
        skip,
        take: parseInt(limit),
        include: {
          company: { select: { id: true, name: true, slug: true, logoUrl: true, isVerified: true } },
          _count: { select: { applications: true } },
        },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      }),
      prisma.franchiseListing.count({ where: listingWhere }),
      prisma.franchiseListing.findMany({
        where: { status: "active", isFeatured: true },
        take: 6,
        include: {
          company: { select: { id: true, name: true, slug: true, logoUrl: true, isVerified: true } },
          _count: { select: { applications: true } },
        },
        orderBy: { viewCount: "desc" },
      }),
      prisma.company.findMany({
        where: { status: "active", ...(verified === "true" ? { isVerified: true } : {}) },
        take: 6,
        include: { _count: { select: { followers: true, listings: true } } },
        orderBy: [{ isVerified: "desc" }, { followerCount: "desc" }],
      }),
      prisma.franchiseListing.findMany({
        where: { status: "active" },
        take: 6,
        include: {
          company: { select: { id: true, name: true, slug: true, logoUrl: true, isVerified: true } },
          _count: { select: { applications: true } },
        },
        orderBy: { viewCount: "desc" },
      }),
      prisma.user.findMany({
        where: {
          isActive: true,
          ...(role ? { role } : { role: { in: ["franchisor", "investor", "supplier", "consultant"] } }),
          ...(currentUserId ? { id: { not: currentUserId } } : {}),
        },
        take: 6,
        select: {
          id: true, name: true, image: true, headline: true, role: true,
          location: true, industries: true, verified: true, followerCount: true,
        },
        orderBy: [{ verified: "desc" }, { followerCount: "desc" }],
      }),
    ]);

    const companiesWithFollow = await Promise.all(companies.map(async (c) => {
      let isFollowing = false;
      if (currentUserId) {
        const follow = await prisma.companyFollower.findUnique({
          where: { userId_companyId: { userId: currentUserId, companyId: c.id } },
        });
        isFollowing = !!follow;
      }
      return { ...c, isFollowing };
    }));

    res.json({
      listings,
      total: listingsTotal,
      page: parseInt(page),
      totalPages: Math.ceil(listingsTotal / parseInt(limit)),
      featured: featuredListings,
      trending: trendingListings,
      companies: companiesWithFollow,
      recommendedUsers: users,
    });
  } catch (error) {
    console.error("Discover route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
