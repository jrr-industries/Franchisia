import { Router } from "express";
import prisma from "../prisma.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

function getDateRange(start, end) {
  const now = new Date();
  const from = start ? new Date(start) : new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const to = end ? new Date(end) : now;
  return { start: from, end: to };
}

router.get("/stats", async (req, res) => {
  try {
    const userId = req.user.id;

    const [
      connections,
      applications,
      followers,
      savedListings,
      notifications,
      companiesFollowing,
    ] = await Promise.all([
      prisma.connection.count({ where: { followingId: userId } }),
      prisma.application.count({ where: { applicantId: userId } }),
      req.user.followerCount,
      prisma.bookmark.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
      prisma.companyFollower.count({ where: { userId } }),
    ]);

    const userCompanies = await prisma.company.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });
    const companyIds = userCompanies.map((c) => c.id);

    const [
      opportunityViews,
      totalOpportunities,
      openOpportunities,
      closedOpportunities,
    ] = companyIds.length > 0 ? await Promise.all([
      prisma.franchiseListing.aggregate({
        where: { companyId: { in: companyIds } },
        _sum: { viewCount: true },
      }).then((r) => r._sum.viewCount || 0),
      prisma.franchiseListing.count({ where: { companyId: { in: companyIds } } }),
      prisma.franchiseListing.count({ where: { companyId: { in: companyIds }, status: "active" } }),
      prisma.franchiseListing.count({ where: { companyId: { in: companyIds }, status: "closed" } }),
    ]) : [0, 0, 0, 0];

    const conversationIds = (
      await prisma.conversationParticipant.findMany({
        where: { userId },
        select: { conversationId: true },
      })
    ).map((p) => p.conversationId);

    const messages = conversationIds.length > 0
      ? await prisma.message.count({
          where: {
            conversationId: { in: conversationIds },
            senderId: { not: userId },
            readAt: null,
          },
        })
      : 0;

    res.json({
      profileViews: 0,
      connections,
      applications,
      messages,
      followers,
      savedListings,
      notifications,
      companiesFollowing,
      opportunityViews,
      totalOpportunities,
      openOpportunities,
      closedOpportunities,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/analytics", async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = "monthly", startDate, endDate } = req.query;
    const { start, end } = getDateRange(startDate, endDate);
    const trunc = period === "weekly" ? "day" : period === "yearly" ? "year" : "month";

    const userCompanies = await prisma.company.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });
    const companyIds = userCompanies.map((c) => c.id);

    const conversationIds = (
      await prisma.conversationParticipant.findMany({
        where: { userId },
        select: { conversationId: true },
      })
    ).map((p) => p.conversationId);

    const [applications, messages, connections, listings] = await Promise.all([
      prisma.application.findMany({
        where: { applicantId: userId, createdAt: { gte: start, lte: end } },
        select: { createdAt: true },
      }),
      conversationIds.length > 0
        ? prisma.message.findMany({
            where: {
              conversationId: { in: conversationIds },
              senderId: { not: userId },
              createdAt: { gte: start, lte: end },
            },
            select: { createdAt: true },
          })
        : Promise.resolve([]),
      prisma.connection.findMany({
        where: { followingId: userId, createdAt: { gte: start, lte: end } },
        select: { createdAt: true },
      }),
      companyIds.length > 0
        ? prisma.franchiseListing.findMany({
            where: { companyId: { in: companyIds }, createdAt: { gte: start, lte: end } },
            select: { viewCount: true, createdAt: true },
          })
        : Promise.resolve([]),
    ]);

    const buckets = {};
    const cursor = new Date(start);
    const step = trunc === "year" ? { fn: "getFullYear", fmt: "%Y" } : { fn: "getMonth", fmt: "%Y-%m" };
    while (cursor <= end) {
      const key = trunc === "day"
        ? cursor.toISOString().slice(0, 10)
        : `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
      buckets[key] = { date: key, applications: 0, messages: 0, followers: 0, companyViews: 0 };
      if (trunc === "day") cursor.setDate(cursor.getDate() + 1);
      else if (trunc === "year") cursor.setFullYear(cursor.getFullYear() + 1);
      else cursor.setMonth(cursor.getMonth() + 1);
    }

    applications.forEach((a) => {
      const key = trunc === "day" ? a.createdAt.toISOString().slice(0, 10) : `${a.createdAt.getFullYear()}-${String(a.createdAt.getMonth() + 1).padStart(2, "0")}`;
      if (buckets[key]) buckets[key].applications++;
    });
    messages.forEach((m) => {
      const key = trunc === "day" ? m.createdAt.toISOString().slice(0, 10) : `${m.createdAt.getFullYear()}-${String(m.createdAt.getMonth() + 1).padStart(2, "0")}`;
      if (buckets[key]) buckets[key].messages++;
    });
    connections.forEach((c) => {
      const key = trunc === "day" ? c.createdAt.toISOString().slice(0, 10) : `${c.createdAt.getFullYear()}-${String(c.createdAt.getMonth() + 1).padStart(2, "0")}`;
      if (buckets[key]) buckets[key].followers++;
    });
    listings.forEach((l) => {
      const key = trunc === "day" ? l.createdAt.toISOString().slice(0, 10) : `${l.createdAt.getFullYear()}-${String(l.createdAt.getMonth() + 1).padStart(2, "0")}`;
      if (buckets[key]) buckets[key].companyViews += l.viewCount;
    });

    res.json({ series: Object.values(buckets) });
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/activity", async (req, res) => {
  try {
    const userId = req.user.id;

    const [connections, applications, messages, notifications] = await Promise.all([
      prisma.connection.findMany({
        where: { OR: [{ followerId: userId }, { followingId: userId }] },
        include: { follower: { select: { id: true, name: true, image: true } }, following: { select: { id: true, name: true, image: true } } },
      }),
      prisma.application.findMany({
        where: { applicantId: userId },
        include: { listing: { select: { id: true, title: true, slug: true } } },
      }),
      (async () => {
        const convIds = (await prisma.conversationParticipant.findMany({ where: { userId }, select: { conversationId: true } })).map((p) => p.conversationId);
        return convIds.length > 0
          ? prisma.message.findMany({
              where: { conversationId: { in: convIds }, senderId: { not: userId } },
              include: { sender: { select: { id: true, name: true, image: true } }, conversation: { select: { id: true } } },
            })
          : [];
      })(),
      prisma.notification.findMany({ where: { userId } }),
    ]);

    const activities = [
      ...connections.map((c) => ({
        id: c.id,
        type: "connection",
        data: c.followerId === userId ? { user: c.following } : { user: c.follower },
        createdAt: c.createdAt,
      })),
      ...applications.map((a) => ({
        id: a.id,
        type: "application",
        data: { listing: a.listing, status: a.status },
        createdAt: a.createdAt,
      })),
      ...messages.map((m) => ({
        id: m.id,
        type: "message",
        data: { sender: m.sender, conversationId: m.conversation.id, preview: m.content?.substring(0, 100) },
        createdAt: m.createdAt,
      })),
      ...notifications.map((n) => ({
        id: n.id,
        type: "notification",
        data: { title: n.title, body: n.body, notificationType: n.type, isRead: n.isRead },
        createdAt: n.createdAt,
      })),
    ];

    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ activities: activities.slice(0, 20) });
  } catch (error) {
    console.error("Dashboard activity error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/meetings", async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [meetings, total] = await Promise.all([
      prisma.meeting.findMany({
        where: { OR: [{ organizerId: userId }, { participants: { some: { userId } } }] },
        include: {
          organizer: { select: { id: true, name: true, image: true } },
          participants: {
            include: { user: { select: { id: true, name: true, image: true } } },
          },
        },
        skip,
        take: limit,
        orderBy: { startTime: "desc" },
      }),
      prisma.meeting.count({
        where: { OR: [{ organizerId: userId }, { participants: { some: { userId } } }] },
      }),
    ]);

    res.json({ meetings, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Dashboard meetings error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/meetings/:id/respond", async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { action, startTime, endTime, title } = req.body;

    if (!["accept", "decline", "join", "reschedule"].includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }

    const meeting = await prisma.meeting.findUnique({ where: { id } });
    if (!meeting) return res.status(404).json({ error: "Meeting not found" });

    if (action === "reschedule") {
      if (!startTime || !endTime) return res.status(400).json({ error: "startTime and endTime required for reschedule" });
      if (meeting.organizerId !== userId) {
        return res.status(403).json({ error: "Only organizer can reschedule" });
      }
      await prisma.meeting.update({
        where: { id },
        data: { startTime: new Date(startTime), endTime: new Date(endTime), ...(title ? { title } : {}) },
      });
      return res.json({ success: true });
    }

    const participant = await prisma.meetingParticipant.findUnique({
      where: { meetingId_userId: { meetingId: id, userId } },
    });
    if (!participant && action !== "join") {
      return res.status(404).json({ error: "You are not a participant" });
    }

    if (action === "accept") {
      await prisma.meetingParticipant.update({
        where: { meetingId_userId: { meetingId: id, userId } },
        data: { status: "accepted" },
      });
    } else if (action === "decline") {
      await prisma.meetingParticipant.update({
        where: { meetingId_userId: { meetingId: id, userId } },
        data: { status: "declined" },
      });
    } else if (action === "join") {
      await prisma.meetingParticipant.create({
        data: { meetingId: id, userId, status: "accepted" },
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Dashboard meetings respond error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/recommended-companies", async (req, res) => {
  try {
    const userId = req.user.id;

    const companies = await prisma.company.findMany({
      where: {
        status: "active",
        owner: { role: "franchisor", isActive: true },
        ownerId: { not: userId },
      },
      include: {
        owner: { select: { id: true, name: true, image: true } },
        _count: { select: { followers: true, listings: true } },
      },
      orderBy: { followerCount: "desc" },
      take: 10,
    });

    const companiesWithFollow = await Promise.all(
      companies.map(async (c) => {
        const follow = await prisma.companyFollower.findUnique({
          where: { userId_companyId: { userId, companyId: c.id } },
        });
        return { ...c, isFollowing: !!follow };
      })
    );

    res.json({ companies: companiesWithFollow });
  } catch (error) {
    console.error("Dashboard recommended companies error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/recommended-opportunities", async (req, res) => {
  try {
    const userId = req.user.id;

    const userCompanies = await prisma.company.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });
    const companyIds = userCompanies.map((c) => c.id);

    const listings = await prisma.franchiseListing.findMany({
      where: {
        status: "active",
        company: { status: "active" },
        ...(companyIds.length > 0 ? { companyId: { notIn: companyIds } } : {}),
      },
      include: {
        company: { select: { id: true, name: true, slug: true, logoUrl: true, isVerified: true } },
      },
      orderBy: { viewCount: "desc" },
      take: 10,
    });

    const listingsWithBookmark = await Promise.all(
      listings.map(async (l) => {
        const bookmark = await prisma.bookmark.findUnique({
          where: { userId_listingId: { userId, listingId: l.id } },
        });
        return { ...l, isBookmarked: !!bookmark };
      })
    );

    res.json({ opportunities: listingsWithBookmark });
  } catch (error) {
    console.error("Dashboard recommended opportunities error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/people-you-may-know", async (req, res) => {
  try {
    const userId = req.user.id;

    const existingConnections = await prisma.connection.findMany({
      where: { OR: [{ followerId: userId }, { followingId: userId }] },
      select: { followerId: true, followingId: true },
    });
    const connectedIds = new Set();
    existingConnections.forEach((c) => {
      connectedIds.add(c.followerId);
      connectedIds.add(c.followingId);
    });
    connectedIds.add(userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { industries: true, location: true, role: true },
    });

    const candidates = await prisma.user.findMany({
      where: {
        isActive: true,
        id: { notIn: [...connectedIds] },
      },
      select: {
        id: true, name: true, image: true, headline: true, role: true,
        location: true, industries: true, followerCount: true, createdAt: true,
      },
      take: 50,
    });

    const candidateIds = candidates.map((c) => c.id);

    const mutualCounts = candidateIds.length > 0
      ? await prisma.connection.groupBy({
          by: ["followerId", "followingId"],
          where: {
            OR: [
              { followerId: { in: candidateIds }, followingId: { in: [...connectedIds] } },
              { followingId: { in: candidateIds }, followerId: { in: [...connectedIds] } },
            ],
          },
          _count: true,
        })
      : [];

    const mutualMap = {};
    mutualCounts.forEach((m) => {
      const id = m.followerId === userId || connectedIds.has(m.followerId) ? m.followingId : m.followerId;
      if (candidateIds.includes(id)) {
        mutualMap[id] = (mutualMap[id] || 0) + m._count;
      }
    });

    const scored = candidates.map((c) => {
      let score = 0;
      if (user?.industries?.length && c.industries?.length) {
        const overlap = c.industries.filter((i) => user.industries.includes(i)).length;
        score += overlap * 10;
      }
      if (user?.location && c.location === user.location) score += 5;
      if (user?.role && c.role === user.role) score += 3;
      const mutualCount = mutualMap[c.id] || 0;
      score += mutualCount * 2;
      return { ...c, mutualConnectionCount: mutualCount, _score: score };
    });

    scored.sort((a, b) => b._score - a._score);
    const result = scored.slice(0, 10).map(({ _score, ...rest }) => rest);

    res.json({ users: result });
  } catch (error) {
    console.error("Dashboard people-you-may-know error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/recent-messages", async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, image: true, role: true, lastActiveAt: true } },
          },
        },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    });

    const enriched = await Promise.all(
      conversations.map(async (conv) => {
        const myParticipation = conv.participants.find((p) => p.user.id === userId);
        const lastReadAt = myParticipation?.lastReadAt || new Date(0);
        const unread = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            createdAt: { gt: lastReadAt },
          },
        });
        const lastMsg = conv.messages?.[0] || null;
        return { ...conv, unreadCount: unread, lastMessage: lastMsg };
      })
    );

    res.json({ conversations: enriched });
  } catch (error) {
    console.error("Dashboard recent messages error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/saved-listings", async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({
        where: { userId },
        include: {
          listing: {
            include: {
              company: { select: { id: true, name: true, slug: true, logoUrl: true, isVerified: true } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.bookmark.count({ where: { userId } }),
    ]);

    res.json({ bookmarks, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Dashboard saved listings error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/saved-listings/:id", async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const bookmark = await prisma.bookmark.findUnique({ where: { id } });
    if (!bookmark) return res.status(404).json({ error: "Bookmark not found" });
    if (bookmark.userId !== userId) return res.status(403).json({ error: "Not authorized" });

    await prisma.bookmark.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error("Dashboard delete saved listing error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/tasks", async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            documents: true,
            companies: true,
            notifications: true,
          },
        },
      },
    });

    const submittedApps = await prisma.application.count({
      where: { applicantId: userId, status: "submitted" },
    });

    const incomingApps = await prisma.application.count({
      where: { listing: { company: { ownerId: userId } }, status: "submitted" },
    });

    const unreadMessages = await prisma.message.count({
      where: {
        conversation: { participants: { some: { userId } } },
        senderId: { not: userId },
        readAt: null,
      },
    });

    const tasks = [];

    if (!user.headline || !user.bio) {
      tasks.push({ id: "complete-profile", task: "Complete your profile", deadline: "7 days", priority: "high", completed: false });
    }
    if (!user.emailVerified) {
      tasks.push({ id: "verify-email", task: "Verify your email", deadline: "3 days", priority: "high", completed: false });
    }
    if (user.role === "franchisor" && user._count.companies === 0) {
      tasks.push({ id: "create-company", task: "Create your company", deadline: "14 days", priority: "medium", completed: false });
    }
    if (user._count.documents === 0) {
      tasks.push({ id: "upload-documents", task: "Upload identity documents", deadline: "14 days", priority: "medium", completed: false });
    }
    if (incomingApps > 0) {
      tasks.push({ id: "review-applications", task: "Review new applications", deadline: "5 days", priority: "medium", completed: false });
    }
    if (unreadMessages > 0) {
      tasks.push({ id: "unread-messages", task: "You have unread messages", deadline: "1 day", priority: "medium", completed: false });
    }
    if (!user.onboardingCompleted) {
      tasks.push({ id: "complete-onboarding", task: "Complete onboarding", deadline: "3 days", priority: "high", completed: false });
    }

    res.json({ tasks });
  } catch (error) {
    console.error("Dashboard tasks error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
