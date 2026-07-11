import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ users: [], companies: [], franchises: [], conversations: [], opportunities: [] });
    }

    const search = q.trim();

    const [users, companies, franchises, conversations, opportunities] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { headline: { contains: search, mode: "insensitive" } },
            { companyName: { contains: search, mode: "insensitive" } },
          ],
          isActive: true,
        },
        select: { id: true, name: true, email: true, image: true, role: true, headline: true },
        take: 5,
      }),

      prisma.company.findMany({
        where: {
          status: "active",
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { industry: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, slug: true, logoUrl: true, industry: true, city: true },
        take: 5,
      }),

      prisma.franchiseListing.findMany({
        where: {
          status: "active",
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { industry: { contains: search, mode: "insensitive" } },
          ],
        },
        select: {
          id: true, title: true, slug: true, industry: true,
          company: { select: { name: true } },
        },
        take: 5,
      }),

      prisma.conversation.findMany({
        where: {
          participants: {
            some: { userId: req.user?.id },
          },
          messages: {
            some: { content: { contains: search, mode: "insensitive" } },
          },
        },
        select: {
          id: true,
          participants: {
            select: { user: { select: { id: true, name: true, image: true } } },
          },
          messages: { take: 1, orderBy: { createdAt: "desc" }, select: { content: true, createdAt: true } },
        },
        take: 5,
      }),

      prisma.franchiseListing.findMany({
        where: {
          status: "active",
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { industry: { contains: search, mode: "insensitive" } },
          ],
        },
        select: {
          id: true, title: true, slug: true, investmentMin: true, investmentMax: true,
          company: { select: { name: true } },
        },
        take: 5,
      }),
    ]);

    res.json({ users, companies, franchises, conversations, opportunities });
  } catch (error) {
    console.error("Search route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
