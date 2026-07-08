import { useState } from 'react';
import {
  Users, Building2, FileText, AlertTriangle, DollarSign, TrendingUp,
  Activity, PlusCircle, Settings, Download, ArrowUpRight, ArrowDownRight,
  MoreHorizontal, Eye, Edit3, Trash2
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Dropdown, { DropdownItem } from '../../components/ui/Dropdown';

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  title: { fontSize: 24, fontWeight: 700 },
  subtitle: { fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 },
  quickRow: { display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 28 },
  statCard: { textAlign: 'center' },
  statHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  statIcon: { width: 44, height: 44, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statVal: { fontSize: 28, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },
  statLabel: { fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 },
  statChange: { fontSize: 12, display: 'flex', alignItems: 'center', gap: 2, marginTop: 6 },
  grid2: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 28 },
  sectionTitle: { fontSize: 16, fontWeight: 600, marginBottom: 16 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, borderBottom: '2px solid var(--border)' },
  td: { padding: '14px 16px', fontSize: 14, borderBottom: '1px solid var(--border)' },
  activityItem: {
    display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0',
    borderBottom: '1px solid var(--border)',
  },
  chartPlaceholder: {
    height: 260, borderRadius: 'var(--radius-md)', border: '2px dashed var(--border)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    color: 'var(--text-muted)', fontSize: 14, gap: 8,
  },
};

const statCardsData = [
  { label: 'Total Users', value: '24,582', change: '+12.5%', up: true, icon: <Users size={20} />, color: 'var(--primary)', bg: 'var(--primary-light)' },
  { label: 'Total Companies', value: '1,347', change: '+8.2%', up: true, icon: <Building2 size={20} />, color: 'var(--accent)', bg: 'var(--accent-light)' },
  { label: 'Active Listings', value: '4,291', change: '-3.1%', up: false, icon: <FileText size={20} />, color: '#F59E0B', bg: '#FEF3C7' },
  { label: 'Reports', value: '127', change: '+18.6%', up: true, icon: <AlertTriangle size={20} />, color: 'var(--danger)', bg: '#FEE2E2' },
  { label: 'Revenue', value: '$847K', change: '+22.4%', up: true, icon: <DollarSign size={20} />, color: '#8B5CF6', bg: '#EDE9FE' },
  { label: 'Growth', value: '15.3%', change: '+2.1%', up: true, icon: <TrendingUp size={20} />, color: '#EC4899', bg: '#FCE7F3' },
];

const recentUsers = [
  { name: 'Alice Johnson', email: 'alice@example.com', role: 'Investor', status: 'Active', date: 'Apr 5, 2026', avatar: '' },
  { name: 'Bob Smith', email: 'bob@example.com', role: 'Franchisor', status: 'Active', date: 'Apr 4, 2026', avatar: '' },
  { name: 'Carol White', email: 'carol@example.com', role: 'Admin', status: 'Suspended', date: 'Apr 3, 2026', avatar: '' },
  { name: 'David Brown', email: 'david@example.com', role: 'Consultant', status: 'Active', date: 'Apr 2, 2026', avatar: '' },
  { name: 'Eve Davis', email: 'eve@example.com', role: 'Investor', status: 'Pending', date: 'Apr 1, 2026', avatar: '' },
];

const recentActivities = [
  { action: 'New user registered', user: 'Alice Johnson', time: '5 min ago', color: 'var(--accent)' },
  { action: 'Franchise listing approved', user: 'Pizza Palace', time: '12 min ago', color: 'var(--primary)' },
  { action: 'New report filed', user: 'Admin', time: '1 hour ago', color: 'var(--danger)' },
  { action: 'Payment received', user: 'FitZone Gym', time: '2 hours ago', color: 'var(--accent)' },
  { action: 'Company profile updated', user: 'Franchise Corp', time: '3 hours ago', color: 'var(--primary)' },
  { action: 'Support ticket closed', user: 'Support Team', time: '5 hours ago', color: '#F59E0B' },
];

export default function AdminDashboard() {
  return (
    <div>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Admin Dashboard</h1>
          <p style={s.subtitle}>Overview of your franchise platform</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="outline" size="sm" icon={<Download size={16} />}>Export</Button>
          <Button variant="primary" size="sm" icon={<Settings size={16} />}>Settings</Button>
        </div>
      </div>

      <div style={s.quickRow}>
        {[
          { label: 'Add User', icon: <PlusCircle size={16} />, variant: 'primary' },
          { label: 'New Listing', icon: <FileText size={16} />, variant: 'outline' },
          { label: 'View Reports', icon: <AlertTriangle size={16} />, variant: 'outline' },
          { label: 'Analytics', icon: <TrendingUp size={16} />, variant: 'outline' },
        ].map((btn, i) => (
          <Button key={i} variant={btn.variant} size="sm" icon={btn.icon}>{btn.label}</Button>
        ))}
      </div>

      <div style={s.stats}>
        {statCardsData.map((stat, i) => (
          <Card key={i} hover={false} padding="20px" style={s.statCard}>
            <div style={s.statHeader}>
              <div style={{ ...s.statIcon, backgroundColor: stat.bg, color: stat.color }}>{stat.icon}</div>
              <span style={{ ...s.statChange, color: stat.up ? 'var(--accent)' : 'var(--danger)' }}>
                {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.change}
              </span>
            </div>
            <div style={s.statVal}>{stat.value}</div>
            <div style={s.statLabel}>{stat.label}</div>
          </Card>
        ))}
      </div>

      <div style={s.grid2}>
        <Card hover={false} padding="0" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px 0' }}>
            <h2 style={s.sectionTitle}>Recent Users</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Name</th>
                  <th style={s.th}>Email</th>
                  <th style={s.th}>Role</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Joined</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u, i) => (
                  <tr key={i}>
                    <td style={s.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={u.name} size={32} />
                        <span style={{ fontWeight: 500 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={s.td}>{u.email}</td>
                    <td style={s.td}>{u.role}</td>
                    <td style={s.td}>
                      <Badge variant={u.status === 'Active' ? 'success' : u.status === 'Suspended' ? 'danger' : 'warning'}>{u.status}</Badge>
                    </td>
                    <td style={{ ...s.td, color: 'var(--text-muted)' }}>{u.date}</td>
                    <td style={s.td}>
                      <Dropdown
                        align="right"
                        trigger={
                          <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', padding: 4 }}>
                            <MoreHorizontal size={18} />
                          </button>
                        }
                      >
                        <DropdownItem icon={<Eye size={16} />}>View</DropdownItem>
                        <DropdownItem icon={<Edit3 size={16} />}>Edit</DropdownItem>
                        <DropdownItem icon={<Trash2 size={16} />} style={{ color: 'var(--danger)' }}>Delete</DropdownItem>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card hover={false}>
          <h2 style={s.sectionTitle}>Recent Activity</h2>
          {recentActivities.map((act, i) => (
            <div key={i} style={s.activityItem}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%', backgroundColor: act.color,
                marginTop: 6, flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14 }}>{act.action}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {act.user} • {act.time}
                </div>
              </div>
            </div>
          ))}
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
        <div style={s.chartPlaceholder}>
          <Building2 size={32} />
          <span>Listings Chart</span>
        </div>
        <div style={s.chartPlaceholder}>
          <Activity size={32} />
          <span>Engagement Chart</span>
        </div>
      </div>
    </div>
  );
}
