import { Router } from "express";
import prisma from "../prisma.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        skills: true,
        interests: true,
        education: true,
        experience: true,
      },
    });
    const { passwordHash, ...userData } = user;
    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/me", authenticate, async (req, res) => {
  try {
    const { fullName, headline, bio, phone, location, website, linkedinUrl, investmentCapacity, industries, experienceYears } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        fullName, headline, bio, phone, location, website, linkedinUrl,
        investmentCapacity, industries, experienceYears,
      },
    });
    const { passwordHash, ...userData } = user;
    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, fullName: true, avatarUrl: true, headline: true, bio: true,
        location: true, website: true, linkedinUrl: true, industries: true,
        experienceYears: true, role: true, skills: true, education: true,
        experience: true, createdAt: true,
      },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        select: {
          id: true, fullName: true, avatarUrl: true, headline: true,
          location: true, role: true, industries: true, createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
