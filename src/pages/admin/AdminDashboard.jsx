import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, UserCheck, ShieldCheck, Building2, Briefcase,
  MessageSquare, Heart, AlertTriangle, Clock, TrendingUp, Activity,
  BarChart3, Calendar, ChevronDown,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import Card from '../../components/ui/Card';

const API = '/api';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

const statCards = [
  { key: 'totalUsers', label: 'Total Users', icon: Users, color: '#3B82F6', bg: '#DBEAFE', format: true },
  { key: 'onlineUsers', label: 'Online Now', icon: Activity, color: '#10B981', bg: '#D1FAE5', format: true },
  { key: 'newUsersToday', label: 'New Today', icon: UserPlus, color: '#8B5CF6', bg: '#EDE9FE', format: true },
  { key: 'verifiedUsers', label: 'Verified Users', icon: ShieldCheck, color: '#059669', bg: '#D1FAE5', format: true },
  { key: 'pendingVerifications', label: 'Pending Review', icon: Clock, color: '#F59E0B', bg: '#FEF3C7', format: true },
  { key: 'totalCompanies', label: 'Total Companies', icon: Building2, color: '#EC4899', bg: '#FCE7F3', format: true },
  { key: 'activeListings', label: 'Active Listings', icon: Briefcase, color: '#14B8A6', bg: '#CCFBF1', format: true },
  { key: 'totalMessages', label: 'Messages Today', icon: MessageSquare, color: '#F97316', bg: '#FFEDD5', format: true, subKey: 'messagesToday' },
  { key: 'totalFollowers', label: 'New Followers', icon: Heart, color: '#EF4444', bg: '#FEE2E2', format: true, subKey: 'newFollowersToday' },
  { key: 'totalReports', label: 'Pending Reports', icon: AlertTriangle, color: '#DC2626', bg: '#FEE2E2', format: true, subKey: 'pendingReports' },
];

const datePresets = [
  { label: 'Today', days: 0 },
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
  { label: '1 Year', days: 365 },
];

function formatNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n;
}

function Skeleton({ width = '100%', height = 20 }) {
  return (
    <div style={{ width, height, borderRadius: 6, background: 'linear-gradient(90deg, var(--border) 25%, var(--surface) 50%, var(--border) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
  );
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ preset: '30 Days', from: null, to: null });
  const [charts, setCharts] = useState({});
  const [chartsLoading, setChartsLoading] = useState(true);
  const [showCustom, setShowCustom] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/stats`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const fetchCharts = useCallback(async () => {
    setChartsLoading(true);
    const presets = dateRange.preset === 'Custom' && dateRange.from
      ? { from: dateRange.from, to: dateRange.to }
      : dateRange.preset === 'Today'
        ? { from: new Date().toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] }
        : dateRange.preset === '7 Days'
          ? { from: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] }
          : dateRange.preset === '30 Days'
            ? { from: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] }
            : dateRange.preset === '90 Days'
              ? { from: new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] }
              : { from: new Date(Date.now() - 365 * 86400000).toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] };
    const params = new URLSearchParams(presets);
    try {
      const [userGrowth, verifTrend, companiesByInd, roleDist, dau, monthlySignups, messages, followers] = await Promise.all([
        fetch(`${API}/admin/analytics/user-growth?${params}`, { credentials: 'include' }).then(r => r.json()),
        fetch(`${API}/admin/analytics/verification-trend?${params}`, { credentials: 'include' }).then(r => r.json()),
        fetch(`${API}/admin/analytics/companies-by-industry?${params}`, { credentials: 'include' }).then(r => r.json()),
        fetch(`${API}/admin/analytics/role-distribution?${params}`, { credentials: 'include' }).then(r => r.json()),
        fetch(`${API}/admin/analytics/daily-active-users?${params}`, { credentials: 'include' }).then(r => r.json()),
        fetch(`${API}/admin/analytics/monthly-signups?${params}`, { credentials: 'include' }).then(r => r.json()),
        fetch(`${API}/admin/analytics/messages-sent?${params}`, { credentials: 'include' }).then(r => r.json()),
        fetch(`${API}/admin/analytics/followers-growth?${params}`, { credentials: 'include' }).then(r => r.json()),
      ]);
      setCharts({ userGrowth, verifTrend, companiesByInd, roleDist, dau, monthlySignups, messages, followers });
    } catch (e) { console.error(e); }
    finally { setChartsLoading(false); }
  }, [dateRange]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchCharts(); }, [fetchCharts]);

  const statsPoll = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/stats`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (e) { /* silent */ }
  }, []);
  useEffect(() => {
    const interval = setInterval(statsPoll, 30000);
    return () => clearInterval(interval);
  }, [statsPoll]);

  return (
    <div>
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Dashboard</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Platform overview and analytics</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {datePresets.map((p) => (
            <button
              key={p.label}
              onClick={() => { setDateRange({ preset: p.label, from: null, to: null }); setShowCustom(false); }}
              style={{
                padding: '6px 14px', fontSize: 13, fontWeight: 500, borderRadius: 8, border: 'none', cursor: 'pointer',
                backgroundColor: dateRange.preset === p.label ? 'var(--primary)' : 'var(--border)',
                color: dateRange.preset === p.label ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.2s',
              }}
            >
              {p.label === 'Today' ? <Calendar size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> : null}
              {p.label}
            </button>
          ))}
          <button
            onClick={() => setShowCustom(!showCustom)}
            style={{
              padding: '6px 14px', fontSize: 13, fontWeight: 500, borderRadius: 8, border: 'none', cursor: 'pointer',
              backgroundColor: dateRange.preset === 'Custom' ? 'var(--primary)' : 'var(--border)',
              color: dateRange.preset === 'Custom' ? '#fff' : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <Calendar size={14} /> Custom <ChevronDown size={12} />
          </button>
        </div>
      </div>

      {showCustom && (
        <Card hover={false} padding="16px" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ fontSize: 13, fontWeight: 500 }}>From:</label>
            <input type="date" value={dateRange.from || ''} onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value, preset: 'Custom' }))}
              style={{ padding: '8px 12px', borderRadius: 8, border: '2px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text)', fontSize: 14 }} />
            <label style={{ fontSize: 13, fontWeight: 500 }}>To:</label>
            <input type="date" value={dateRange.to || ''} onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value, preset: 'Custom' }))}
              style={{ padding: '8px 12px', borderRadius: 8, border: '2px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text)', fontSize: 14 }} />
          </div>
        </Card>
      )}

      <motion.div variants={container} initial="hidden" animate="show" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
        {loading ? (
          Array.from({ length: 10 }).map((_, i) => (
            <Card key={i} hover={false} padding="16px"><Skeleton height={70} /></Card>
          ))
        ) : (
          statCards.map((card) => {
            const Icon = card.icon;
            const value = stats?.[card.key] ?? 0;
            const subValue = card.subKey ? stats?.[card.subKey] : null;
            return (
              <motion.div key={card.key} variants={item}>
                <Card hover={false} padding="16px" style={{ position: 'relative', overflow: 'hidden' }}>
                  <motion.div
                    key={value}
                    initial={{ scale: 1.3, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={18} color={card.color} />
                      </div>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>{typeof value === 'number' ? formatNum(value) : value}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{card.label}</div>
                    {subValue !== null && (
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                        {subValue} today
                      </div>
                    )}
                  </motion.div>
                  <div style={{ position: 'absolute', right: -8, bottom: -8, opacity: 0.06 }}>
                    <Icon size={80} color={card.color} />
                  </div>
                </Card>
              </motion.div>
            );
          })
        )}
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20, marginBottom: 24 }}>
        <ChartCard title="User Growth" loading={chartsLoading} isEmpty={!charts.userGrowth?.series?.length}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={charts.userGrowth?.series || []}>
              <defs>
                <linearGradient id="ug" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} stroke="var(--text-muted)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }} />
              <Area type="monotone" dataKey="cumulative" stroke="#3B82F6" fill="url(#ug)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Verification Trend" loading={chartsLoading} isEmpty={!charts.verifTrend?.series?.length}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={charts.verifTrend?.series || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} stroke="var(--text-muted)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }} />
              <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Daily Active Users" loading={chartsLoading} isEmpty={!charts.dau?.series?.length}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={charts.dau?.series || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} stroke="var(--text-muted)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }} />
              <Line type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Signups" loading={chartsLoading} isEmpty={!charts.monthlySignups?.series?.length}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={charts.monthlySignups?.series || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }} />
              <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Messages Sent" loading={chartsLoading} isEmpty={!charts.messages?.series?.length}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={charts.messages?.series || []}>
              <defs>
                <linearGradient id="ms" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/><stop offset="95%" stopColor="#F97316" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} stroke="var(--text-muted)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }} />
              <Area type="monotone" dataKey="count" stroke="#F97316" fill="url(#ms)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Followers Growth" loading={chartsLoading} isEmpty={!charts.followers?.series?.length}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={charts.followers?.series || []}>
              <defs>
                <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EC4899" stopOpacity={0.3}/><stop offset="95%" stopColor="#EC4899" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} stroke="var(--text-muted)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }} />
              <Area type="monotone" dataKey="count" stroke="#EC4899" fill="url(#fg)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Companies by Industry" loading={chartsLoading} isEmpty={!charts.companiesByInd?.data?.length}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={charts.companiesByInd?.data || []} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {(charts.companiesByInd?.data || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Role Distribution" loading={chartsLoading} isEmpty={!charts.roleDist?.data?.length}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={charts.roleDist?.data || []} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {(charts.roleDist?.data || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, loading, isEmpty, children }) {
  return (
    <Card hover={false} padding="20px">
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>{title}</h3>
      {loading ? (
        <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Skeleton height={200} />
        </div>
      ) : isEmpty ? (
        <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
          No data available for this period
        </div>
      ) : children}
    </Card>
  );
}
