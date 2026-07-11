import { Router } from "express";
import prisma from "../prisma.js";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.ts";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { industry, minInvestment, maxInvestment, city, country, verified, role, search, page = 1, limit = 12, usersPage = 1, usersLimit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const usersSkip = (parseInt(usersPage) - 1) * parseInt(usersLimit);

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

    const userWhere = { isActive: true, role: { not: "admin" } };
    if (role) userWhere.role = role;
    if (currentUserId) userWhere.id = { not: currentUserId };
    if (search) {
      userWhere.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { headline: { contains: search, mode: "insensitive" } },
      ];
    }

    const [listings, listingsTotal, featuredListings, companies, trendingListings, users, usersTotal] = await Promise.all([
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
        where: { status: "active", owner: { role: "franchisor", isActive: true }, ...(verified === "true" ? { isVerified: true } : {}) },
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
        where: userWhere,
        skip: usersSkip,
        take: parseInt(usersLimit),
        select: {
          id: true, name: true, image: true, headline: true, role: true,
          location: true, industries: true, verified: true, followerCount: true, lastActiveAt: true,
          email: true, phone: true,
        },
        orderBy: [{ verified: "desc" }, { followerCount: "desc" }],
      }),
      prisma.user.count({ where: userWhere }),
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

    const usersWithFollow = await Promise.all(users.map(async (u) => {
      let isFollowing = false;
      let isFollowedBy = false;
      if (currentUserId) {
        const [iFollow, theyFollow] = await Promise.all([
          prisma.connection.findUnique({ where: { followerId_followingId: { followerId: currentUserId, followingId: u.id } } }),
          prisma.connection.findUnique({ where: { followerId_followingId: { followerId: u.id, followingId: currentUserId } } }),
        ]);
        isFollowing = !!iFollow;
        isFollowedBy = !!theyFollow;
      }
      return { ...u, isFollowing, isFollowedBy, mutual: isFollowing && isFollowedBy };
    }));

    res.json({
      listings,
      total: listingsTotal,
      page: parseInt(page),
      totalPages: Math.ceil(listingsTotal / parseInt(limit)),
      featured: featuredListings,
      trending: trendingListings,
      companies: companiesWithFollow,
      users: usersWithFollow,
      usersTotal,
      usersPage: parseInt(usersPage),
      usersTotalPages: Math.ceil(usersTotal / parseInt(usersLimit)),
    });
  } catch (error) {
    console.error("Discover route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
