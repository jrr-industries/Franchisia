import { useEffect, useState, useRef, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import useSocketStore from "../../store/socketStore";
import { getSocket } from "../../lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import {
  Eye, Users, Briefcase, MessageSquare, TrendingUp, Calendar,
  ArrowRight, Clock, Bell, ChevronRight, Star, Bookmark,
  CheckCircle, UserPlus, Building2, BarChart3, Activity,
  Zap, Heart, DollarSign, MapPin, Award, Target, LogIn,
  ExternalLink, Share2, Trash2, X, MoreHorizontal, AlertCircle,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import { SkeletonBar, SkeletonCircle } from "../../components/ui/Skeleton";
import {
  useStats, useAnalytics, useActivities, useMeetings,
  useNotifications, useRecommendedCompanies, useRecommendedOpportunities,
  usePeopleYouMayKnow, useRecentMessages, useSavedListings, useTasks,
  useMarkNotificationRead, useMarkAllNotificationsRead, useDashboardPrefetch,
} from "../../hooks/useDashboard";

const statConfig = [
  { key: "profileViews", label: "Profile Views", icon: Eye, color: "#8B5CF6", bg: "#EDE9FE", suffix: "total" },
  { key: "connections", label: "Connections", icon: Users, color: "#2563EB", bg: "#DBEAFE", suffix: "connections" },
  { key: "applications", label: "Applications", icon: Briefcase, color: "#F59E0B", bg: "#FEF3C7", suffix: "applied" },
  { key: "messages", label: "Messages", icon: MessageSquare, color: "#10B981", bg: "#D1FAE5", suffix: "unread" },
  { key: "followers", label: "Followers", icon: Heart, color: "#EC4899", bg: "#FCE7F3", suffix: "followers" },
  { key: "savedListings", label: "Saved Listings", icon: Bookmark, color: "#8B5CF6", bg: "#EDE9FE", suffix: "saved" },
  { key: "notifications", label: "Notifications", icon: Bell, color: "#F59E0B", bg: "#FEF3C7", suffix: "unread" },
  { key: "companiesFollowing", label: "Companies Following", icon: Building2, color: "#06B6D4", bg: "#CFFAFE", suffix: "following" },
  { key: "opportunityViews", label: "Opportunity Views", icon: TrendingUp, color: "#F97316", bg: "#FFEDD5", suffix: "views" },
];

function StatSkeleton() {
  return (
    <Card hover={false} padding="14px">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <SkeletonCircle size={38} style={{ borderRadius: 10 }} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <SkeletonBar width="70%" height={11} style={{ marginBottom: 6 }} />
          <SkeletonBar width="40%" height={20} />
        </div>
      </div>
    </Card>
  );
}

function ActivitySkeleton() {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
      <SkeletonCircle size={32} style={{ borderRadius: 8, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <SkeletonBar width="80%" height={13} style={{ marginBottom: 4 }} />
        <SkeletonBar width="30%" height={11} />
      </div>
    </div>
  );
}

const StatCard = memo(({ cfg, value }) => (
  <Card hover={false} padding="14px">
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", color: cfg.color, flexShrink: 0 }}>
        <cfg.icon size={18} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500 }}>{cfg.label}</p>
        <p style={{ fontSize: 20, fontWeight: 700 }}>{value ?? 0}</p>
      </div>
    </div>
  </Card>
));

const SectionHeader = memo(({ title, link, onLinkClick }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
    <h2 style={{ fontSize: 18, fontWeight: 600 }}>{title}</h2>
    {link && (
      <button onClick={onLinkClick} style={{ color: "var(--primary)", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 4, textDecoration: "none", background: "none", border: "none", cursor: "pointer" }}>
        View All <ChevronRight size={14} />
      </button>
    )}
  </div>
));

const ActivityItem = memo(({ activity }) => {
  const Icon = activity.type === "connection" ? UserPlus : activity.type === "application" ? Briefcase : activity.type === "message" ? MessageSquare : Bell;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--primary)", fontSize: 12 }}>
        <Icon size={14} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, lineHeight: 1.4 }}>{activity.body || activity.title || `${activity.type} activity`}</p>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{activity.createdAt ? timeAgo(new Date(activity.createdAt)) : ""}</span>
      </div>
    </div>
  );
});

const MeetingItem = memo(({ meeting, onRespond }) => (
  <div style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", flexShrink: 0 }}>
        <Calendar size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600 }}>{meeting.title}</p>
        <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{meeting.startTime ? new Date(meeting.startTime).toLocaleDateString() + " " + new Date(meeting.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</p>
      </div>
    </div>
    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
      <Button size="sm" onClick={() => onRespond(meeting.id, "accept")} style={{ padding: "3px 10px", fontSize: 11 }}>Accept</Button>
      <Button size="sm" variant="ghost" onClick={() => onRespond(meeting.id, "decline")} style={{ padding: "3px 10px", fontSize: 11, color: "var(--danger)" }}>Decline</Button>
    </div>
  </div>
));

const NotificationItem = memo(({ notification, onRead }) => (
  <div style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border)", cursor: "pointer" }} onClick={() => !notification.isRead && onRead(notification.id)}>
    <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: notification.isRead ? "transparent" : "var(--primary)", flexShrink: 0, marginTop: 5 }} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: 13, color: notification.isRead ? "var(--text-secondary)" : "var(--text)", fontWeight: notification.isRead ? 400 : 500, lineHeight: 1.4 }}>{notification.body || notification.title}</p>
      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{notification.createdAt ? timeAgo(new Date(notification.createdAt)) : ""}</span>
    </div>
  </div>
));

const RecommendCompanyItem = memo(({ company, onFollow, onView }) => (
  <div style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
    {company.logoUrl ? <img src={company.logoUrl} alt="" style={{ width: 40, height: 40, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} /> :
      <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "var(--primary)", flexShrink: 0 }}>{company.name?.[0]}</div>}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontWeight: 600, fontSize: 13 }}>{company.name}</span>
        {company.isVerified && <Badge variant="success" style={{ fontSize: 9, padding: "1px 6px" }}>✓</Badge>}
      </div>
      <p style={{ fontSize: 11, color: "var(--text-secondary)" }}>{company.industry}</p>
      <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
        <Button size="sm" variant={company.isFollowing ? "secondary" : "primary"} onClick={() => onFollow(company.id)} style={{ padding: "2px 8px", fontSize: 11 }}>
          {company.isFollowing ? "Following" : "Follow"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onView(company.slug || company.id)} style={{ padding: "2px 8px", fontSize: 11 }}>View</Button>
      </div>
    </div>
  </div>
));

const OpportunityItem = memo(({ opportunity, onApply, onBookmark }) => (
  <div style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
    <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", color: "#D97706", flexShrink: 0 }}>
      <Zap size={18} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontWeight: 600, fontSize: 13 }}>{opportunity.title}</p>
      <p style={{ fontSize: 11, color: "var(--text-secondary)" }}>{opportunity.company?.name}</p>
      <div style={{ display: "flex", gap: 8, marginTop: 4, fontSize: 11, color: "var(--text-muted)", flexWrap: "wrap" }}>
        {opportunity.investmentMin && <span><DollarSign size={10} style={{ display: "inline" }} /> {formatCurrency(opportunity.investmentMin)}-{formatCurrency(opportunity.investmentMax)}</span>}
        {opportunity.roiPercentage && <span style={{ color: "var(--accent)" }}>{opportunity.roiPercentage}% ROI</span>}
        {opportunity.location && <span><MapPin size={10} style={{ display: "inline" }} /> {opportunity.location}</span>}
      </div>
      <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
        <Button size="sm" onClick={() => onApply(opportunity.slug || opportunity.id)} style={{ padding: "2px 8px", fontSize: 11 }}>Apply</Button>
        <Button size="sm" variant="ghost" onClick={() => onBookmark(opportunity.id)} style={{ padding: "2px 8px", fontSize: 11 }}>
          <Bookmark size={12} />
        </Button>
      </div>
    </div>
  </div>
));

const PeopleItem = memo(({ person, onConnect }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
    <Avatar name={person.name} src={person.image} size={36} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontWeight: 600, fontSize: 13 }}>{person.name}</p>
      <p style={{ fontSize: 11, color: "var(--text-secondary)" }}>{person.headline || person.role}</p>
      {person.mutualConnectionCount > 0 && <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{person.mutualConnectionCount} mutual</p>}
    </div>
    <Button size="sm" variant="outline" style={{ padding: "3px 8px", fontSize: 11, flexShrink: 0 }} onClick={() => onConnect(person.id)}>
      <UserPlus size={12} /> Connect
    </Button>
  </div>
));

const RecentMessageItem = memo(({ conversation, userId, onClick }) => {
  const other = conversation.participants?.find((p) => p.userId !== userId)?.user || conversation.participants?.[0]?.user;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border)", cursor: "pointer" }} onClick={onClick}>
      <Avatar name={other?.name} src={other?.image} size={32} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
          {other?.name || "Unknown"}
          {conversation.unreadCount > 0 && <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--primary)", display: "inline-block" }} />}
        </p>
        <p style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{conversation.lastMessage?.content || conversation.lastMessage || "No messages yet"}</p>
      </div>
    </div>
  );
});

const SavedListingItem = memo(({ bookmark, onView, onRemove }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
    <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#FCE7F3", display: "flex", alignItems: "center", justifyContent: "center", color: "#DB2777", flexShrink: 0 }}>
      <Heart size={16} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontWeight: 600, fontSize: 13 }}>{bookmark.listing?.title}</p>
      <p style={{ fontSize: 11, color: "var(--text-secondary)" }}>{bookmark.listing?.company?.name}</p>
    </div>
    <div style={{ display: "flex", gap: 4 }}>
      <Button size="sm" variant="ghost" onClick={() => onView(bookmark.listing?.slug || bookmark.listing?.id)} style={{ padding: "2px 6px", fontSize: 11 }}><ExternalLink size={12} /></Button>
      <Button size="sm" variant="ghost" onClick={() => onRemove(bookmark.id)} style={{ padding: "2px 6px", fontSize: 11, color: "var(--danger)" }}><Trash2 size={12} /></Button>
    </div>
  </div>
));

const TaskItem = memo(({ task, onToggle }) => {
  const priorityColors = { high: "#DC2626", medium: "#F59E0B", low: "#10B981" };
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border)", opacity: task.completed ? 0.5 : 1 }}>
      <input type="checkbox" checked={task.completed} onChange={() => onToggle(task.id)} style={{ marginTop: 3, accentColor: "var(--primary)", width: 16, height: 16, cursor: "pointer" }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 500, textDecoration: task.completed ? "line-through" : "none" }}>{task.task}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
          {task.deadline && <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }}><Clock size={11} /> {task.deadline}</span>}
          <span style={{ fontSize: 10, fontWeight: 600, color: priorityColors[task.priority], backgroundColor: `${priorityColors[task.priority]}15`, padding: "1px 6px", borderRadius: 100 }}>{task.priority}</span>
        </div>
      </div>
    </div>
  );
});

function AnalyticsChartLazy({ children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } }, { rootMargin: "200px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return <div ref={ref}>{visible ? children : <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>Scroll to load analytics...</div>}</div>;
}

export default function DashboardHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isConnected = useSocketStore((s) => s.isConnected);
  const queryClient = useQueryClient();
  const prefetchDashboard = useDashboardPrefetch();

  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: activities = [] } = useActivities();
  const { data: meetings = [] } = useMeetings();
  const { data: notifData } = useNotifications();
  const { data: recommendedCompanies = [] } = useRecommendedCompanies();
  const { data: opportunities = [] } = useRecommendedOpportunities();
  const { data: people = [] } = usePeopleYouMayKnow();
  const { data: recentMessages = [] } = useRecentMessages();
  const { data: savedListings } = useSavedListings();
  const { data: tasks = [] } = useTasks();

  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const [creatingCompany, setCreatingCompany] = useState(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState("monthly");

  const { data: analytics, isLoading: analyticsLoading } = useAnalytics(analyticsPeriod);

  useEffect(() => {
    prefetchDashboard();
  }, [prefetchDashboard]);

  useEffect(() => {
    if (notifData?.unreadCount !== undefined) {
      useSocketStore.getState().updateNotificationCount(notifData.unreadCount);
    }
  }, [notifData]);

  useEffect(() => {
    if (stats?.messages !== undefined) {
      useSocketStore.getState().setUnreadCount(stats.messages);
    }
  }, [stats]);

  useEffect(() => {
    if (recentMessages.length > 0) {
      const store = useSocketStore.getState();
      store.setConversations(recentMessages);
    }
  }, [recentMessages]);

  useEffect(() => {
    if (!isConnected) return;
    const socket = getSocket();
    if (!socket) return;

    const invalidate = (...keys) => queryClient.invalidateQueries({ queryKey: keys });

    socket.on("new-message", () => { invalidate("dashboard", "recent-messages"); invalidate("dashboard", "stats"); invalidate("messages", "conversations"); });
    socket.on("notification", () => invalidate("dashboard", "notifications"));
    socket.on("company-created", () => { invalidate("dashboard", "recommended-companies"); invalidate("dashboard", "stats"); });
    socket.on("company-updated", () => invalidate("dashboard", "recommended-companies"));
    socket.on("company-verified", () => invalidate("dashboard", "recommended-companies"));
    socket.on("connection-updated", () => { invalidate("dashboard", "stats"); invalidate("dashboard", "people"); });
    socket.on("stats-updated", () => invalidate("dashboard", "stats"));
    socket.on("listing-updated", () => invalidate("dashboard", "recommended-opportunities"));
    socket.on("listing-created", () => invalidate("dashboard", "recommended-opportunities"));
    socket.on("listing-deleted", () => invalidate("dashboard", "recommended-opportunities"));
    socket.on("bookmark-updated", () => invalidate("dashboard", "saved-listings"));
    socket.on("application-updated", () => { invalidate("dashboard", "stats"); invalidate("dashboard", "activity"); });
    socket.on("dashboard-refresh", () => queryClient.invalidateQueries({ queryKey: ["dashboard"] }));

    return () => { socket.off("new-message"); socket.off("notification"); socket.off("company-created"); socket.off("company-updated"); socket.off("company-verified"); socket.off("connection-updated"); socket.off("stats-updated"); socket.off("listing-updated"); socket.off("listing-created"); socket.off("listing-deleted"); socket.off("bookmark-updated"); socket.off("application-updated"); socket.off("dashboard-refresh"); };
  }, [isConnected, queryClient]);

  const needsOnboarding = user && !["verified", "pending_admin_review"].includes(user.accountStatus);
  const statusBanners = {
    pending_email_verification: { icon: Clock, msg: "Please verify your email address", to: "/verify-email", color: "#F59E0B", bg: "#FEF3C7" },
    pending_phone_verification: { icon: Clock, msg: "Please verify your phone number", to: "/verify-phone", color: "#F59E0B", bg: "#FEF3C7" },
    pending_profile_completion: { icon: Clock, msg: "Complete your profile to get started", to: "/onboarding/select-role", color: "#F59E0B", bg: "#FEF3C7" },
    rejected: { icon: Clock, msg: "Your verification was rejected. Contact support.", to: "/account-status", color: "#DC2626", bg: "#FEE2E2" },
    need_more_information: { icon: Clock, msg: "Additional information required for verification", to: "/account-status", color: "#F59E0B", bg: "#FEF3C7" },
  };

  const handleCreateCompany = async () => {
    setCreatingCompany(true);
    try {
      const res = await fetch('/api/onboarding/create-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          companyName: user?.companyName || user?.brandName || `${user?.name || 'Unknown'}'s Company`,
          industry: user?.preferredIndustry || user?.industries?.[0] || 'Other',
          companyDescription: user?.companyDescription || null,
          website: user?.website || null,
          businessEmail: user?.businessEmail || null,
          businessAddress: typeof user?.location === 'string' ? user.location : null,
        }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        const err = await res.json().catch(() => ({ error: 'Failed to create company' }));
        alert(err.error || 'Failed to create company');
      }
    } catch {
      alert('Network error');
    } finally {
      setCreatingCompany(false);
    }
  };

  const handleFollowCompany = useCallback(async (companyId) => {
    try {
      await fetch(`/api/follow/company/${companyId}`, { method: "POST", credentials: "include" });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "recommended-companies"] });
    } catch {}
  }, [queryClient]);

  const handleToggleBookmark = useCallback(async (listingId) => {
    try {
      await fetch("/api/bookmarks", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ listingId }) });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "saved-listings"] });
    } catch {}
  }, [queryClient]);

  const handleRemoveSaved = useCallback(async (id) => {
    try {
      await fetch(`/api/bookmarks/${id}`, { method: "DELETE", credentials: "include" });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "saved-listings"] });
    } catch {}
  }, [queryClient]);

  const handleMeetingRespond = useCallback(async (meetingId, action) => {
    try {
      await fetch(`/api/dashboard/meetings/${meetingId}/respond`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "meetings"] });
    } catch {}
  }, [queryClient]);

  const handleToggleTask = useCallback((taskId) => {
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, completed: !t.completed } : t));
  }, []);

  const handleNavigate = useCallback((path) => navigate(path), [navigate]);

  const s = stats || {};

  return (
    <div>
      {user?.needsCompany && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderRadius: "var(--radius-sm)", backgroundColor: "#FEF3C7", color: "#92400E", marginBottom: 20, fontSize: 14, flexWrap: "wrap" }}>
          <AlertCircle size={20} />
          <span style={{ flex: 1, fontWeight: 500 }}>You need to register a company to access all features.</span>
          <button
            onClick={handleCreateCompany}
            disabled={creatingCompany}
            style={{
              padding: "8px 16px", borderRadius: 6, border: "none",
              backgroundColor: "#F59E0B", color: "#fff", cursor: "pointer",
              fontSize: 13, fontWeight: 600, opacity: creatingCompany ? 0.7 : 1,
            }}
          >
            {creatingCompany ? "Creating..." : "Complete Company Registration"}
          </button>
        </div>
      )}

      {needsOnboarding && user.accountStatus !== "pending_admin_review" && statusBanners[user.accountStatus] && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderRadius: "var(--radius-sm)", backgroundColor: statusBanners[user.accountStatus].bg, color: statusBanners[user.accountStatus].color, marginBottom: 20, fontSize: 14 }}>
          <Clock size={20} />
          <span style={{ flex: 1, fontWeight: 500 }}>{statusBanners[user.accountStatus].msg}</span>
          <a href={statusBanners[user.accountStatus].to} style={{ color: statusBanners[user.accountStatus].color, fontWeight: 600, textDecoration: "underline" }}>Fix it</a>
        </div>
      )}

      {user?.accountStatus === "pending_admin_review" && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderRadius: "var(--radius-sm)", backgroundColor: "#EDE9FE", color: "#8B5CF6", marginBottom: 20, fontSize: 14 }}>
          <Clock size={20} /><span style={{ flex: 1, fontWeight: 500 }}>Your account is under admin review.</span>
          <a href="/account-status" style={{ color: "#8B5CF6", fontWeight: 600, textDecoration: "underline" }}>Check Status</a>
        </div>
      )}

      {user?.verified && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderRadius: "var(--radius-sm)", backgroundColor: "#D1FAE5", color: "#059669", marginBottom: 20, fontSize: 14 }}>
          <CheckCircle size={20} /><span style={{ flex: 1, fontWeight: 500 }}>Verified Account — Full access to all platform features.</span>
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Welcome back, {user?.name || "User"}!</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>Here's your complete franchise overview.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
        {statsLoading ? statConfig.map((cfg) => <StatSkeleton key={cfg.key} />) : statConfig.map((cfg) => (
          <StatCard key={cfg.key} cfg={cfg} value={s[cfg.key]} />
        ))}
      </div>

      <AnalyticsChartLazy>
        <Card hover={false} style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>Analytics</h2>
            <div style={{ display: "flex", gap: 8 }}>
              {["weekly", "monthly", "yearly"].map((p) => (
                <button key={p} onClick={() => setAnalyticsPeriod(p)} style={{ padding: "4px 12px", fontSize: 12, fontWeight: 600, borderRadius: 100, border: analyticsPeriod === p ? "2px solid var(--primary)" : "1px solid var(--border)", background: analyticsPeriod === p ? "var(--primary-light)" : "transparent", color: analyticsPeriod === p ? "var(--primary)" : "var(--text-muted)", cursor: "pointer" }}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {analyticsLoading ? (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading analytics...</div>
          ) : (
            <>
              <div style={{ height: 200, display: "flex", alignItems: "flex-end", gap: 8, padding: "0 4px" }}>
                {(analytics?.data || []).length > 0 ? analytics.data.map((d, i) => {
                  const maxVal = Math.max(1, ...analytics.data.map((x) => Math.max(x.applications || 0, x.messages || 0, x.followers || 0)));
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, height: "100%", justifyContent: "flex-end" }}>
                      <div style={{ display: "flex", gap: 2, width: "100%", alignItems: "flex-end", height: 160 }}>
                        <div style={{ flex: 1, height: `${((d.applications || 0) / maxVal) * 100}%`, backgroundColor: "var(--primary)", borderRadius: "3px 3px 0 0", minHeight: 2, opacity: 0.8 }} title={`Apps: ${d.applications || 0}`} />
                        <div style={{ flex: 1, height: `${((d.messages || 0) / maxVal) * 100}%`, backgroundColor: "var(--accent)", borderRadius: "3px 3px 0 0", minHeight: 2, opacity: 0.8 }} title={`Messages: ${d.messages || 0}`} />
                        <div style={{ flex: 1, height: `${((d.followers || 0) / maxVal) * 100}%`, backgroundColor: "#EC4899", borderRadius: "3px 3px 0 0", minHeight: 2, opacity: 0.8 }} title={`Followers: ${d.followers || 0}`} />
                      </div>
                      <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{d.date?.length > 7 ? d.date.slice(5) : d.date}</span>
                    </div>
                  );
                }) : <div style={{ width: "100%", textAlign: "center", padding: 40, color: "var(--text-muted)" }}>No analytics data yet</div>}
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                {[{ label: "Applications", color: "var(--primary)" }, { label: "Messages", color: "var(--accent)" }, { label: "Followers", color: "#EC4899" }].map((l) => (
                  <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: l.color }} />{l.label}
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </AnalyticsChartLazy>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, marginBottom: 24 }}>
        <Card hover={false}>
          <SectionHeader title="Recent Activity" link="/discover" />
          {activities.length > 0 ? activities.slice(0, 6).map((a) => (
            <ActivityItem key={a.id} activity={a} />
          )) : <p style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No recent activity</p>}
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card hover={false} padding="16px">
            <SectionHeader title="Upcoming Meetings" />
            {meetings.length > 0 ? meetings.slice(0, 3).map((m) => (
              <MeetingItem key={m.id} meeting={m} onRespond={handleMeetingRespond} />
            )) : <p style={{ padding: 12, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No upcoming meetings</p>}
          </Card>

          <Card hover={false} padding="16px">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600 }}>Notifications</h2>
              {(notifData?.unreadCount || 0) > 0 && <button onClick={() => markAllRead.mutate()} style={{ fontSize: 11, color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Mark all read</button>}
            </div>
            {(notifData?.notifications || []).length > 0 ? notifData.notifications.slice(0, 3).map((n) => (
              <NotificationItem key={n.id} notification={n} onRead={(id) => markRead.mutate(id)} />
            )) : <p style={{ padding: 8, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No notifications</p>}
          </Card>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 24 }}>
        <Card hover={false}>
          <SectionHeader title="Recommended Companies" link="/companies" />
          {recommendedCompanies.length > 0 ? recommendedCompanies.slice(0, 3).map((c) => (
            <RecommendCompanyItem key={c.id} company={c} onFollow={handleFollowCompany} onView={(slug) => navigate(`/company/${slug}`)} />
          )) : <p style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No franchisor companies available.</p>}
        </Card>

        <Card hover={false}>
          <SectionHeader title="Recommended Opportunities" link="/discover" />
          {opportunities.length > 0 ? opportunities.slice(0, 3).map((o) => (
            <OpportunityItem key={o.id} opportunity={o} onApply={(slug) => navigate(`/listing/${slug}`)} onBookmark={handleToggleBookmark} />
          )) : <p style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No opportunities available yet.</p>}
        </Card>

        <Card hover={false}>
          <SectionHeader title="People You May Know" />
          {people.length > 0 ? people.slice(0, 3).map((p) => (
            <PeopleItem key={p.id} person={p} onConnect={async (id) => { await fetch(`/api/follow/user/${id}`, { method: "POST", credentials: "include" }); queryClient.invalidateQueries({ queryKey: ["dashboard", "people"] }); }} />
          )) : <p style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No suggestions yet.</p>}
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        <Card hover={false}>
          <SectionHeader title="Recent Messages" link="/messages" />
          {recentMessages.length > 0 ? recentMessages.slice(0, 3).map((c) => (
            <RecentMessageItem key={c.id} conversation={c} userId={user?.id} onClick={() => navigate("/messages")} />
          )) : <p style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No conversations yet.</p>}
        </Card>

        <Card hover={false}>
          <SectionHeader title="Saved Listings" link="/saved-listings" />
          {(savedListings?.bookmarks || []).length > 0 ? savedListings.bookmarks.slice(0, 3).map((b) => (
            <SavedListingItem key={b.id} bookmark={b} onView={(slug) => navigate(`/listing/${slug}`)} onRemove={handleRemoveSaved} />
          )) : <p style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No saved listings yet.</p>}
        </Card>

        <Card hover={false}>
          <SectionHeader title="Tasks" />
          {tasks.length > 0 ? tasks.map((t) => (
            <TaskItem key={t.id} task={t} onToggle={handleToggleTask} />
          )) : <p style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No tasks. You're all caught up!</p>}
        </Card>
      </div>
    </div>
  );
}

function timeAgo(date) {
  const sec = Math.floor((Date.now() - date) / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d < 30) return `${d}d ago`;
  return date.toLocaleDateString();
}

function formatCurrency(val) {
  const n = Number(val);
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}
