import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, Users, FileText, Activity, Calendar, Download, ChevronDown,
  BarChart3, MessageSquare, Heart, Briefcase, ShieldCheck,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const API = '/api';
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

const datePresets = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
  { label: '1 Year', days: 365 },
];

export default function AdminAnalytics() {
  const [preset, setPreset] = useState('30 Days');
  const [charts, setCharts] = useState({});
  const [loading, setLoading] = useState(true);

  const getParams = useCallback(() => {
    const days = datePresets.find(p => p.label === preset)?.days || 30;
    const from = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
    const to = new Date().toISOString().split('T')[0];
    return new URLSearchParams({ from, to });
  }, [preset]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const params = getParams();
    try {
      const [
        stats, userGrowth, verifTrend, companiesByInd, roleDist, dau, monthlySignups, messages, followers,
      ] = await Promise.all([
        fetch(`${API}/admin/stats`, { credentials: 'include' }).then(r => r.json()),
        fetch(`${API}/admin/analytics/user-growth?${params}`, { credentials: 'include' }).then(r => r.json()),
        fetch(`${API}/admin/analytics/verification-trend?${params}`, { credentials: 'include' }).then(r => r.json()),
        fetch(`${API}/admin/analytics/companies-by-industry?${params}`, { credentials: 'include' }).then(r => r.json()),
        fetch(`${API}/admin/analytics/role-distribution?${params}`, { credentials: 'include' }).then(r => r.json()),
        fetch(`${API}/admin/analytics/daily-active-users?${params}`, { credentials: 'include' }).then(r => r.json()),
        fetch(`${API}/admin/analytics/monthly-signups?${params}`, { credentials: 'include' }).then(r => r.json()),
        fetch(`${API}/admin/analytics/messages-sent?${params}`, { credentials: 'include' }).then(r => r.json()),
        fetch(`${API}/admin/analytics/followers-growth?${params}`, { credentials: 'include' }).then(r => r.json()),
      ]);
      setCharts({ stats, userGrowth, verifTrend, companiesByInd, roleDist, dau, monthlySignups, messages, followers });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [getParams]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Analytics</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Platform metrics and trends</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {datePresets.map((p) => (
            <button
              key={p.label}
              onClick={() => setPreset(p.label)}
              style={{
                padding: '6px 14px', fontSize: 13, fontWeight: 500, borderRadius: 8, border: 'none', cursor: 'pointer',
                backgroundColor: preset === p.label ? 'var(--primary)' : 'var(--border)',
                color: preset === p.label ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.2s',
              }}
            >
              {p.label}
            </button>
          ))}
          <Button variant="outline" size="sm" icon={<Download size={14} />}>Export</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Total Users', value: charts.stats?.totalUsers, icon: Users, color: '#3B82F6', bg: '#DBEAFE' },
          { label: 'Active Listings', value: charts.stats?.activeListings, icon: Briefcase, color: '#10B981', bg: '#D1FAE5' },
          { label: 'Messages', value: charts.stats?.totalMessages, icon: MessageSquare, color: '#F97316', bg: '#FFEDD5' },
          { label: 'Followers', value: charts.stats?.totalFollowers, icon: Heart, color: '#EC4899', bg: '#FCE7F3' },
          { label: 'Verified Users', value: charts.stats?.verifiedUsers, icon: ShieldCheck, color: '#059669', bg: '#D1FAE5' },
          { label: 'Growth Rate', value: charts.stats?.newUsersMonth, icon: TrendingUp, color: '#8B5CF6', bg: '#EDE9FE' },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} hover={false} padding="16px">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} color={kpi.color} />
                </div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{kpi.value?.toLocaleString() ?? '—'}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{kpi.label}</div>
            </Card>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20, marginBottom: 24 }}>
        <ChartBlock title="User Growth" loading={loading} data={charts.userGrowth?.series} dataKey="cumulative" color="#3B82F6" type="area" />
        <ChartBlock title="Verification Trend" loading={loading} data={charts.verifTrend?.series} dataKey="count" color="#10B981" type="bar" />
        <ChartBlock title="Daily Active Users" loading={loading} data={charts.dau?.series} dataKey="count" color="#8B5CF6" type="line" />
        <ChartBlock title="Monthly Signups" loading={loading} data={charts.monthlySignups?.series} dataKey="count" color="#F59E0B" type="bar" xKey="month" />
        <ChartBlock title="Messages Sent" loading={loading} data={charts.messages?.series} dataKey="count" color="#F97316" type="area" />
        <ChartBlock title="Followers Growth" loading={loading} data={charts.followers?.series} dataKey="count" color="#EC4899" type="area" />
        <ChartBlock title="Companies by Industry" loading={loading} data={charts.companiesByInd?.data} dataKey="value" color={COLORS} type="pie" />
        <ChartBlock title="Role Distribution" loading={loading} data={charts.roleDist?.data} dataKey="value" color={COLORS} type="pie" />
      </div>
    </div>
  );
}

function ChartBlock({ title, loading, data, dataKey, color, type, xKey = 'date' }) {
  return (
    <Card hover={false} padding="20px">
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>{title}</h3>
      {loading ? (
        <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading...</div>
      ) : !data?.length ? (
        <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data</div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          {type === 'area' ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`g-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey={xKey} tick={{ fontSize: 11 }} tickFormatter={(v) => v?.slice(5)} stroke="var(--text-muted)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Area type="monotone" dataKey={dataKey} stroke={color} fill={`url(#g-${title})`} strokeWidth={2} />
            </AreaChart>
          ) : type === 'bar' ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey={xKey} tick={{ fontSize: 11 }} tickFormatter={(v) => v?.slice(5)} stroke="var(--text-muted)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : type === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey={xKey} tick={{ fontSize: 11 }} tickFormatter={(v) => v?.slice(5)} stroke="var(--text-muted)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
            </LineChart>
          ) : (
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" outerRadius={80} dataKey={dataKey} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {data.map((_, i) => (
                  <Cell key={i} fill={Array.isArray(color) ? color[i % color.length] : color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
            </PieChart>
          )}
        </ResponsiveContainer>
      )}
    </Card>
  );
}
