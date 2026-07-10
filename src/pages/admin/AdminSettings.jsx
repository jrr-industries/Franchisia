import { useState, useEffect } from 'react';
import { Settings2, Shield, Bell, Globe, ToggleLeft, ToggleRight, RefreshCw, Download } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const API = '/api';

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [maintenance, setMaintenance] = useState(false);
  const [flags, setFlags] = useState({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API}/admin/settings`, { credentials: 'include' });
        if (res.ok) { const d = await res.json(); setSettings(d); setMaintenance(d.maintenanceMode); setFlags(d.featureFlags || {}); }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchSettings();
  }, []);

  const toggleMaintenance = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/settings/maintenance`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ enabled: !maintenance }),
      });
      if (res.ok) { const d = await res.json(); setMaintenance(d.enabled); }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const toggleFlag = async (key, value) => {
    const newFlags = { ...flags, [key]: value };
    setFlags(newFlags);
    try {
      await fetch(`${API}/admin/settings`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ featureFlags: { [key]: value } }),
      });
    } catch (e) { console.error(e); }
  };

  if (loading) return <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Loading settings...</div>;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Settings</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Platform configuration and feature management</p>
      </div>

      {/* General */}
      <Card hover={false} padding="24px" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Globe size={20} color="#3B82F6" />
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>General</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 14 }}>
          <div>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>Platform Name</div>
            <div style={{ color: 'var(--text-secondary)' }}>{settings?.platformName || 'Franchisia'}</div>
          </div>
          <div>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>Version</div>
            <div style={{ color: 'var(--text-secondary)' }}>{settings?.version || '1.0.0'}</div>
          </div>
          <div>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>Theme</div>
            <div style={{ color: 'var(--text-secondary)' }}>{settings?.theme || 'System'}</div>
          </div>
        </div>
      </Card>

      {/* Maintenance Mode */}
      <Card hover={false} padding="24px" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: maintenance ? '#FEE2E2' : '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={20} color={maintenance ? '#EF4444' : '#10B981'} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Maintenance Mode</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>When enabled, only admins can access the platform</p>
          </div>
          <Badge variant={maintenance ? 'danger' : 'success'}>{maintenance ? 'Active' : 'Inactive'}</Badge>
        </div>
        <Button
          variant={maintenance ? 'danger' : 'primary'}
          onClick={toggleMaintenance}
          disabled={saving}
          icon={saving ? <RefreshCw size={14} className="spin" /> : null}
        >
          {maintenance ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
        </Button>
      </Card>

      {/* Feature Flags */}
      <Card hover={false} padding="24px" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ToggleLeft size={20} color="#8B5CF6" />
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Feature Flags</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Object.entries(flags).map(([key, value]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, textTransform: 'capitalize' }}>{key}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {value ? 'Enabled' : 'Disabled'}
                </div>
              </div>
              <button
                onClick={() => toggleFlag(key, !value)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: value ? 'var(--primary)' : 'var(--text-muted)', display: 'flex' }}
              >
                {value ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Data Export */}
      <Card hover={false} padding="24px">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Download size={20} color="#F59E0B" />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Data Export</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Export platform data for backup or analysis</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="outline" icon={<Download size={14} />}>Export Users (CSV)</Button>
          <Button variant="outline" icon={<Download size={14} />}>Export Companies (CSV)</Button>
          <Button variant="outline" icon={<Download size={14} />}>Export Reports (CSV)</Button>
        </div>
      </Card>
    </div>
  );
}
