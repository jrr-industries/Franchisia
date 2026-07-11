import { Router } from "express";
import prisma from "../prisma.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

router.post("/", async (req, res) => {
  try {
    const { listingId } = req.body;
    if (!listingId) return res.status(400).json({ error: "listingId is required" });

    const existing = await prisma.bookmark.findUnique({
      where: { userId_listingId: { userId: req.user.id, listingId } },
    });
    if (existing) return res.status(409).json({ error: "Already bookmarked" });

    const bookmark = await prisma.bookmark.create({
      data: { userId: req.user.id, listingId },
    });

    res.status(201).json({ bookmark });
  } catch (error) {
    console.error("Bookmark create error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.user.id },
      include: {
        listing: {
          include: {
            company: { select: { id: true, name: true, slug: true, logoUrl: true, isVerified: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ bookmarks });
  } catch (error) {
    console.error("Bookmark list error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const bookmark = await prisma.bookmark.findUnique({ where: { id: req.params.id } });
    if (!bookmark) return res.status(404).json({ error: "Bookmark not found" });
    if (bookmark.userId !== req.user.id) return res.status(403).json({ error: "Not authorized" });

    await prisma.bookmark.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error("Bookmark delete error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/check/:listingId", async (req, res) => {
  try {
    const bookmark = await prisma.bookmark.findUnique({
      where: { userId_listingId: { userId: req.user.id, listingId: req.params.listingId } },
    });
    res.json({ bookmarked: !!bookmark });
  } catch (error) {
    console.error("Bookmark check error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
