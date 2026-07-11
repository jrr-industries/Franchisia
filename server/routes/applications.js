import { Router } from "express";
import prisma from "../prisma.js";
import { authenticate } from "../middleware/auth.js";
import { emitStatsUpdate, getIO } from "../socket.js";

const router = Router();

router.post("/", authenticate, async (req, res) => {
  try {
    const { listingId, coverMessage, investmentCapacity } = req.body;

    const existing = await prisma.application.findUnique({
      where: { listingId_applicantId: { listingId, applicantId: req.user.id } },
    });
    if (existing) {
      return res.status(409).json({ error: "You have already applied to this listing" });
    }

    const [application] = await prisma.$transaction(async (tx) => {
      const app = await tx.application.create({
        data: { listingId, applicantId: req.user.id, coverMessage, investmentCapacity },
      });
      await tx.franchiseListing.update({
        where: { id: listingId },
        data: { applicationCount: { increment: 1 } },
      });
      return [app];
    });

    emitStatsUpdate(req.user.id);
    res.status(201).json(application);
  } catch (error) {
    console.error("Applications route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/my", authenticate, async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: { applicantId: req.user.id },
      include: {
        listing: {
          select: { id: true, title: true, slug: true, investmentMin: true, investmentMax: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(applications);
  } catch (error) {
    console.error("Applications route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/listing/:listingId", authenticate, async (req, res) => {
  try {
    const listing = await prisma.franchiseListing.findUnique({
      where: { id: req.params.listingId },
      include: { company: true },
    });
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    if (listing.company.ownerId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const applications = await prisma.application.findMany({
      where: { listingId: req.params.listingId },
      include: {
        applicant: { select: { id: true, fullName: true, avatarUrl: true, headline: true, location: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(applications);
  } catch (error) {
    console.error("Applications route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id/status", authenticate, async (req, res) => {
  try {
    const { status } = req.body;

    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { listing: { include: { company: true } } },
    });
    if (!application) return res.status(404).json({ error: "Application not found" });

    if (application.listing.company.ownerId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const updated = await prisma.application.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(updated);
  } catch (error) {
    console.error("Applications route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
