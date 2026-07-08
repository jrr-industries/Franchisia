import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  MessageSquare,
  Briefcase,
  Eye,
  Calendar,
  ArrowRight,
  Plus,
  Search,
  Bell,
  ChevronRight,
  AlertCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';

const stats = [
  { label: 'Active Listings', value: '24', icon: <Briefcase size={22} />, color: '#2563EB', bg: '#DBEAFE' },
  { label: 'Messages', value: '18', icon: <MessageSquare size={22} />, color: '#10B981', bg: '#D1FAE5' },
  { label: 'Applications', value: '9', icon: <TrendingUp size={22} />, color: '#F59E0B', bg: '#FEF3C7' },
  { label: 'Profile Views', value: '1,342', icon: <Eye size={22} />, color: '#8B5CF6', bg: '#EDE9FE' },
];

const activities = [
  { id: 1, user: 'Sarah Johnson', action: 'submitted an application for', target: 'McDonald\'s Franchise', time: '2 min ago' },
  { id: 2, user: 'Mike Chen', action: 'sent you a message about', target: 'Subway Opportunity', time: '15 min ago' },
  { id: 3, user: 'Emily Rodriguez', action: 'shortlisted your franchise', target: 'KFC Outlet #42', time: '1 hr ago' },
  { id: 4, user: 'David Kim', action: 'requested a meeting for', target: 'Pizza Hut Expansion', time: '3 hr ago' },
  { id: 5, user: 'Lisa Thompson', action: 'viewed your profile', target: '', time: '5 hr ago' },
  { id: 6, user: 'James Wilson', action: 'left a review on', target: 'Burger King - Downtown', time: '1 day ago' },
];

const recommendations = [
  { name: 'McDonald\'s', industry: 'Fast Food', investment: '$150K - $350K', verified: true },
  { name: '7-Eleven', industry: 'Convenience Store', investment: '$50K - $120K', verified: true },
  { name: 'Anytime Fitness', industry: 'Fitness', investment: '$80K - $200K', verified: false },
];

const meetings = [
  { date: 'Today', company: 'Subway Franchising', time: '2:00 PM' },
  { date: 'Tomorrow', company: 'KFC Corp', time: '10:30 AM' },
  { date: 'Jul 12', company: 'Pizza Hut LLC', time: '3:00 PM' },
];

const quickActions = [
  { label: 'New Listing', icon: <Plus size={16} />, variant: 'primary' },
  { label: 'Discover', icon: <Search size={16} />, variant: 'outline' },
  { label: 'Messages', icon: <MessageSquare size={16} />, variant: 'outline' },
  { label: 'Notifications', icon: <Bell size={16} />, variant: 'outline' },
];

export default function DashboardHome() {
  const { user } = useAuth();

  const needsOnboarding = user && !['verified', 'pending_admin_review'].includes(user.accountStatus);

  const statusBanners = {
    pending_email_verification: { icon: AlertCircle, msg: 'Please verify your email address', to: '/verify-email', color: '#F59E0B', bg: '#FEF3C7' },
    pending_phone_verification: { icon: AlertCircle, msg: 'Please verify your phone number', to: '/verify-phone', color: '#F59E0B', bg: '#FEF3C7' },
    pending_profile_completion: { icon: AlertCircle, msg: 'Complete your profile to get started', to: '/select-role', color: '#F59E0B', bg: '#FEF3C7' },
    rejected: { icon: AlertCircle, msg: 'Your verification was rejected. Contact support.', to: '/account-status', color: '#DC2626', bg: '#FEE2E2' },
    need_more_information: { icon: AlertCircle, msg: 'Additional information required for verification', to: '/account-status', color: '#F59E0B', bg: '#FEF3C7' },
  };

  return (
    <div>
      {needsOnboarding && user.accountStatus !== 'pending_admin_review' && statusBanners[user.accountStatus] && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 20px', borderRadius: 'var(--radius-sm)',
          backgroundColor: statusBanners[user.accountStatus].bg,
          color: statusBanners[user.accountStatus].color,
          marginBottom: 20, fontSize: 14,
        }}>
          <AlertCircle size={20} />
          <span style={{ flex: 1, fontWeight: 500 }}>{statusBanners[user.accountStatus].msg}</span>
          <Link to={statusBanners[user.accountStatus].to} style={{
            color: statusBanners[user.accountStatus].color,
            fontWeight: 600, textDecoration: 'underline',
          }}>Fix it</Link>
        </div>
      )}

      {user?.accountStatus === 'pending_admin_review' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 20px', borderRadius: 'var(--radius-sm)',
          backgroundColor: '#EDE9FE', color: '#8B5CF6',
          marginBottom: 20, fontSize: 14,
        }}>
          <Clock size={20} />
          <span style={{ flex: 1, fontWeight: 500 }}>
            Your account is under admin review. You'll be notified once verified.
          </span>
          <Link to="/account-status" style={{ color: '#8B5CF6', fontWeight: 600, textDecoration: 'underline' }}>
            Check Status
          </Link>
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Welcome back, {user?.fullName || 'User'}!</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Here's what's happening with your franchises today.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        {stats.map((s) => (
          <Card key={s.label} hover={false} padding="20px">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, backgroundColor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                {s.icon}
              </div>
              <div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{s.label}</p>
                <p style={{ fontSize: 24, fontWeight: 700 }}>{s.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
        <Card hover={false}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>Recent Activity</h2>
            <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
              View All <ChevronRight size={16} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {activities.map((a) => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <Avatar name={a.user} size={36} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, lineHeight: 1.5 }}>
                    <strong>{a.user}</strong> {a.action}{' '}
                    {a.target && <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{a.target}</span>}
                  </p>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Card hover={false}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Upcoming Meetings</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {meetings.map((m) => (
                <div key={m.company} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'var(--primary-light)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: 11, fontWeight: 700 }}>
                    <Calendar size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>{m.company}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.date} at {m.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card hover={false}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Quick Actions</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {quickActions.map((a) => (
                <Button key={a.label} variant={a.variant} size="sm" icon={a.icon}>{a.label}</Button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card hover={false}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Recommended Franchises</h2>
          <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
            View All <ArrowRight size={16} />
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {recommendations.map((r) => (
            <Card key={r.name} padding="16px">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: 'var(--primary)' }}>
                  {r.name[0]}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{r.name}</span>
                    {r.verified && <Badge variant="success">Verified</Badge>}
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r.industry}</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Investment: <strong style={{ color: 'var(--text)' }}>{r.investment}</strong></span>
                <Button size="sm">View</Button>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}
