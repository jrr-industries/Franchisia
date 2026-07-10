import { Router } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.ts";
import prisma from "../prisma.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.use(authenticate, authorize("admin"));

router.get("/stats", async (req, res) => {
  try {
    const [
      totalUsers,
      pendingVerifications,
      verifiedCompanies,
      activeCompanies,
      totalMessages,
      totalFollowers,
      totalReports,
      newUsersToday,
      verificationStats,
      roleStats,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { accountStatus: "pending_admin_review" } }),
      prisma.company.count({ where: { isVerified: true } }),
      prisma.company.count({ where: { status: "active" } }),
      prisma.message.count(),
      prisma.companyFollower.count(),
      prisma.report.count(),
      prisma.user.count({ where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
      prisma.user.groupBy({ by: ["accountStatus"], _count: true }),
      prisma.user.groupBy({ by: ["role"], _count: true }),
    ]);

    res.json({
      totalUsers,
      pendingVerifications,
      verifiedCompanies,
      activeCompanies,
      totalMessages,
      totalFollowers,
      totalReports,
      newUsersToday,
      verificationStats,
      roleStats,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/users", async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (role) where.role = role;
    if (status) where.accountStatus = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        select: {
          id: true, email: true, name: true, role: true, image: true,
          accountStatus: true, isActive: true, createdAt: true,
          lastLoginAt: true, companyName: true, phone: true,
          submittedForReviewAt: true, emailVerified: true,
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
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: !user.isActive },
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: user.isActive ? "account_suspended" : "account_reactivated",
        title: user.isActive ? "Account Suspended" : "Account Reactivated",
        body: `Your account has been ${user.isActive ? "suspended" : "reactivated"} by an admin.`,
        data: { adminId: req.user.id },
      },
    });

    res.json({ id: updated.id, isActive: updated.isActive });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/users/:id/make-admin", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const newRole = user.role === "admin" ? "none" : "admin";
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: newRole },
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: newRole === "admin" ? "admin_promoted" : "admin_demoted",
        title: newRole === "admin" ? "Admin Privileges Granted" : "Admin Privileges Revoked",
        body: `You have been ${newRole === "admin" ? "granted" : "revoked"} admin privileges.`,
        data: { adminId: req.user.id },
      },
    });

    res.json({ id: updated.id, role: updated.role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/verification/pending", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { accountStatus: { in: ["pending_admin_review", "need_more_information"] } };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        select: {
          id: true, email: true, name: true, role: true, image: true,
          accountStatus: true, companyName: true, phone: true,
          submittedForReviewAt: true, createdAt: true,
          businessRegistrationDoc: true, gstNumber: true,
          businessLicenseDoc: true, resumeUrl: true, certifications: true,
          documents: { select: { id: true, type: true, url: true, fileName: true } },
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

router.patch("/verification/:id/review", async (req, res) => {
  try {
    const { action, notes } = req.body;
    const userId = req.params.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (action === "approve") {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          accountStatus: "verified",
          onboardingCompleted: true,
          reviewedBy: req.user.id,
          reviewedAt: new Date(),
          verificationNotes: notes || null,
        },
      });

      await prisma.notification.create({
        data: {
          userId,
          type: "verification_approved",
          title: "Verification Approved",
          body: "Your account has been verified. You now have full access to the platform.",
          data: { reviewedBy: req.user.id },
        },
      });

      const { passwordHash, ...userData } = updated;
      return res.json({ user: userData, message: "User verified successfully" });
    }

    if (action === "reject") {
      if (!notes) return res.status(400).json({ error: "Rejection reason is required" });

      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          accountStatus: "rejected",
          reviewedBy: req.user.id,
          reviewedAt: new Date(),
          rejectionReason: notes,
        },
      });

      await prisma.notification.create({
        data: {
          userId,
          type: "verification_rejected",
          title: "Verification Rejected",
          body: `Your verification was rejected. Reason: ${notes}`,
          data: { reviewedBy: req.user.id, reason: notes },
        },
      });

      const { passwordHash, ...userData } = updated;
      return res.json({ user: userData, message: "User rejected" });
    }

    if (action === "request_info") {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          accountStatus: "need_more_information",
          verificationNotes: notes || null,
        },
      });

      const { passwordHash, ...userData } = updated;
      return res.json({ user: userData, message: "More information requested" });
    }

    res.status(400).json({ error: "Invalid action. Use: approve, reject, request_info" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/verification/:id/documents", async (req, res) => {
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

router.get("/companies", async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, isVerified } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (isVerified !== undefined) where.isVerified = isVerified === "true";
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { followers: true, listings: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.company.count({ where }),
    ]);

    res.json({ companies, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

router.get("/reports", async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.report.count({ where }),
    ]);

    res.json({ reports, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/notifications", async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.user.id },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where: { userId: req.user.id } }),
    ]);

    res.json({ notifications, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/notifications/:id/read", async (req, res) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/notifications/read-all", async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
