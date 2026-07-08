import { Router } from "express";
import prisma from "../prisma.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.use(authenticate, authorize("admin"));

router.patch("/companies/:id/verify", async (req, res) => {
  try {
    const company = await prisma.company.update({
      where: { id: req.params.id },
      data: { isVerified: req.body.isVerified },
    });
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/companies/:id/status", async (req, res) => {
  try {
    const company = await prisma.company.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    });
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/listings/:id/status", async (req, res) => {
  try {
    const listing = await prisma.franchiseListing.update({
      where: { id: req.params.id },
      data: { status: req.body.status, publishedAt: req.body.status === "active" ? new Date() : undefined },
    });
    res.json(listing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/users", async (req, res) => {
  try {
    const { page = 1, limit = 20, status, role } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.accountStatus = status;
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        select: {
          id: true, email: true, fullName: true, role: true,
          accountStatus: true, isActive: true, createdAt: true,
          lastLoginAt: true, companyName: true, phone: true,
          submittedForReviewAt: true, emailVerified: true, phoneVerified: true,
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

router.patch("/users/:id/toggle-active", async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: req.body.isActive },
    });
    res.json({ id: user.id, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/users/pending-verification", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { accountStatus: "pending_admin_review" };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        select: {
          id: true, email: true, fullName: true, role: true,
          accountStatus: true, companyName: true, consultancyName: true,
          businessEmail: true, phone: true, website: true,
          businessRegistrationNumber: true, gstNumber: true,
          experienceYears: true, linkedinUrl: true,
          submittedForReviewAt: true, createdAt: true,
        },
        orderBy: { submittedForReviewAt: "asc" },
      }),
      prisma.user.count({ where }),
    ]);
    res.json({ users, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/users/:id/documents", async (req, res) => {
  try {
    const docs = await prisma.userDocument.findMany({
      where: { userId: req.params.id },
      orderBy: { createdAt: "desc" },
    });
    res.json({ documents: docs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/users/:id/verify", async (req, res) => {
  try {
    const { action, notes } = req.body;

    if (action === "approve") {
      const user = await prisma.user.update({
        where: { id: req.params.id },
        data: {
          accountStatus: "verified",
          reviewedBy: req.user.id,
          reviewedAt: new Date(),
          verificationNotes: notes || null,
        },
      });
      return res.json({ user, message: "User verified successfully" });
    }

    if (action === "reject") {
      const user = await prisma.user.update({
        where: { id: req.params.id },
        data: {
          accountStatus: "rejected",
          reviewedBy: req.user.id,
          reviewedAt: new Date(),
          rejectionReason: notes || null,
        },
      });
      return res.json({ user, message: "User rejected" });
    }

    if (action === "request_info") {
      const user = await prisma.user.update({
        where: { id: req.params.id },
        data: {
          accountStatus: "need_more_information",
          reviewedBy: req.user.id,
          verificationNotes: notes || null,
        },
      });
      return res.json({ user, message: "More information requested" });
    }

    res.status(400).json({ error: "Invalid action. Use: approve, reject, request_info" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
