import { useState, useEffect } from 'react';
import { BarChart3, Loader2, Activity, MessageSquare, Heart, Briefcase } from 'lucide-react';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';

const API = '/api';

export default function Analytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API}/dashboard/stats`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load analytics');
        const data = await res.json();
        setStats(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Analytics</h1>
        <Card hover={false} padding="48px" style={{ textAlign: 'center' }}>
          <BarChart3 size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>Failed to load analytics</p>
        </Card>
      </div>
    );
  }

  const cards = [
    { label: 'Applications', value: stats?.applications || 0, icon: Briefcase, color: '#3B82F6' },
    { label: 'Messages', value: stats?.messages || 0, icon: MessageSquare, color: '#10B981' },
    { label: 'Followers', value: stats?.followers || 0, icon: Heart, color: '#EC4899' },
    { label: 'Opportunity Views', value: stats?.opportunityViews || 0, icon: Activity, color: '#F59E0B' },
    { label: 'Saved Listings', value: stats?.savedListings || 0, icon: BarChart3, color: '#8B5CF6' },
    { label: 'Connections', value: stats?.connections || 0, icon: BarChart3, color: '#14B8A6' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Analytics</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} hover={false} padding="20px">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} color={card.color} />
                </div>
                <div>
                  <p style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{card.value}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>{card.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      {stats && (
        <Card hover={false} padding="20px" style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14 }}>
            <div><strong>Total Opportunities:</strong> {stats.totalOpportunities || 0}</div>
            <div><strong>Open Opportunities:</strong> {stats.openOpportunities || 0}</div>
            <div><strong>Closed Opportunities:</strong> {stats.closedOpportunities || 0}</div>
            <div><strong>Companies Following:</strong> {stats.companiesFollowing || 0}</div>
            <div><strong>Notifications:</strong> {stats.notifications || 0}</div>
          </div>
        </Card>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
