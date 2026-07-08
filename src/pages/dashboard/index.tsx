import { useAuth } from "../../context/AuthContext";
import { LayoutDashboard, Users, Building2, TrendingUp } from "lucide-react";

export default function DashboardHome() {
  const { user } = useAuth();

  const stats = [
    { label: "Profile Views", value: "0", icon: Users, change: "+0% this week" },
    { label: "Saved Listings", value: "0", icon: Building2, change: "Start exploring" },
    { label: "Connections", value: "0", icon: TrendingUp, change: "Build your network" },
    { label: "Applications", value: "0", icon: LayoutDashboard, change: "Apply to opportunities" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
          Welcome back, {user?.name || "User"}
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          Here's what's happening with your franchise journey.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 32 }}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              padding: 24,
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 500 }}>{stat.label}</span>
              <stat.icon size={20} style={{ color: "var(--text-muted)" }} />
            </div>
            <p style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{stat.value}</p>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{stat.change}</p>
          </div>
        ))}
      </div>

      <div
        style={{
          padding: 32,
          borderRadius: "var(--radius-md)",
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Start Your Franchise Journey</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24, maxWidth: 480, margin: "0 auto 24px" }}>
          Discover franchise opportunities, connect with franchisors, and take the next step in your entrepreneurial journey.
        </p>
        <a
          href="/discover"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 32px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--primary)",
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Explore Opportunities
        </a>
      </div>
    </div>
  );
}
