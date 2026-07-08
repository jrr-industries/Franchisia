import { useState } from 'react';
import {
  Download, Calendar, TrendingUp, Users, FileText,
  DollarSign, Activity, ArrowUpRight, ArrowDownRight,
  Star, Eye, MousePointerClick, Percent, Trophy
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  title: { fontSize: 24, fontWeight: 700 },
  subtitle: { fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 },
  dateRow: { display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap' },
  dateItem: { minWidth: 180 },
  kpis: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 },
  kpiCard: { textAlign: 'center' },
  kpiIcon: { width: 44, height: 44, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' },
  kpiVal: { fontSize: 26, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 },
  kpiLabel: { fontSize: 13, color: 'var(--text-secondary)' },
  kpiChange: { fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, marginTop: 6 },
  charts: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 },
  chartPlaceholder: {
    height: 300, borderRadius: 'var(--radius-md)', border: '2px dashed var(--border)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    color: 'var(--text-muted)', fontSize: 14, gap: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: 600, marginBottom: 16 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, borderBottom: '2px solid var(--border)' },
  td: { padding: '14px 16px', fontSize: 14, borderBottom: '1px solid var(--border)' },
  pagWrap: { padding: '16px 0', display: 'flex', justifyContent: 'center' },
  rankNum: { width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 },
};

const kpiData = [
  { label: 'Total Users', value: '24,582', change: '+12.5%', up: true, icon: <Users size={20} />, color: 'var(--primary)', bg: 'var(--primary-light)' },
  { label: 'Active Listings', value: '4,291', change: '+8.3%', up: true, icon: <FileText size={20} />, color: 'var(--accent)', bg: 'var(--accent-light)' },
  { label: 'Successful Matches', value: '1,847', change: '+15.7%', up: true, icon: <Activity size={20} />, color: '#8B5CF6', bg: '#EDE9FE' },
  { label: 'Total Revenue', value: '$847K', change: '+22.4%', up: true, icon: <DollarSign size={20} />, color: '#EC4899', bg: '#FCE7F3' },
  { label: 'Growth Rate', value: '15.3%', change: '+2.1%', up: true, icon: <TrendingUp size={20} />, color: '#F59E0B', bg: '#FEF3C7' },
];

const topFranchises = [
  { rank: 1, name: 'Pizza Palace', views: 12450, applications: 342, conversion: '2.7%' },
  { rank: 2, name: 'FitZone Gym', views: 9870, applications: 289, conversion: '2.9%' },
  { rank: 3, name: 'CleanPro Services', views: 7650, applications: 198, conversion: '2.6%' },
  { rank: 4, name: 'BrewHouse Cafe', views: 5430, applications: 156, conversion: '2.9%' },
  { rank: 5, name: 'TechFix Repairs', views: 4210, applications: 112, conversion: '2.7%' },
];

const rangeOptions = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '1y', label: 'This Year' },
  { value: 'all', label: 'All Time' },
];

export default function AdminAnalytics() {
  const [dateRange, setDateRange] = useState('30d');

  const getRankStyle = (rank) => {
    if (rank === 1) return { backgroundColor: '#FEF3C7', color: '#D97706' };
    if (rank === 2) return { backgroundColor: '#F1F5F9', color: '#64748B' };
    if (rank === 3) return { backgroundColor: '#FEE2E2', color: '#DC2626' };
    return { backgroundColor: 'var(--surface-hover)', color: 'var(--text-muted)' };
  };

  return (
    <div>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Analytics</h1>
          <p style={s.subtitle}>Platform performance metrics and insights</p>
        </div>
        <Button variant="primary" size="sm" icon={<Download size={16} />}>Download Reports</Button>
      </div>

      <div style={s.dateRow}>
        <div style={s.dateItem}>
          <Select
            label="Date Range"
            options={rangeOptions}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" icon={<Calendar size={16} />}>Custom Range</Button>
      </div>

      <div style={s.kpis}>
        {kpiData.map((kpi, i) => (
          <Card key={i} hover={false} padding="20px" style={s.kpiCard}>
            <div style={{ ...s.kpiIcon, backgroundColor: kpi.bg, color: kpi.color }}>
              {kpi.icon}
            </div>
            <div style={s.kpiVal}>{kpi.value}</div>
            <div style={s.kpiLabel}>{kpi.label}</div>
            <div style={{ ...s.kpiChange, color: kpi.up ? 'var(--accent)' : 'var(--danger)' }}>
              {kpi.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {kpi.change}
            </div>
          </Card>
        ))}
      </div>

      <div style={s.charts}>
        <div style={s.chartPlaceholder}>
          <TrendingUp size={36} />
          <span style={{ fontWeight: 600 }}>Revenue Overview</span>
          <span>Monthly revenue trend chart</span>
        </div>
        <div style={s.chartPlaceholder}>
          <Users size={36} />
          <span style={{ fontWeight: 600 }}>User Acquisition</span>
          <span>New user registrations over time</span>
        </div>
        <div style={s.chartPlaceholder}>
          <FileText size={36} />
          <span style={{ fontWeight: 600 }}>Listing Performance</span>
          <span>Active vs pending listings</span>
        </div>
        <div style={s.chartPlaceholder}>
          <Activity size={36} />
          <span style={{ fontWeight: 600 }}>Engagement Metrics</span>
          <span>User activity and interactions</span>
        </div>
      </div>

      <Card hover={false} padding="24px">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={s.sectionTitle}>Top Performing Franchises</h2>
          <Badge variant="info">{dateRange === '30d' ? 'Last 30 Days' : 'Current Period'}</Badge>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Rank</th>
                <th style={s.th}>Franchise</th>
                <th style={s.th}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Eye size={14} /> Views
                  </div>
                </th>
                <th style={s.th}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MousePointerClick size={14} /> Applications
                  </div>
                </th>
                <th style={s.th}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Percent size={14} /> Conv. Rate
                  </div>
                </th>
                <th style={s.th}>Trend</th>
              </tr>
            </thead>
            <tbody>
              {topFranchises.map((f, i) => (
                <tr key={i}>
                  <td style={s.td}>
                    <div style={{ ...s.rankNum, ...getRankStyle(f.rank) }}>
                      {f.rank === 1 ? <Trophy size={14} /> : f.rank}
                    </div>
                  </td>
                  <td style={{ ...s.td, fontWeight: 500 }}>{f.name}</td>
                  <td style={{ ...s.td, fontFamily: "'JetBrains Mono', monospace" }}>{f.views.toLocaleString()}</td>
                  <td style={{ ...s.td, fontFamily: "'JetBrains Mono', monospace" }}>{f.applications}</td>
                  <td style={s.td}>
                    <Badge variant="success">{f.conversion}</Badge>
                  </td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent)', fontSize: 13 }}>
                      <ArrowUpRight size={14} /> +{Math.floor(Math.random() * 10) + 1}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
