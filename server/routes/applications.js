import { Router } from "express";
import prisma from "../prisma.js";
import { authenticate } from "../middleware/auth.js";
import { emitStatsUpdate, emitApplicationUpdate, emitNotification, getIO } from "../socket.js";

const router = Router();

router.post("/", authenticate, async (req, res) => {
  try {
    const {
      listingId, personalInfo, businessInfo, financialInfo,
      locationPreference, coverLetter, acceptedPolicyVersion,
      acceptedPolicyTerms, acceptedAt,
    } = req.body;

    if (!listingId) return res.status(400).json({ error: "listingId is required" });

    const listing = await prisma.franchiseListing.findUnique({
      where: { id: listingId },
      include: { company: { select: { id: true, ownerId: true } } },
    });
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    const existing = await prisma.application.findUnique({
      where: { listingId_applicantId: { listingId, applicantId: req.user.id } },
    });
    if (existing) {
      return res.status(409).json({ error: "You have already applied to this listing" });
    }

    const application = await prisma.application.create({
      data: {
        listingId,
        companyId: listing.company.id,
        applicantId: req.user.id,
        personalInfo: personalInfo || undefined,
        businessInfo: businessInfo || undefined,
        financialInfo: financialInfo || undefined,
        locationPreference: locationPreference || undefined,
        coverLetter: coverLetter || null,
        acceptedPolicyVersion: acceptedPolicyVersion || null,
        acceptedPolicyTerms: acceptedPolicyTerms || null,
        acceptedAt: acceptedAt ? new Date(acceptedAt) : null,
      },
    });

    await prisma.franchiseListing.update({
      where: { id: listingId },
      data: { applicationCount: { increment: 1 } },
    });

    emitStatsUpdate(req.user.id);
    if (listing.company.ownerId) {
      const notif = await prisma.notification.create({
        data: {
          userId: listing.company.ownerId,
          type: "application_received",
          title: "New Application Received",
          body: `${req.user.name || "Someone"} applied to "${listing.title}"`,
          data: { listingId, applicationId: application.id, applicantId: req.user.id },
        },
      });
      try { emitNotification(notif); } catch {}
      try { emitStatsUpdate(listing.company.ownerId); } catch {}
    }
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
          select: {
            id: true, title: true, slug: true, investmentMin: true, investmentMax: true,
            company: { select: { id: true, name: true, slug: true, logoUrl: true } },
          },
        },
        documents: true,
        company: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(applications);
  } catch (error) {
    console.error("Applications route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/company", authenticate, async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      where: { ownerId: req.user.id },
      select: { id: true },
    });
    const companyIds = companies.map((c) => c.id);
    if (companyIds.length === 0) return res.json([]);

    const applications = await prisma.application.findMany({
      where: { listing: { companyId: { in: companyIds } } },
      include: {
        applicant: { select: { id: true, name: true, email: true, image: true, headline: true, location: true } },
        listing: {
          select: {
            id: true, title: true, slug: true, investmentMin: true, investmentMax: true,
            company: { select: { id: true, name: true } },
          },
        },
        documents: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(applications);
  } catch (error) {
    console.error("Applications route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        applicant: { select: { id: true, name: true, email: true, image: true, headline: true, location: true, phone: true } },
        listing: {
          select: {
            id: true, title: true, slug: true, description: true, industry: true,
            investmentMin: true, investmentMax: true, franchiseFee: true, royaltyFee: true,
            location: true, city: true, country: true, images: true,
            company: { select: { id: true, name: true, slug: true, logoUrl: true, email: true, phone: true, website: true } },
          },
        },
        documents: true,
        company: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!application) return res.status(404).json({ error: "Application not found" });

    const isApplicant = application.applicantId === req.user.id;
    const isCompanyOwner = application.listing.company.id
      ? (await prisma.company.findUnique({ where: { id: application.listing.company.id }, select: { ownerId: true } }))?.ownerId === req.user.id
      : false;

    if (!isApplicant && !isCompanyOwner && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (isCompanyOwner && !application.viewedAt) {
      await prisma.application.update({
        where: { id: application.id },
        data: { viewedAt: new Date() },
      });
    }

    res.json(application);
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

    const timestamps = {};
    if (status === "shortlisted") timestamps.shortlistedAt = new Date();
    if (status === "interview") timestamps.interviewAt = new Date();
    if (status === "accepted") timestamps.acceptedAt = new Date();

    const updated = await prisma.application.update({
      where: { id: req.params.id },
      data: { status, ...timestamps },
    });

    const notif = await prisma.notification.create({
      data: {
        userId: application.applicantId,
        type: "application_status_changed",
        title: "Application Status Updated",
        body: `Your application for "${application.listing.title}" has been ${status}`,
        data: { listingId: application.listingId, applicationId: application.id, status },
      },
    });
    try { emitNotification(notif); } catch {}
    try { emitApplicationUpdate(updated); } catch {}
    try { emitStatsUpdate(application.applicantId); } catch {}

    res.json(updated);
  } catch (error) {
    console.error("Applications route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id/withdraw", authenticate, async (req, res) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { listing: { include: { company: true } } },
    });
    if (!application) return res.status(404).json({ error: "Application not found" });
    if (application.applicantId !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const updated = await prisma.application.update({
      where: { id: req.params.id },
      data: { status: "withdrawn" },
    });

    if (application.listing.company.ownerId) {
      const notif = await prisma.notification.create({
        data: {
          userId: application.listing.company.ownerId,
          type: "application_status_changed",
          title: "Application Withdrawn",
          body: `An applicant withdrew from "${application.listing.title}"`,
          data: { listingId: application.listingId, applicationId: application.id, status: "withdrawn" },
        },
      });
      try { emitNotification(notif); } catch {}
    }
    try { emitApplicationUpdate(updated); } catch {}
    res.json(updated);
  } catch (error) {
    console.error("Applications route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/documents", authenticate, async (req, res) => {
  try {
    const { type, fileName, url } = req.body;
    if (!type || !url) return res.status(400).json({ error: "type and url are required" });

    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { listing: { include: { company: true } } },
    });
    if (!application) return res.status(404).json({ error: "Application not found" });

    const isApplicant = application.applicantId === req.user.id;
    const isOwner = application.listing.company.ownerId === req.user.id;
    if (!isApplicant && !isOwner && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const doc = await prisma.applicationDocument.create({
      data: { applicationId: application.id, type, fileName: fileName || url, url },
    });
    res.status(201).json(doc);
  } catch (error) {
    console.error("Applications route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id/documents/:docId", authenticate, async (req, res) => {
  try {
    const doc = await prisma.applicationDocument.findUnique({
      where: { id: req.params.docId },
      include: { application: true },
    });
    if (!doc) return res.status(404).json({ error: "Document not found" });
    if (doc.application.applicantId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }
    await prisma.applicationDocument.delete({ where: { id: req.params.docId } });
    res.json({ success: true });
  } catch (error) {
    console.error("Applications route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id/notes", authenticate, async (req, res) => {
  try {
    const { notes } = req.body;
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
      data: { notes: notes || {} },
    });
    res.json(updated);
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
        applicant: { select: { id: true, name: true, image: true, headline: true, location: true } },
        documents: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(applications);
  } catch (error) {
    console.error("Applications route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;