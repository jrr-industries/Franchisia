import { Router } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.ts";
import prisma from "../prisma.js";

const router = Router();

router.use(async (req, res, next) => {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session?.user) return res.status(401).json({ error: "Authentication required" });
    req.user = session.user;
    next();
  } catch (e) {
    res.status(500).json({ error: "Auth failed" });
  }
});

router.post("/company/:companyId", async (req, res) => {
  try {
    const { companyId } = req.params;
    const existing = await prisma.companyFollower.findUnique({
      where: { userId_companyId: { userId: req.user.id, companyId } },
    });
    if (existing) {
      await prisma.$transaction(async (tx) => {
        await tx.companyFollower.delete({ where: { id: existing.id } });
        const current = await tx.company.findUnique({ where: { id: companyId }, select: { followerCount: true } });
        if ((current?.followerCount || 0) > 0) {
          await tx.company.update({ where: { id: companyId }, data: { followerCount: { decrement: 1 } } });
        }
      });
      return res.json({ following: false });
    }
    await prisma.$transaction(async (tx) => {
      await tx.companyFollower.create({ data: { userId: req.user.id, companyId } });
      await tx.company.update({ where: { id: companyId }, data: { followerCount: { increment: 1 } } });
      const company = await tx.company.findUnique({ where: { id: companyId }, select: { ownerId: true, name: true } });
      if (company && company.ownerId !== req.user.id) {
        await tx.notification.create({
          data: {
            userId: company.ownerId,
            type: "company_followed",
            title: "New Company Follower",
            body: `${req.user.name || "Someone"} started following ${company.name}`,
            data: { followerId: req.user.id, companyId },
          },
        });
      }
    });
    res.json({ following: true });
  } catch (error) {
    console.error("Follow route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/company/:companyId/status", async (req, res) => {
  try {
    const existing = await prisma.companyFollower.findUnique({
      where: { userId_companyId: { userId: req.user.id, companyId: req.params.companyId } },
    });
    res.json({ following: !!existing });
  } catch (error) {
    console.error("Follow route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/user/:userId", async (req, res) => {
  try {
    const targetId = req.params.userId;
    if (targetId === req.user.id) return res.status(400).json({ error: "Cannot follow yourself" });
    const existing = await prisma.connection.findUnique({
      where: { followerId_followingId: { followerId: req.user.id, followingId: targetId } },
    });
    if (existing) {
      await prisma.$transaction(async (tx) => {
        await tx.connection.delete({ where: { id: existing.id } });
        await tx.user.update({ where: { id: req.user.id }, data: { followingCount: { decrement: 1 } } });
        await tx.user.update({ where: { id: targetId }, data: { followerCount: { decrement: 1 } } });
      });
      return res.json({ following: false });
    }
    await prisma.$transaction(async (tx) => {
      await tx.connection.create({ data: { followerId: req.user.id, followingId: targetId } });
      await tx.user.update({ where: { id: req.user.id }, data: { followingCount: { increment: 1 } } });
      await tx.user.update({ where: { id: targetId }, data: { followerCount: { increment: 1 } } });
      await tx.notification.create({
        data: {
          userId: targetId,
          type: "new_follower",
          title: "New Follower",
          body: `${req.user.name || "Someone"} started following you`,
          data: { followerId: req.user.id },
        },
      });
    });
    res.json({ following: true });
  } catch (error) {
    console.error("Follow route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/user/:userId/status", async (req, res) => {
  try {
    const [existing, targetUser] = await Promise.all([
      prisma.connection.findUnique({
        where: { followerId_followingId: { followerId: req.user.id, followingId: req.params.userId } },
      }),
      prisma.user.findUnique({
        where: { id: req.params.userId },
        select: { followerCount: true, followingCount: true },
      }),
    ]);
    res.json({
      following: !!existing,
      followerCount: targetUser?.followerCount || 0,
      followingCount: targetUser?.followingCount || 0,
    });
  } catch (error) {
    console.error("Follow route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:userId/followers", async (req, res) => {
  try {
    const followers = await prisma.connection.findMany({
      where: { followingId: req.params.userId },
      include: { follower: { select: { id: true, name: true, email: true, image: true, role: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ followers: followers.map((f) => f.follower) });
  } catch (error) {
    console.error("Follow route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:userId/following", async (req, res) => {
  try {
    const following = await prisma.connection.findMany({
      where: { followerId: req.params.userId },
      include: { following: { select: { id: true, name: true, email: true, image: true, role: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ following: following.map((f) => f.following) });
  } catch (error) {
    console.error("Follow route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
