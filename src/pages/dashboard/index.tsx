import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Eye, Users, Briefcase, MessageSquare, TrendingUp, Calendar,
  ArrowRight, Clock, Bell, ChevronRight, Star, Bookmark,
  CheckCircle, UserPlus, Building2, BarChart3, Activity,
  Zap, Heart, DollarSign, MapPin, Award, Target,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";

const stats = [
  { label: "Profile Views", value: "1,342", icon: Eye, change: "+12% this week", color: "#8B5CF6", bg: "#EDE9FE" },
  { label: "Connections", value: "86", icon: Users, change: "+5 new this week", color: "#2563EB", bg: "#DBEAFE" },
  { label: "Applications", value: "12", icon: Briefcase, change: "3 pending review", color: "#F59E0B", bg: "#FEF3C7" },
  { label: "Messages", value: "24", icon: MessageSquare, change: "8 unread", color: "#10B981", bg: "#D1FAE5" },
];

const activities = [
  { id: 1, user: "Sarah Johnson", action: "submitted an application for", target: "McDonald's Franchise", time: "2 min ago" },
  { id: 2, user: "Mike Chen", action: "sent you a message about", target: "Subway Opportunity", time: "15 min ago" },
  { id: 3, user: "Emily Rodriguez", action: "shortlisted your franchise", target: "KFC Outlet #42", time: "1 hr ago" },
  { id: 4, user: "David Kim", action: "requested a meeting for", target: "Pizza Hut Expansion", time: "3 hr ago" },
  { id: 5, user: "Lisa Thompson", action: "viewed your profile", target: "", time: "5 hr ago" },
  { id: 6, user: "James Wilson", action: "left a review on", target: "Burger King - Downtown", time: "1 day ago" },
];

const meetings = [
  { company: "Subway Franchising", date: "Today", time: "2:00 PM" },
  { company: "KFC Corp", date: "Tomorrow", time: "10:30 AM" },
  { company: "Pizza Hut LLC", date: "Jul 12", time: "3:00 PM" },
];

const notifications = [
  { id: 1, text: "Your application for McDonald's has been viewed", time: "10 min ago", unread: true },
  { id: 2, text: "New franchise opportunity: 7-Eleven Expansion", time: "1 hr ago", unread: true },
  { id: 3, text: "Sarah Johnson accepted your connection request", time: "3 hr ago", unread: false },
  { id: 4, text: "Reminder: Meeting with KFC Corp tomorrow", time: "5 hr ago", unread: false },
];

const recommendedCompanies = [
  { name: "McDonald's", industry: "Fast Food", investment: "$150K - $350K", verified: true, match: "95%" },
  { name: "7-Eleven", industry: "Convenience Store", investment: "$50K - $120K", verified: true, match: "88%" },
  { name: "Anytime Fitness", industry: "Fitness", investment: "$80K - $200K", verified: false, match: "82%" },
];

const recommendedOpportunities = [
  { title: "Downtown Location Franchise", company: "Starbucks", roi: "18-24%", location: "Austin, TX" },
  { title: "Territory Expansion Partner", company: "Domino's", roi: "22-30%", location: "Multiple Cities" },
  { title: "Multi-Unit Development Deal", company: "Taco Bell", roi: "15-20%", location: "Phoenix, AZ" },
];

const peopleYouMayKnow = [
  { name: "Alex Rivera", role: "Franchise Investor", connections: 8 },
  { name: "Jessica Park", role: "Multi-Unit Owner", connections: 12 },
  { name: "Marcus Johnson", role: "Franchise Consultant", connections: 5 },
];

const recentMessages = [
  { name: "Sarah Johnson", text: "Thanks for the information! I'll review it...", time: "2 min ago", unread: true },
  { name: "Mike Chen", text: "Can we schedule a call to discuss the terms?", time: "15 min ago", unread: true },
  { name: "Emily Rodriguez", text: "I'm interested in your KFC franchise...", time: "1 hr ago", unread: false },
];

const savedListings = [
  { title: "Premium Restaurant Space", type: "Lease", price: "$8,500/mo" },
  { title: "Retail Storefront - High Traffic", type: "Lease", price: "$6,200/mo" },
  { title: "Office + Warehouse Combo", type: "Sale", price: "$450,000" },
];

const tasks = [
  { task: "Complete profile verification", deadline: "Today", priority: "high" },
  { task: "Submit documents for McDonald's", deadline: "Jul 14", priority: "medium" },
  { task: "Follow up with 7-Eleven franchisor", deadline: "Jul 16", priority: "low" },
];

export default function DashboardHome() {
  const { user } = useAuth();

  const [chartData, setChartData] = useState(null);
  useEffect(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    setChartData(months.map((m) => ({ month: m, views: Math.floor(Math.random() * 500 + 100), applications: Math.floor(Math.random() * 30 + 5) })));
  }, []);

  const needsOnboarding = user && !["verified", "pending_admin_review"].includes(user.accountStatus);

  const statusBanners = {
    pending_email_verification: { icon: Clock, msg: "Please verify your email address", to: "/verify-email", color: "#F59E0B", bg: "#FEF3C7" },
    pending_phone_verification: { icon: Clock, msg: "Please verify your phone number", to: "/verify-phone", color: "#F59E0B", bg: "#FEF3C7" },
    pending_profile_completion: { icon: Clock, msg: "Complete your profile to get started", to: "/select-role", color: "#F59E0B", bg: "#FEF3C7" },
    rejected: { icon: Clock, msg: "Your verification was rejected. Contact support.", to: "/account-status", color: "#DC2626", bg: "#FEE2E2" },
    need_more_information: { icon: Clock, msg: "Additional information required for verification", to: "/account-status", color: "#F59E0B", bg: "#FEF3C7" },
  };

  const SectionHeader = ({ title, link }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600 }}>{title}</h2>
      {link && (
        <a href={link} style={{ color: "var(--primary)", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
          View All <ChevronRight size={14} />
        </a>
      )}
    </div>
  );

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
          <Clock size={20} />
          <span style={{ flex: 1, fontWeight: 500 }}>Your account is under admin review. You'll be notified once verified.</span>
          <a href="/account-status" style={{ color: "#8B5CF6", fontWeight: 600, textDecoration: "underline" }}>Check Status</a>
        </div>
      )}

      {user?.verified && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderRadius: "var(--radius-sm)", backgroundColor: "#D1FAE5", color: "#059669", marginBottom: 20, fontSize: 14 }}>
          <CheckCircle size={20} />
          <span style={{ flex: 1, fontWeight: 500 }}>Verified Account — You have full access to all platform features.</span>
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Welcome back, {user?.name || "User"}!</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>Here's your complete franchise overview.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
        {stats.map((s) => (
          <Card key={s.label} hover={false} padding="20px">
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, backgroundColor: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, flexShrink: 0 }}>
                <s.icon size={22} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>{s.label}</p>
                <p style={{ fontSize: 24, fontWeight: 700 }}>{s.value}</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.change}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card hover={false} style={{ marginBottom: 24 }}>
        <SectionHeader title="Analytics Overview" />
        <div style={{ height: 240, display: "flex", alignItems: "flex-end", gap: 12, padding: "0 8px" }}>
          {chartData ? chartData.map((d) => {
            const maxViews = Math.max(...chartData.map((x) => x.views));
            const maxApps = Math.max(...chartData.map((x) => x.applications));
            return (
              <div key={d.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
                <div style={{ display: "flex", gap: 3, width: "100%", alignItems: "flex-end", height: 180 }}>
                  <div style={{ flex: 1, height: `${(d.views / maxViews) * 100}%`, backgroundColor: "var(--primary)", borderRadius: "4px 4px 0 0", minHeight: 4, opacity: 0.8 }} title={`Views: ${d.views}`} />
                  <div style={{ flex: 1, height: `${(d.applications / maxApps) * 100}%`, backgroundColor: "var(--accent)", borderRadius: "4px 4px 0 0", minHeight: 4, opacity: 0.8 }} title={`Applications: ${d.applications}`} />
                </div>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{d.month}</span>
              </div>
            );
          }) : <div style={{ width: "100%", textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading chart...</div>}
        </div>
        <div style={{ display: "flex", gap: 20, marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: "var(--primary)", opacity: 0.8 }} />
            Profile Views
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: "var(--accent)", opacity: 0.8 }} />
            Applications
          </div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, marginBottom: 24 }}>
        <Card hover={false}>
          <SectionHeader title="Recent Activity" link="/discover" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            {activities.map((a) => (
              <div key={a.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                <Avatar name={a.user} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, lineHeight: 1.5 }}>
                    <strong>{a.user}</strong> {a.action}{" "}
                    {a.target && <span style={{ color: "var(--primary)", fontWeight: 500 }}>{a.target}</span>}
                  </p>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card hover={false} padding="16px">
            <SectionHeader title="Upcoming Meetings" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {meetings.map((m) => (
                <div key={m.company} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", flexShrink: 0 }}>
                    <Calendar size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600 }}>{m.company}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{m.date} at {m.time}</p>
                  </div>
                  <Badge variant="info" style={{ fontSize: 11, padding: "2px 10px" }}>{m.date === "Today" ? "Now" : m.date}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card hover={false} padding="16px">
            <SectionHeader title="Notifications" link="/notifications" />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {notifications.slice(0, 3).map((n) => (
                <div key={n.id} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border)", alignItems: "flex-start" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: n.unread ? "var(--primary)" : "transparent", flexShrink: 0, marginTop: 5 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: n.unread ? "var(--text)" : "var(--text-secondary)", fontWeight: n.unread ? 500 : 400, lineHeight: 1.4 }}>{n.text}</p>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{n.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 24 }}>
        <Card hover={false}>
          <SectionHeader title="Recommended Companies" link="/companies" />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recommendedCompanies.map((c) => (
              <div key={c.name} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)", cursor: "pointer" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: "var(--primary)", flexShrink: 0 }}>
                  {c.name[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</span>
                    {c.verified && <Badge variant="success" style={{ fontSize: 10, padding: "1px 8px" }}>Verified</Badge>}
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>{c.industry}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.investment}</span>
                    <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>{c.match} Match</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card hover={false}>
          <SectionHeader title="Recommended Opportunities" link="/discover" />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recommendedOpportunities.map((o) => (
              <div key={o.title} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)", cursor: "pointer" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", color: "#D97706", flexShrink: 0 }}>
                  <Zap size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>{o.title}</p>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>{o.company}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                      <MapPin size={11} /> {o.location}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>{o.roi} ROI</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card hover={false}>
          <SectionHeader title="People You May Know" />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {peopleYouMayKnow.map((p) => (
              <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <Avatar name={p.name} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</p>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>{p.role}</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.connections} mutual connections</p>
                </div>
                <Button size="sm" variant="outline" style={{ flexShrink: 0, padding: "4px 10px", fontSize: 12 }}>
                  <UserPlus size={14} /> Connect
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        <Card hover={false}>
          <SectionHeader title="Recent Messages" link="/messages" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recentMessages.map((m) => (
              <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border)", cursor: "pointer" }}>
                <Avatar name={m.name} size={34} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                    {m.name}
                    {m.unread && <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--primary)", display: "inline-block" }} />}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.text}</p>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{m.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card hover={false}>
          <SectionHeader title="Saved Listings" link="/discover" />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {savedListings.map((l) => (
              <div key={l.title} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)", cursor: "pointer" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#FCE7F3", display: "flex", alignItems: "center", justifyContent: "center", color: "#DB2777", flexShrink: 0 }}>
                  <Heart size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>{l.title}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                    <Badge variant="info" style={{ fontSize: 10, padding: "1px 8px" }}>{l.type}</Badge>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>{l.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card hover={false}>
          <SectionHeader title="Tasks" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tasks.map((t) => {
              const priorityColors = { high: "#DC2626", medium: "#F59E0B", low: "#10B981" };
              return (
                <div key={t.task} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <input type="checkbox" style={{ marginTop: 3, accentColor: "var(--primary)", width: 16, height: 16, cursor: "pointer" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{t.task}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                      <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                        <Calendar size={12} /> {t.deadline}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: priorityColors[t.priority], backgroundColor: `${priorityColors[t.priority]}15`, padding: "1px 8px", borderRadius: 100 }}>{t.priority}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
