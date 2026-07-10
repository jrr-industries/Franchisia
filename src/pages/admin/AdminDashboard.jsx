import { useState, useEffect } from 'react';
import { Users, Building2, FileText, AlertTriangle, DollarSign, TrendingUp, Activity, MessageSquare, Heart, ShieldCheck, Clock, UserPlus } from 'lucide-react';
import Card from '../../components/ui/Card';

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  title: { fontSize: 24, fontWeight: 700 },
  subtitle: { fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 28 },
  statCard: { textAlign: 'center' },
  statHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  statIcon: { width: 44, height: 44, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statVal: { fontSize: 28, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },
  statLabel: { fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 },
  grid2: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 28 },
  sectionTitle: { fontSize: 16, fontWeight: 600, marginBottom: 16 },
  chartPlaceholder: {
    height: 260, borderRadius: 'var(--radius-md)', border: '2px dashed var(--border)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    color: 'var(--text-muted)', fontSize: 14, gap: 8,
  },
};

const statCards = [
  { key: 'totalUsers', label: 'Total Users', icon: Users, color: 'var(--primary)', bg: 'var(--primary-light)' },
  { key: 'pendingVerifications', label: 'Pending Verifications', icon: Clock, color: '#F59E0B', bg: '#FEF3C7' },
  { key: 'verifiedCompanies', label: 'Verified Companies', icon: ShieldCheck, color: 'var(--accent)', bg: 'var(--accent-light)' },
  { key: 'activeCompanies', label: 'Active Companies', icon: Building2, color: '#8B5CF6', bg: '#EDE9FE' },
  { key: 'totalMessages', label: 'Total Messages', icon: MessageSquare, color: '#EC4899', bg: '#FCE7F3' },
  { key: 'totalFollowers', label: 'Total Followers', icon: Heart, color: 'var(--danger)', bg: '#FEE2E2' },
  { key: 'totalReports', label: 'Reports', icon: AlertTriangle, color: 'var(--danger)', bg: '#FEE2E2' },
  { key: 'newUsersToday', label: 'New Users Today', icon: UserPlus, color: 'var(--accent)', bg: 'var(--accent-light)' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Admin Dashboard</h1>
          <p style={s.subtitle}>Overview of your franchise platform</p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Loading dashboard...</div>
      ) : (
        <>
          <div style={s.stats}>
            {statCards.map(({ key, label, icon: Icon, color, bg }) => (
              <Card key={key} hover={false} padding="20px" style={s.statCard}>
                <div style={s.statHeader}>
                  <div style={{ ...s.statIcon, backgroundColor: bg, color }}><Icon size={20} /></div>
                </div>
                <div style={s.statVal}>{stats?.[key]?.toLocaleString() || '0'}</div>
                <div style={s.statLabel}>{label}</div>
              </Card>
            ))}
          </div>

          <div style={s.grid2}>
            <Card hover={false} padding="20px">
              <h2 style={s.sectionTitle}>Verification Status</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(stats?.verificationStats || []).map((v) => (
                  <div key={v.accountStatus} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{v.accountStatus.replace(/_/g, ' ')}</span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{v._count}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card hover={false} padding="20px">
              <h2 style={s.sectionTitle}>User Roles</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(stats?.roleStats || []).map((r) => (
                  <div key={r.role} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 14, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{r.role}</span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{r._count}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={s.chartPlaceholder}>
              <TrendingUp size={32} />
              <span>Revenue Chart</span>
            </div>
            <div style={s.chartPlaceholder}>
              <Users size={32} />
              <span>User Growth Chart</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
