import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import useSocketStore from "../../store/socketStore";
import { getSocket } from "../../lib/socket";
import {
  Eye, Users, Briefcase, MessageSquare, TrendingUp, Calendar,
  ArrowRight, Clock, Bell, ChevronRight, Star, Bookmark,
  CheckCircle, UserPlus, Building2, BarChart3, Activity,
  Zap, Heart, DollarSign, MapPin, Award, Target, LogIn,
  ExternalLink, Share2, Trash2, X, MoreHorizontal,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";

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

export default function DashboardHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isConnected = useSocketStore((s) => s.isConnected);

  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState({ period: "monthly", data: [] });
  const [activities, setActivities] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notifUnread, setNotifUnread] = useState(0);
  const [recommendedCompanies, setRecommendedCompanies] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [people, setPeople] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [savedListings, setSavedListings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [statsRes, analyticsRes, activityRes, meetingsRes, notifRes, companiesRes, oppsRes, peopleRes, messagesRes, savedRes, tasksRes] = await Promise.all([
        fetch("/api/dashboard/stats", { credentials: "include" }),
        fetch("/api/dashboard/analytics?period=monthly", { credentials: "include" }),
        fetch("/api/dashboard/activity", { credentials: "include" }),
        fetch("/api/dashboard/meetings?limit=5", { credentials: "include" }),
        fetch("/api/notifications?limit=5", { credentials: "include" }),
        fetch("/api/dashboard/recommended-companies", { credentials: "include" }),
        fetch("/api/dashboard/recommended-opportunities", { credentials: "include" }),
        fetch("/api/dashboard/people-you-may-know", { credentials: "include" }),
        fetch("/api/dashboard/recent-messages", { credentials: "include" }),
        fetch("/api/dashboard/saved-listings?limit=3", { credentials: "include" }),
        fetch("/api/dashboard/tasks", { credentials: "include" }),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      if (activityRes.ok) setActivities(await activityRes.json());
      if (meetingsRes.ok) setMeetings(await meetingsRes.json());
      if (notifRes.ok) { const d = await notifRes.json(); setNotifications(d.notifications || []); setNotifUnread(d.unreadCount || 0); }
      if (companiesRes.ok) setRecommendedCompanies(await companiesRes.json());
      if (oppsRes.ok) setOpportunities(await oppsRes.json());
      if (peopleRes.ok) setPeople(await peopleRes.json());
      if (messagesRes.ok) setRecentMessages(await messagesRes.json());
      if (savedRes.ok) setSavedListings(await savedRes.json());
      if (tasksRes.ok) setTasks(await tasksRes.json());
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (!isConnected) return;
    const socket = getSocket();
    if (!socket) return;

    const refresh = () => fetchAll();

    socket.on("new-message", refresh);
    socket.on("notification", refresh);
    socket.on("company-created", refresh);
    socket.on("company-updated", refresh);
    socket.on("company-verified", refresh);
    socket.on("connection-updated", refresh);
    socket.on("stats-updated", refresh);

    return () => {
      socket.off("new-message", refresh);
      socket.off("notification", refresh);
      socket.off("company-created", refresh);
      socket.off("company-updated", refresh);
      socket.off("company-verified", refresh);
      socket.off("connection-updated", refresh);
      socket.off("stats-updated", refresh);
    };
  }, [isConnected, fetchAll]);

  const needsOnboarding = user && !["verified", "pending_admin_review"].includes(user.accountStatus);
  const statusBanners = {
    pending_email_verification: { icon: Clock, msg: "Please verify your email address", to: "/verify-email", color: "#F59E0B", bg: "#FEF3C7" },
    pending_phone_verification: { icon: Clock, msg: "Please verify your phone number", to: "/verify-phone", color: "#F59E0B", bg: "#FEF3C7" },
    pending_profile_completion: { icon: Clock, msg: "Complete your profile to get started", to: "/select-role", color: "#F59E0B", bg: "#FEF3C7" },
    rejected: { icon: Clock, msg: "Your verification was rejected. Contact support.", to: "/account-status", color: "#DC2626", bg: "#FEE2E2" },
    need_more_information: { icon: Clock, msg: "Additional information required for verification", to: "/account-status", color: "#F59E0B", bg: "#FEF3C7" },
  };

  const SectionHeader = ({ title, link, onLinkClick }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600 }}>{title}</h2>
      {link && (
        <button onClick={onLinkClick || (() => navigate(link))} style={{ color: "var(--primary)", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 4, textDecoration: "none", background: "none", border: "none", cursor: "pointer" }}>
          View All <ChevronRight size={14} />
        </button>
      )}
    </div>
  );

  const handleFollowCompany = async (companyId) => {
    try {
      const res = await fetch(`/api/follow/company/${companyId}`, { method: "POST", credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setRecommendedCompanies((prev) => prev.map((c) => c.id === companyId ? { ...c, isFollowing: data.following } : c));
      }
    } catch {}
  };

  const handleToggleBookmark = async (listingId) => {
    try {
      const res = await fetch("/api/bookmarks", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ listingId }) });
      if (res.ok) fetchAll();
    } catch {}
  };

  const handleRemoveSaved = async (id) => {
    try {
      await fetch(`/api/dashboard/saved-listings/${id}`, { method: "DELETE", credentials: "include" });
      setSavedListings((prev) => ({ ...prev, bookmarks: prev.bookmarks?.filter((b) => b.id !== id) }));
    } catch {}
  };

  const handleMeetingRespond = async (meetingId, action) => {
    try {
      await fetch(`/api/dashboard/meetings/${meetingId}/respond`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      fetchAll();
    } catch {}
  };

  const handleMarkNotifRead = async (id) => {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH", credentials: "include" });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    setNotifUnread((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await fetch("/api/notifications/read-all", { method: "POST", credentials: "include" });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setNotifUnread(0);
  };

  const handleToggleTask = (taskId) => {
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--primary)", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  const s = stats || {};

  return (
    <div>
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
        {statConfig.map((cfg) => (
          <Card key={cfg.key} hover={false} padding="14px">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", color: cfg.color, flexShrink: 0 }}>
                <cfg.icon size={18} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500 }}>{cfg.label}</p>
                <p style={{ fontSize: 20, fontWeight: 700 }}>{s[cfg.key] ?? 0}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card hover={false} style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Analytics</h2>
          <div style={{ display: "flex", gap: 8 }}>
            {["weekly", "monthly", "yearly"].map((p) => (
              <button key={p} onClick={() => fetch(`/api/dashboard/analytics?period=${p}`, { credentials: "include" }).then((r) => r.ok && r.json()).then(setAnalytics)} style={{ padding: "4px 12px", fontSize: 12, fontWeight: 600, borderRadius: 100, border: analytics.period === p ? "2px solid var(--primary)" : "1px solid var(--border)", background: analytics.period === p ? "var(--primary-light)" : "transparent", color: analytics.period === p ? "var(--primary)" : "var(--text-muted)", cursor: "pointer" }}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div style={{ height: 200, display: "flex", alignItems: "flex-end", gap: 8, padding: "0 4px" }}>
          {(analytics.data || []).length > 0 ? analytics.data.map((d, i) => {
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
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, marginBottom: 24 }}>
        <Card hover={false}>
          <SectionHeader title="Recent Activity" link="/discover" />
          {activities.length > 0 ? activities.slice(0, 6).map((a, i) => (
            <div key={a.id || i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--primary)", fontSize: 12 }}>
                {a.type === "connection" ? <UserPlus size={14} /> : a.type === "application" ? <Briefcase size={14} /> : a.type === "message" ? <MessageSquare size={14} /> : <Bell size={14} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, lineHeight: 1.4 }}>{a.body || a.title || `${a.type} activity`}</p>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{a.createdAt ? timeAgo(new Date(a.createdAt)) : ""}</span>
              </div>
            </div>
          )) : <p style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No recent activity</p>}
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card hover={false} padding="16px">
            <SectionHeader title="Upcoming Meetings" />
            {meetings.length > 0 ? meetings.slice(0, 3).map((m) => (
              <div key={m.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", flexShrink: 0 }}>
                    <Calendar size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600 }}>{m.title}</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{m.startTime ? new Date(m.startTime).toLocaleDateString() + " " + new Date(m.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <Button size="sm" onClick={() => handleMeetingRespond(m.id, "accept")} style={{ padding: "3px 10px", fontSize: 11 }}>Accept</Button>
                  <Button size="sm" variant="ghost" onClick={() => handleMeetingRespond(m.id, "decline")} style={{ padding: "3px 10px", fontSize: 11, color: "var(--danger)" }}>Decline</Button>
                </div>
              </div>
            )) : <p style={{ padding: 12, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No upcoming meetings</p>}
          </Card>

          <Card hover={false} padding="16px">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600 }}>Notifications</h2>
              {notifUnread > 0 && <button onClick={handleMarkAllRead} style={{ fontSize: 11, color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Mark all read</button>}
            </div>
            {notifications.length > 0 ? notifications.slice(0, 3).map((n) => (
              <div key={n.id} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border)", cursor: "pointer" }} onClick={() => !n.isRead && handleMarkNotifRead(n.id)}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: n.isRead ? "transparent" : "var(--primary)", flexShrink: 0, marginTop: 5 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, color: n.isRead ? "var(--text-secondary)" : "var(--text)", fontWeight: n.isRead ? 400 : 500, lineHeight: 1.4 }}>{n.body || n.title}</p>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{n.createdAt ? timeAgo(new Date(n.createdAt)) : ""}</span>
                </div>
              </div>
            )) : <p style={{ padding: 8, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No notifications</p>}
          </Card>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 24 }}>
        <Card hover={false}>
          <SectionHeader title="Recommended Companies" link="/companies" />
          {recommendedCompanies.length > 0 ? recommendedCompanies.slice(0, 3).map((c) => (
            <div key={c.id} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              {c.logoUrl ? <img src={c.logoUrl} alt="" style={{ width: 40, height: 40, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} /> :
                <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "var(--primary)", flexShrink: 0 }}>{c.name?.[0]}</div>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</span>
                  {c.isVerified && <Badge variant="success" style={{ fontSize: 9, padding: "1px 6px" }}>✓</Badge>}
                </div>
                <p style={{ fontSize: 11, color: "var(--text-secondary)" }}>{c.industry}</p>
                <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                  <Button size="sm" variant={c.isFollowing ? "secondary" : "primary"} onClick={() => handleFollowCompany(c.id)} style={{ padding: "2px 8px", fontSize: 11 }}>
                    {c.isFollowing ? "Following" : "Follow"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/company/${c.slug || c.id}`)} style={{ padding: "2px 8px", fontSize: 11 }}>View</Button>
                </div>
              </div>
            </div>
          )) : <p style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No franchisor companies available.</p>}
        </Card>

        <Card hover={false}>
          <SectionHeader title="Recommended Opportunities" link="/discover" />
          {opportunities.length > 0 ? opportunities.slice(0, 3).map((o) => (
            <div key={o.id} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", color: "#D97706", flexShrink: 0 }}>
                <Zap size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: 13 }}>{o.title}</p>
                <p style={{ fontSize: 11, color: "var(--text-secondary)" }}>{o.company?.name}</p>
                <div style={{ display: "flex", gap: 8, marginTop: 4, fontSize: 11, color: "var(--text-muted)", flexWrap: "wrap" }}>
                  {o.investmentMin && <span><DollarSign size={10} style={{ display: "inline" }} /> {formatCurrency(o.investmentMin)}-{formatCurrency(o.investmentMax)}</span>}
                  {o.roiPercentage && <span style={{ color: "var(--accent)" }}>{o.roiPercentage}% ROI</span>}
                  {o.location && <span><MapPin size={10} style={{ display: "inline" }} /> {o.location}</span>}
                </div>
                <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                  <Button size="sm" onClick={() => navigate(`/listing/${o.slug || o.id}`)} style={{ padding: "2px 8px", fontSize: 11 }}>Apply</Button>
                  <Button size="sm" variant="ghost" onClick={() => handleToggleBookmark(o.id)} style={{ padding: "2px 8px", fontSize: 11 }}>
                    <Bookmark size={12} />
                  </Button>
                </div>
              </div>
            </div>
          )) : <p style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No opportunities available yet.</p>}
        </Card>

        <Card hover={false}>
          <SectionHeader title="People You May Know" />
          {people.length > 0 ? people.slice(0, 3).map((p) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <Avatar name={p.name} src={p.image} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</p>
                <p style={{ fontSize: 11, color: "var(--text-secondary)" }}>{p.headline || p.role}</p>
                {p.mutualConnectionCount > 0 && <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.mutualConnectionCount} mutual</p>}
              </div>
              <Button size="sm" variant="outline" style={{ padding: "3px 8px", fontSize: 11, flexShrink: 0 }} onClick={async () => { await fetch(`/api/follow/user/${p.id}`, { method: "POST", credentials: "include" }); fetchAll(); }}>
                <UserPlus size={12} /> Connect
              </Button>
            </div>
          )) : <p style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No suggestions yet.</p>}
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        <Card hover={false}>
          <SectionHeader title="Recent Messages" link="/messages" />
          {recentMessages.length > 0 ? recentMessages.slice(0, 3).map((c, i) => {
            const other = c.participants?.find((p) => p.userId !== user?.id)?.user || c.participants?.[0]?.user;
            return (
              <div key={c.id || i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border)", cursor: "pointer" }} onClick={() => navigate("/messages")}>
                <Avatar name={other?.name} src={other?.image} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                    {other?.name || "Unknown"}
                    {c.unreadCount > 0 && <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--primary)", display: "inline-block" }} />}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.lastMessage?.content || c.lastMessage || "No messages yet"}</p>
                </div>
              </div>
            );
          }) : <p style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No conversations yet.</p>}
        </Card>

        <Card hover={false}>
          <SectionHeader title="Saved Listings" link="/discover" />
          {(savedListings.bookmarks || []).length > 0 ? savedListings.bookmarks.slice(0, 3).map((b) => (
            <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#FCE7F3", display: "flex", alignItems: "center", justifyContent: "center", color: "#DB2777", flexShrink: 0 }}>
                <Heart size={16} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: 13 }}>{b.listing?.title}</p>
                <p style={{ fontSize: 11, color: "var(--text-secondary)" }}>{b.listing?.company?.name}</p>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <Button size="sm" variant="ghost" onClick={() => navigate(`/listing/${b.listing?.slug || b.listing?.id}`)} style={{ padding: "2px 6px", fontSize: 11 }}><ExternalLink size={12} /></Button>
                <Button size="sm" variant="ghost" onClick={() => handleRemoveSaved(b.id)} style={{ padding: "2px 6px", fontSize: 11, color: "var(--danger)" }}><Trash2 size={12} /></Button>
              </div>
            </div>
          )) : <p style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No saved listings yet.</p>}
        </Card>

        <Card hover={false}>
          <SectionHeader title="Tasks" />
          {tasks.length > 0 ? tasks.map((t) => {
            const priorityColors = { high: "#DC2626", medium: "#F59E0B", low: "#10B981" };
            return (
              <div key={t.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border)", opacity: t.completed ? 0.5 : 1 }}>
                <input type="checkbox" checked={t.completed} onChange={() => handleToggleTask(t.id)} style={{ marginTop: 3, accentColor: "var(--primary)", width: 16, height: 16, cursor: "pointer" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, textDecoration: t.completed ? "line-through" : "none" }}>{t.task}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                    {t.deadline && <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }}><Clock size={11} /> {t.deadline}</span>}
                    <span style={{ fontSize: 10, fontWeight: 600, color: priorityColors[t.priority], backgroundColor: `${priorityColors[t.priority]}15`, padding: "1px 6px", borderRadius: 100 }}>{t.priority}</span>
                  </div>
                </div>
              </div>
            );
          }) : <p style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No tasks. You're all caught up!</p>}
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
