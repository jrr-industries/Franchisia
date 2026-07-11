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
    if (industry && industry !== "All") listingWhere.industry = industry;
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

    const [
      listings,
      listingsTotal,
      featuredListings,
      companies,
      trendingListings,
      users,
      usersTotal,
      newListings,
    ] = await Promise.all([
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
        where: { status: "active", owner: { role: "franchisor", isActive: true }, ...(verified === "true" ? { isVerified: true } : {}), ...(industry && industry !== "All" ? { industry } : {}), ...(search ? { name: { contains: search, mode: "insensitive" } } : {}) },
        take: 8,
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
          location: true, country: true, state: true, city: true, industries: true, verified: true, followerCount: true, lastActiveAt: true,
        },
        orderBy: [{ verified: "desc" }, { followerCount: "desc" }],
      }),
      prisma.user.count({ where: userWhere }),
      prisma.franchiseListing.findMany({
        where: { ...listingWhere },
        take: 8,
        include: {
          company: { select: { id: true, name: true, slug: true, logoUrl: true, isVerified: true } },
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    let recommendedListings = [];
    if (currentUserId) {
      const userPrefs = await prisma.user.findUnique({
        where: { id: currentUserId },
        select: { industries: true, role: true, location: true },
      });
      if (userPrefs?.industries?.length > 0) {
        recommendedListings = await prisma.franchiseListing.findMany({
          where: { status: "active", industry: { in: userPrefs.industries } },
          take: 6,
          include: {
            company: { select: { id: true, name: true, slug: true, logoUrl: true, isVerified: true } },
            _count: { select: { applications: true } },
          },
          orderBy: { viewCount: "desc" },
        });
      }
    }

    let companiesWithFollow = companies;
    let usersWithFollow = users;

    if (currentUserId) {
      const companyIds = companies.map(c => c.id);
      const userIds = users.map(u => u.id);

      const [userFollows, myConnections, theirConnections] = await Promise.all([
        companyIds.length ? prisma.companyFollower.findMany({
          where: { userId: currentUserId, companyId: { in: companyIds } },
          select: { companyId: true },
        }) : [],
        userIds.length ? prisma.connection.findMany({
          where: { followerId: currentUserId, followingId: { in: userIds } },
          select: { followingId: true },
        }) : [],
        userIds.length ? prisma.connection.findMany({
          where: { followerId: { in: userIds }, followingId: currentUserId },
          select: { followerId: true },
        }) : [],
      ]);

      const followedCompanies = new Set(userFollows.map(f => f.companyId));
      const iFollow = new Set(myConnections.map(c => c.followingId));
      const theyFollow = new Set(theirConnections.map(c => c.followerId));

      companiesWithFollow = companies.map(c => ({ ...c, isFollowing: followedCompanies.has(c.id) }));
      usersWithFollow = users.map(u => ({
        ...u,
        isFollowing: iFollow.has(u.id),
        isFollowedBy: theyFollow.has(u.id),
        mutual: iFollow.has(u.id) && theyFollow.has(u.id),
      }));
    }

    const industryRows = await prisma.franchiseListing.groupBy({
      by: ["industry"],
      where: { status: "active" },
      _count: true,
    });
    const industryCountMap = {};
    for (const row of industryRows) {
      industryCountMap[row.industry] = row._count;
    }
    const industryCounts = [
      "Food & Beverage", "Retail", "Technology", "Healthcare",
      "Education", "Fitness", "Beauty & Wellness", "Real Estate",
      "Automotive", "Finance", "Hospitality", "Manufacturing",
      "Logistics", "Travel", "Agriculture", "Pharmacy", "Fashion",
      "Electronics", "Construction", "Other",
    ].filter(i => i !== "All").map((ind) => ({
      industry: ind,
      count: industryCountMap[ind] || 0,
    }));

    res.json({
      listings,
      total: listingsTotal,
      page: parseInt(page),
      totalPages: Math.ceil(listingsTotal / parseInt(limit)),
      featured: featuredListings,
      trending: trendingListings,
      newListings,
      companies: companiesWithFollow,
      users: usersWithFollow,
      usersTotal,
      usersPage: parseInt(usersPage),
      usersTotalPages: Math.ceil(usersTotal / parseInt(usersLimit)),
      industryCounts,
      recommended: recommendedListings,
    });
  } catch (error) {
    console.error("Discover route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;