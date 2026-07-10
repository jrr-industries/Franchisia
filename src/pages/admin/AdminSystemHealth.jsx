import { useState, useEffect } from 'react';
import { Server, Database, Clock, HardDrive, Activity, Wifi, CheckCircle, XCircle } from 'lucide-react';
import Card from '../../components/ui/Card';

const API = '/api';

export default function AdminSystemHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      const [healthRes, dbRes] = await Promise.all([
        fetch(`${API}/admin/system-health`, { credentials: 'include' }),
        fetch(`${API}/health`, { credentials: 'include' }),
      ]);
      if (healthRes.ok) setHealth(await healthRes.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchHealth(); }, []);
  useEffect(() => {
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Loading system status...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>System Health</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Real-time platform status and performance metrics</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 24 }}>
        <Card hover={false} padding="20px">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: health?.database?.ok ? '#D1FAE5' : '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={20} color={health?.database?.ok ? '#10B981' : '#EF4444'} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Database</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>PostgreSQL (Neon)</div>
            </div>
            {health?.database?.ok ? <CheckCircle size={18} color="#10B981" style={{ marginLeft: 'auto' }} /> : <XCircle size={18} color="#EF4444" style={{ marginLeft: 'auto' }} />}
          </div>
          <div style={{ fontSize: 13, color: health?.database?.ok ? '#059669' : '#DC2626' }}>
            {health?.database?.ok ? 'Connected' : 'Disconnected'}
          </div>
        </Card>

        <Card hover={false} padding="20px">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={20} color="#3B82F6" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Uptime</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Server</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text)' }}>
            {health?.uptime ? `${Math.floor(health.uptime / 3600)}h ${Math.floor((health.uptime % 3600) / 60)}m` : '—'}
          </div>
        </Card>

        <Card hover={false} padding="20px">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HardDrive size={20} color="#8B5CF6" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Memory</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Heap Used</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text)' }}>
            {health?.memory ? `${(health.memory.heapUsed / 1024 / 1024).toFixed(1)} MB / ${(health.memory.heapTotal / 1024 / 1024).toFixed(1)} MB` : '—'}
          </div>
        </Card>

        <Card hover={false} padding="20px">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Server size={20} color="#F59E0B" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Node.js</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{health?.platform || '—'}</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text)' }}>
            {health?.nodeVersion || '—'}
          </div>
        </Card>
      </div>
    </div>
  );
}
