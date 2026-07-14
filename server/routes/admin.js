import { Router } from "express";
import prisma from "../prisma.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { emitCompanyCreated, emitCompanyUpdated, emitCompanyDeleted, emitCompanyVerified, emitNotification, getIO } from "../socket.js";
import { getMaintenanceMode, setMaintenanceMode, getFeatureFlags, setFeatureFlags } from "../settings.js";
import { getSiteContent, setSiteContent } from "../site-content.js";

const router = Router();

router.use(authenticate, authorize("admin"));

router.get("/stats", async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(todayStart.getTime() - 7 * 86400000);
    const monthAgo = new Date(todayStart.getTime() - 30 * 86400000);

    const [
      totalUsers,
      onlineUsers,
      newUsersToday,
      newUsersWeek,
      newUsersMonth,
      verifiedUsers,
      pendingVerifications,
      totalCompanies,
      verifiedCompanies,
      activeCompanies,
      totalMessages,
      messagesToday,
      totalFollowers,
      newFollowersToday,
      totalReports,
      pendingReports,
      totalApplications,
      totalListings,
      activeListings,
      verificationStats,
      roleStats,
      industryStats,
      totalBlogPosts,
      publishedBlogPosts,
      draftBlogPosts,
      totalEvents,
      totalPartners,
      totalTestimonials,
      totalFAQs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { lastLoginAt: { gte: new Date(Date.now() - 15 * 60000) } } }),
      prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: monthAgo } } }),
      prisma.user.count({ where: { verified: true } }),
      prisma.user.count({ where: { accountStatus: "pending_admin_review" } }),
      prisma.company.count(),
      prisma.company.count({ where: { isVerified: true } }),
      prisma.company.count({ where: { status: "active" } }),
      prisma.message.count(),
      prisma.message.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.companyFollower.count(),
      prisma.companyFollower.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.report.count(),
      prisma.report.count({ where: { status: "pending" } }),
      prisma.application.count(),
      prisma.franchiseListing.count(),
      prisma.franchiseListing.count({ where: { status: "active" } }),
      prisma.user.groupBy({ by: ["accountStatus"], _count: true }),
      prisma.user.groupBy({ by: ["role"], _count: true }),
      prisma.company.groupBy({ by: ["industry"], _count: true, orderBy: { _count: { industry: "desc" } }, take: 10 }),
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { status: "published" } }),
      prisma.blogPost.count({ where: { status: "draft" } }),
      prisma.event.count(),
      prisma.partner.count(),
      prisma.testimonial.count(),
      prisma.siteFAQ.count(),
    ]);

    res.json({
      totalUsers,
      onlineUsers,
      newUsersToday,
      newUsersWeek,
      newUsersMonth,
      verifiedUsers,
      pendingVerifications,
      totalCompanies,
      verifiedCompanies,
      activeCompanies,
      totalMessages,
      messagesToday,
      totalFollowers,
      newFollowersToday,
      totalReports,
      pendingReports,
      totalApplications,
      totalListings,
      activeListings,
      verificationStats,
      roleStats,
      industryStats,
      totalBlogPosts,
      publishedBlogPosts,
      draftBlogPosts,
      totalEvents,
      totalPartners,
      totalTestimonials,
      totalFAQs,
    });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
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
          accountStatus: true, verified: true, isActive: true, createdAt: true,
          lastLoginAt: true, companyName: true, phone: true,
          submittedForReviewAt: true, emailVerified: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
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

    const notif = await prisma.notification.create({
      data: {
        userId: user.id,
        type: user.isActive ? "account_suspended" : "account_reactivated",
        title: user.isActive ? "Account Suspended" : "Account Reactivated",
        body: `Your account has been ${user.isActive ? "suspended" : "reactivated"} by an admin.`,
        data: { adminId: req.user.id },
      },
    });
    try { emitNotification(notif); } catch {}

    res.json({ id: updated.id, isActive: updated.isActive });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/users/:id/suspend", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: false },
      select: { id: true, isActive: true },
    });

    const notif = await prisma.notification.create({
      data: {
        userId: user.id,
        type: "account_suspended",
        title: "Account Suspended",
        body: "Your account has been suspended by an admin.",
        data: { adminId: req.user.id },
      },
    });
    try { emitNotification(notif); } catch {}

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: "SUSPEND_USER",
        tableName: "users",
        recordId: req.params.id,
        newData: { isActive: false },
        ipAddress: req.ip,
      },
    });

    res.json({ id: updated.id, isActive: updated.isActive });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/users/:id/make-admin", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const newRole = user.role === "admin" ? "franchisee" : "admin";
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: newRole },
    });

    const notif = await prisma.notification.create({
      data: {
        userId: user.id,
        type: newRole === "admin" ? "admin_promoted" : "admin_demoted",
        title: newRole === "admin" ? "Admin Privileges Granted" : "Admin Privileges Revoked",
        body: `You have been ${newRole === "admin" ? "granted" : "revoked"} admin privileges.`,
        data: { adminId: req.user.id },
      },
    });
    try { emitNotification(notif); } catch {}

    res.json({ id: updated.id, role: updated.role });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.message.deleteMany({ where: { senderId: req.params.id } });
      await tx.conversationParticipant.deleteMany({ where: { userId: req.params.id } });
      await tx.notification.deleteMany({ where: { userId: req.params.id } });
      await tx.application.deleteMany({ where: { applicantId: req.params.id } });
      await tx.connection.deleteMany({ where: { OR: [{ followerId: req.params.id }, { followingId: req.params.id }] } });
      await tx.companyFollower.deleteMany({ where: { userId: req.params.id } });
      await tx.userDocument.deleteMany({ where: { userId: req.params.id } });
      await tx.auditLog.deleteMany({ where: { userId: req.params.id } });
      await tx.verificationHistory.deleteMany({ where: { userId: req.params.id } });
      await tx.review.deleteMany({ where: { reviewerId: req.params.id } });
      await tx.session.deleteMany({ where: { userId: req.params.id } });
      await tx.user.delete({ where: { id: req.params.id } });
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
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
          accountStatus: true, verified: true, companyName: true, brandName: true, phone: true,
          location: true, submittedForReviewAt: true, createdAt: true,
          businessRegistrationDoc: true, gstNumber: true,
          businessLicenseDoc: true, resumeUrl: true, certifications: true,
          verificationNotes: true,
          documents: { select: { id: true, type: true, url: true, fileName: true } },
          education: { select: { id: true, school: true, degree: true, field: true, startYear: true, endYear: true } },
          experience: { select: { id: true, company: true, role: true, description: true, startDate: true, endDate: true, isCurrent: true } },
          skills: { select: { id: true, skill: true } },
          interests: { select: { id: true, interest: true } },
          verificationHistories: { orderBy: { createdAt: "desc" }, take: 20 },
        },
        orderBy: { submittedForReviewAt: "asc" },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
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
          verified: true,
          verifiedAt: new Date(),
          verifiedBy: req.user.id,
          onboardingCompleted: true,
          reviewedBy: req.user.id,
          reviewedAt: new Date(),
          verificationNotes: notes || null,
        },
      });

      const notif = await prisma.notification.create({
        data: {
          userId,
          type: "verification_approved",
          title: "Verification Approved",
          body: "Your account has been verified. You now have full access to the platform.",
          data: { reviewedBy: req.user.id },
        },
      });
      try { emitNotification(notif); } catch {}

      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: "VERIFY_USER",
          tableName: "users",
          recordId: userId,
          newData: { accountStatus: "verified", verified: true, verifiedAt: new Date().toISOString() },
          ipAddress: req.ip,
        },
      });

      if (user.role === "franchisor") {
        let company = await prisma.company.findFirst({ where: { ownerId: userId } });
        if (company) {
          company = await prisma.company.update({ where: { id: company.id }, data: { status: "active" } });
        } else {
          const companyName = user.companyName || user.brandName || `${user.name || "Unknown"}'s Company`;
          const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + userId.slice(0, 6);
          company = await prisma.company.create({
            data: {
              ownerId: userId,
              name: companyName,
              slug,
              industry: user.preferredIndustry || user.industries?.[0] || "Other",
              description: user.companyDescription || null,
              website: user.website || null,
              email: user.businessEmail || user.email || null,
              address: user.location || null,
              status: "active",
            },
          });
          try { emitCompanyCreated(company); } catch {}
        }
        try { emitCompanyUpdated(company); } catch {}
      }

      await prisma.verificationHistory.create({
        data: {
          userId,
          action: "approved",
          previousStatus: user.accountStatus,
          currentStatus: "verified",
          reviewedBy: req.user.id,
          adminNotes: notes || null,
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

      const notif = await prisma.notification.create({
        data: {
          userId,
          type: "verification_rejected",
          title: "Verification Rejected",
          body: `Your verification was rejected. Reason: ${notes}`,
          data: { reviewedBy: req.user.id, reason: notes },
        },
      });
      try { emitNotification(notif); } catch {}

      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: "REJECT_USER",
          tableName: "users",
          recordId: userId,
          newData: { accountStatus: "rejected", rejectionReason: notes },
          ipAddress: req.ip,
        },
      });

      if (user.role === "franchisor") {
        const company = await prisma.company.findFirst({ where: { ownerId: userId } });
        if (company) {
          const updated = await prisma.company.update({ where: { id: company.id }, data: { status: "inactive" } });
          try { emitCompanyUpdated(updated); } catch {}
        }
      }

      await prisma.verificationHistory.create({
        data: {
          userId,
          action: "rejected",
          previousStatus: user.accountStatus,
          currentStatus: "rejected",
          reviewedBy: req.user.id,
          adminNotes: notes,
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

      await prisma.verificationHistory.create({
        data: {
          userId,
          action: "requested_info",
          previousStatus: user.accountStatus,
          currentStatus: "need_more_information",
          reviewedBy: req.user.id,
          adminNotes: notes || null,
        },
      });

      const { passwordHash, ...userData } = updated;
      return res.json({ user: userData, message: "More information requested" });
    }

    res.status(400).json({ error: "Invalid action. Use: approve, reject, request_info" });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/verification/:id/internal-notes", async (req, res) => {
  try {
    const { notes } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: "User not found" });
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { verificationNotes: notes },
      select: { id: true, verificationNotes: true },
    });
    res.json({ success: true, internalNotes: updated.verificationNotes });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
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
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
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
        orderBy: [{ isVerified: "desc" }, { createdAt: "desc" }],
      }),
      prisma.company.count({ where }),
    ]);

    res.json({ companies, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/verification/:id/history", async (req, res) => {
  try {
    const history = await prisma.verificationHistory.findMany({
      where: { userId: req.params.id },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    });
    res.json({ history });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/companies/:id/verify", async (req, res) => {
  try {
    const company = await prisma.company.update({
      where: { id: req.params.id },
      data: { isVerified: req.body.isVerified },
      include: { _count: { select: { followers: true, listings: true } } },
    });
    emitCompanyVerified(company);
    emitCompanyUpdated(company);
    res.json(company);
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/companies/:id/status", async (req, res) => {
  try {
    const company = await prisma.company.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    });
    emitCompanyUpdated(company);
    res.json(company);
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
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
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
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
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
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
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
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
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/audit-logs", async (req, res) => {
  try {
    const { page = 1, limit = 50, action, userId: logUserId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (action) where.action = action;
    if (logUserId) where.userId = logUserId;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: { user: { select: { id: true, name: true, email: true, image: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({ logs, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/system-health", async (req, res) => {
  try {
    const [userCount, dbTest] = await Promise.all([
      prisma.user.count(),
      prisma.$queryRaw`SELECT 1 as ok`,
    ]);
    res.json({
      database: { status: "connected", ok: true },
      uptime: Math.floor(process.uptime()),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
    });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/reports/:id/resolve", async (req, res) => {
  try {
    const { action: reportAction } = req.body;
    const report = await prisma.report.update({
      where: { id: req.params.id },
      data: { status: reportAction === "dismiss" ? "dismissed" : "resolved", resolvedAt: new Date(), resolvedBy: req.user.id },
    });
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: reportAction === "dismiss" ? "DISMISS_REPORT" : "RESOLVE_REPORT",
        tableName: "reports",
        recordId: req.params.id,
        newData: { status: reportAction === "dismiss" ? "dismissed" : "resolved" },
        ipAddress: req.ip,
      },
    });
    res.json({ report });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/send-announcement", async (req, res) => {
  try {
    const { title, body, targets } = req.body;
    if (!title || !body) return res.status(400).json({ error: "Title and body are required" });
    const where = targets === "all" ? {} : targets === "verified" ? { verified: true } : {};
    const users = await prisma.user.findMany({ where, select: { id: true } });
    await prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        type: "system_announcement",
        title,
        body,
        data: { sentBy: req.user.id },
      })),
    });
    res.json({ success: true, sentCount: users.length });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users/:id/profile", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        _count: { select: { receivedConnections: true, sentConnections: true, companyFollowers: true } },
        documents: true,
        verificationHistories: { orderBy: { createdAt: "desc" }, take: 20 },
        auditLogs: { orderBy: { createdAt: "desc" }, take: 10 },
        notifications: { orderBy: { createdAt: "desc" }, take: 5, select: { id: true, type: true, title: true, body: true, createdAt: true, isRead: true } },
        companies: { select: { id: true, name: true, slug: true, isVerified: true, status: true, _count: { select: { followers: true } } } },
      },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    const messageCount = await prisma.message.count({ where: { senderId: req.params.id } });
    const { passwordHash, ...userData } = user;
    res.json({ user: { ...userData, messageCount } });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/users/bulk-action", async (req, res) => {
  try {
    const { userIds, action } = req.body;
    if (!userIds?.length || !action) return res.status(400).json({ error: "userIds and action required" });

    if (action === "delete") {
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    } else if (action === "suspend") {
      await prisma.user.updateMany({ where: { id: { in: userIds } }, data: { isActive: false } });
    } else if (action === "activate") {
      await prisma.user.updateMany({ where: { id: { in: userIds } }, data: { isActive: true } });
    } else if (action === "verify") {
      await prisma.user.updateMany({ where: { id: { in: userIds } }, data: { verified: true, accountStatus: "verified" } });
    } else if (action === "make_admin") {
      await prisma.user.updateMany({ where: { id: { in: userIds }, role: { not: "admin" } }, data: { role: "admin" } });
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: `BULK_${action.toUpperCase()}`,
        tableName: "users",
        recordId: userIds.join(","),
        newData: { action, count: userIds.length },
        ipAddress: req.ip,
      },
    });

    res.json({ success: true, affectedCount: userIds.length });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/verification/all", async (req, res) => {
  try {
    const { page = 1, limit = 20, status, role, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (status) where.accountStatus = status;
    if (role) where.role = role;
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
          accountStatus: true, verified: true, isActive: true, createdAt: true,
          submittedForReviewAt: true, reviewedAt: true, reviewedBy: true,
          rejectionReason: true, verificationNotes: true,
          phone: true, location: true, companyName: true, brandName: true,
          gstNumber: true, businessRegistrationNumber: true,
          businessRegistrationDoc: true, businessLicenseDoc: true,
          website: true, yearsInBusiness: true, numberOfOutlets: true,
          companyDescription: true, consultancyName: true,
          preferredIndustry: true, preferredLocation: true,
          investmentRange: true, investmentCapacity: true,
          experienceYears: true, resumeUrl: true, certifications: true,
          documents: { select: { id: true, type: true, url: true, fileName: true } },
          education: { select: { id: true, school: true, degree: true, field: true, startYear: true, endYear: true } },
          experience: { select: { id: true, company: true, role: true, description: true, startDate: true, endDate: true, isCurrent: true } },
          skills: { select: { id: true, skill: true } },
          interests: { select: { id: true, interest: true } },
          verificationHistories: { orderBy: { createdAt: "desc" }, take: 20 },
        },
        orderBy: { submittedForReviewAt: "asc" },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/verification/stats", async (req, res) => {
  try {
    const groups = await prisma.user.groupBy({
      by: ["accountStatus"],
      _count: true,
    });
    const stats = { pending: 0, approved: 0, rejected: 0, needsInfo: 0, total: 0 };
    groups.forEach((g) => {
      stats.total += g._count;
      if (g.accountStatus === "pending_admin_review") stats.pending += g._count;
      else if (g.accountStatus === "verified") stats.approved += g._count;
      else if (g.accountStatus === "rejected") stats.rejected += g._count;
      else if (g.accountStatus === "need_more_information") stats.needsInfo += g._count;
    });
    res.json(stats);
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users/:id/activity", async (req, res) => {
  try {
    const [auditLogs, notificationLogs, verificationHistory] = await Promise.all([
      prisma.auditLog.findMany({ where: { recordId: req.params.id }, orderBy: { createdAt: "desc" }, take: 20 }),
      prisma.notification.findMany({ where: { userId: req.params.id }, orderBy: { createdAt: "desc" }, take: 20, select: { id: true, type: true, title: true, body: true, createdAt: true } }),
      prisma.verificationHistory.findMany({ where: { userId: req.params.id }, orderBy: { createdAt: "desc" }, take: 20 }),
    ]);
    res.json({ auditLogs, notifications: notificationLogs, verificationHistory });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/users/:id/profile", async (req, res) => {
  try {
    const allowedFields = ["name", "companyName", "phone", "verificationNotes", "rejectionReason"];
    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: "No valid fields to update" });
    const updated = await prisma.user.update({ where: { id: req.params.id }, data: updates });
    const { passwordHash, ...userData } = updated;
    res.json({ user: userData });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/companies/:id/profile", async (req, res) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, name: true, email: true, image: true } },
        _count: { select: { followers: true, listings: true, reviews: true } },
        listings: { take: 10, orderBy: { createdAt: "desc" }, include: { _count: { select: { applications: true } } } },
        policies: {
          include: {
            faqs: { orderBy: { sortOrder: "asc" } },
            documents: { where: { isHidden: false } },
          },
        },
      },
    });
    if (!company) return res.status(404).json({ error: "Company not found" });
    res.json({ company });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/companies/bulk-action", async (req, res) => {
  try {
    const { companyIds, action } = req.body;
    if (!companyIds?.length || !action) return res.status(400).json({ error: "companyIds and action required" });
    if (action === "delete") {
      await prisma.company.deleteMany({ where: { id: { in: companyIds } } });
      for (const id of companyIds) emitCompanyDeleted(id);
    } else if (action === "verify") {
      await prisma.company.updateMany({ where: { id: { in: companyIds } }, data: { isVerified: true } });
      const companies = await prisma.company.findMany({ where: { id: { in: companyIds } }, include: { _count: { select: { followers: true, listings: true } } } });
      for (const c of companies) { emitCompanyVerified(c); emitCompanyUpdated(c); }
    } else if (action === "unverify") {
      await prisma.company.updateMany({ where: { id: { in: companyIds } }, data: { isVerified: false } });
      const companies = await prisma.company.findMany({ where: { id: { in: companyIds } }, include: { _count: { select: { followers: true, listings: true } } } });
      for (const c of companies) emitCompanyUpdated(c);
    } else if (action === "suspend") {
      await prisma.company.updateMany({ where: { id: { in: companyIds } }, data: { status: "suspended" } });
      const companies = await prisma.company.findMany({ where: { id: { in: companyIds } }, include: { _count: { select: { followers: true, listings: true } } } });
      for (const c of companies) emitCompanyUpdated(c);
    } else if (action === "activate") {
      await prisma.company.updateMany({ where: { id: { in: companyIds } }, data: { status: "active" } });
      const companies = await prisma.company.findMany({ where: { id: { in: companyIds } }, include: { _count: { select: { followers: true, listings: true } } } });
      for (const c of companies) emitCompanyUpdated(c);
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }
    await prisma.auditLog.create({
      data: {
        userId: req.user.id, action: `BULK_COMPANY_${action.toUpperCase()}`, tableName: "companies",
        recordId: companyIds.join(","), newData: { action, count: companyIds.length }, ipAddress: req.ip,
      },
    });
    res.json({ success: true, affectedCount: companyIds.length });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/companies/:id/profile", async (req, res) => {
  try {
    const allowedFields = ["name", "industry", "description", "email", "phone", "website", "investmentRange", "location"];
    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: "No valid fields to update" });
    const company = await prisma.company.update({
      where: { id: req.params.id },
      data: updates,
      include: { _count: { select: { followers: true, listings: true } } },
    });
    emitCompanyUpdated(company);
    res.json({ company });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/marketplace/listings", async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search, featured } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (status) where.status = status;
    if (featured !== undefined) where.isFeatured = featured === "true";
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    const [listings, total] = await Promise.all([
      prisma.franchiseListing.findMany({
        where, skip, take: parseInt(limit),
        include: {
          company: { select: { id: true, name: true, slug: true } },
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.franchiseListing.count({ where }),
    ]);
    res.json({ listings, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/marketplace/listings/:id/status", async (req, res) => {
  try {
    const listing = await prisma.franchiseListing.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    });
    await prisma.auditLog.create({
      data: {
        userId: req.user.id, action: `UPDATE_LISTING_STATUS`, tableName: "franchise_listings",
        recordId: req.params.id, newData: { status: req.body.status }, ipAddress: req.ip,
      },
    });
    res.json({ listing });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/marketplace/listings/:id/feature", async (req, res) => {
  try {
    const listing = await prisma.franchiseListing.findUnique({ where: { id: req.params.id } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    const updated = await prisma.franchiseListing.update({
      where: { id: req.params.id },
      data: { isFeatured: !listing.isFeatured },
    });
    res.json({ listing: updated });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/marketplace/listings/:id", async (req, res) => {
  try {
    await prisma.franchiseListing.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/marketplace/applications", async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (status) where.status = status;
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where, skip, take: parseInt(limit),
        include: {
          applicant: { select: { id: true, name: true, email: true, image: true } },
          listing: { select: { id: true, title: true, company: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.application.count({ where }),
    ]);
    res.json({ applications, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/marketplace/applications/:id/status", async (req, res) => {
  try {
    const application = await prisma.application.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    });
    res.json({ application });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==================== Messages Management ====================

router.get("/messages/all", async (req, res) => {
  try {
    const { page = 1, limit = 30, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (search) where.content = { contains: search, mode: "insensitive" };
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where, skip, take: parseInt(limit),
        include: {
          sender: { select: { id: true, name: true, email: true, image: true } },
          conversation: { select: { id: true, subject: true, participants: { include: { user: { select: { id: true, name: true, email: true } } } } } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.message.count({ where }),
    ]);
    res.json({ messages, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/messages/:id", async (req, res) => {
  try {
    await prisma.message.delete({ where: { id: req.params.id } });
    await prisma.auditLog.create({
      data: { userId: req.user.id, action: "DELETE_MESSAGE", tableName: "messages", recordId: req.params.id, ipAddress: req.ip },
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/messages/conversations", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        skip, take: parseInt(limit),
        include: {
          participants: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
          _count: { select: { messages: true } },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.conversation.count(),
    ]);
    res.json({ conversations, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/messages/conversations/:id/messages", async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const messages = await prisma.message.findMany({
      where: { conversationId: req.params.id },
      take: parseInt(limit),
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, name: true, email: true, image: true } },
      },
    });
    res.json({ messages });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==================== Followers Management ====================

router.get("/followers/stats", async (req, res) => {
  try {
    const [totalCompanyFollowers, totalUserConnections, topCompanies, topUsers] = await Promise.all([
      prisma.companyFollower.count(),
      prisma.connection.count(),
      prisma.companyFollower.groupBy({ by: ["companyId"], _count: true, orderBy: { _count: { companyId: "desc" } }, take: 10 }),
      prisma.connection.groupBy({ by: ["followingId"], _count: true, orderBy: { _count: { followingId: "desc" } }, take: 10 }),
    ]);
    const companyDetails = topCompanies.length ? await prisma.company.findMany({ where: { id: { in: topCompanies.map(c => c.companyId) } }, select: { id: true, name: true, slug: true } }) : [];
    const userDetails = topUsers.length ? await prisma.user.findMany({ where: { id: { in: topUsers.map(u => u.followingId) } }, select: { id: true, name: true, email: true, image: true } }) : [];
    res.json({
      totalCompanyFollowers,
      totalUserConnections,
      topCompanies: topCompanies.map(c => ({ ...c, company: companyDetails.find(cd => cd.id === c.companyId) })),
      topUsers: topUsers.map(u => ({ ...u, user: userDetails.find(ud => ud.id === u.followingId) })),
    });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/followers/company/:companyId/user/:userId", async (req, res) => {
  try {
    await prisma.companyFollower.deleteMany({
      where: { companyId: req.params.companyId, userId: req.params.userId },
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/followers/user/:targetUserId/:userId", async (req, res) => {
  try {
    await prisma.connection.deleteMany({
      where: { followingId: req.params.targetUserId, followerId: req.params.userId },
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==================== Settings ====================

router.get("/settings", async (req, res) => {
  try {
    res.json({
      platformName: "Franchisia",
      maintenanceMode: await getMaintenanceMode(),
      featureFlags: await getFeatureFlags(),
      theme: "system",
      version: "1.0.0",
    });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/settings", async (req, res) => {
  try {
    if (req.body.maintenanceMode !== undefined) await setMaintenanceMode(req.body.maintenanceMode);
    if (req.body.featureFlags) await setFeatureFlags(req.body.featureFlags);
    await prisma.auditLog.create({
      data: { userId: req.user.id, action: "UPDATE_SETTINGS", tableName: "settings", newData: req.body, ipAddress: req.ip },
    });
    res.json({ success: true, maintenanceMode: await getMaintenanceMode(), featureFlags: await getFeatureFlags() });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/settings/maintenance", async (req, res) => {
  res.json({ enabled: await getMaintenanceMode() });
});

router.post("/settings/maintenance", async (req, res) => {
  await setMaintenanceMode(!!req.body.enabled);
  await prisma.auditLog.create({
    data: { userId: req.user.id, action: (await getMaintenanceMode()) ? "ENABLE_MAINTENANCE" : "DISABLE_MAINTENANCE", tableName: "settings", newData: { maintenanceMode: await getMaintenanceMode() }, ipAddress: req.ip },
  });
  res.json({ enabled: await getMaintenanceMode() });
});

// ==================== Site Content ====================

router.get("/site-content", async (req, res) => {
  try {
    res.json(await getSiteContent());
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/site-content", async (req, res) => {
  try {
    const data = await setSiteContent(req.body);
    await prisma.auditLog.create({
      data: { userId: req.user.id, action: "UPDATE_SITE_CONTENT", tableName: "settings", newData: req.body, ipAddress: req.ip },
    });
    res.json({ success: true, data });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==================== Content Moderation ====================

router.get("/content/reported", async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (status) where.status = status;
    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where, skip, take: parseInt(limit),
        include: {
          reporter: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.report.count({ where }),
    ]);
    const enriched = await Promise.all(reports.map(async (r) => {
      let target = null;
      if (r.targetType === "listing") {
        target = await prisma.franchiseListing.findUnique({ where: { id: r.targetId }, select: { id: true, title: true } });
      } else if (r.targetType === "company") {
        target = await prisma.company.findUnique({ where: { id: r.targetId }, select: { id: true, name: true } });
      } else if (r.targetType === "user") {
        target = await prisma.user.findUnique({ where: { id: r.targetId }, select: { id: true, name: true, email: true } });
      }
      return { ...r, target };
    }));
    res.json({ reports: enriched, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/content/:type/:id/hide", async (req, res) => {
  try {
    const { type, id } = req.params;
    if (type === "listing") {
      await prisma.franchiseListing.update({ where: { id }, data: { status: "inactive" } });
    } else if (type === "company") {
      await prisma.company.update({ where: { id }, data: { status: "suspended" } });
    }
    await prisma.auditLog.create({
      data: { userId: req.user.id, action: `HIDE_${type.toUpperCase()}`, tableName: type === "listing" ? "franchise_listings" : "companies", recordId: id, ipAddress: req.ip },
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/content/:type/:id/show", async (req, res) => {
  try {
    const { type, id } = req.params;
    if (type === "listing") {
      await prisma.franchiseListing.update({ where: { id }, data: { status: "active" } });
    } else if (type === "company") {
      await prisma.company.update({ where: { id }, data: { status: "active" } });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Admin route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
