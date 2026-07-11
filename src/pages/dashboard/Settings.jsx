import { useState } from 'react';
import { Save, Bell, Moon } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { useTheme } from '../../context/ThemeContext';

function ToggleSwitch({ checked, onChange, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
      <span style={{ fontSize: 14 }}>{label}</span>
      <button
        onClick={() => onChange?.(!checked)}
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          border: 'none',
          backgroundColor: checked ? 'var(--primary)' : 'var(--border)',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background 0.2s',
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: '#fff',
            position: 'absolute',
            top: 2,
            left: checked ? 22 : 2,
            transition: 'left 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
        />
      </button>
    </div>
  );
}

export default function Settings() {
  const { isDark, toggleTheme } = useTheme();
  const { user, refreshSession } = useAuth();
  const { addToast } = useToast();

  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [preferences, setPreferences] = useState({ email: true, push: true, sms: false });

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fullName: profile.name,
          phone: profile.phone,
        }),
      });
      if (res.ok) {
        await refreshSession();
        addToast('Profile updated successfully', 'success');
      } else {
        addToast('Failed to update profile', 'error');
      }
    } catch {
      addToast('Failed to update profile', 'error');
    }
    setSaving(false);
  };

  const handleSavePreferences = async () => {
    setSavingPrefs(true);
    try {
      await new Promise((r) => setTimeout(r, 300));
      addToast('Preferences saved', 'success');
    } catch {
      addToast('Failed to save preferences', 'error');
    }
    setSavingPrefs(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Manage your account settings and preferences.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640 }}>
        <Card hover={false}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Save size={20} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>Profile Settings</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Full Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            <Input label="Email Address" type="email" value={profile.email} disabled />
            <Input label="Phone Number" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            <div style={{ marginTop: 4 }}>
              <Button size="sm" icon={<Save size={14} />} onClick={handleSaveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </div>
        </Card>

        <Card hover={false}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Bell size={20} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>Notification Preferences</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <ToggleSwitch label="Email Notifications" checked={preferences.email} onChange={(v) => setPreferences({ ...preferences, email: v })} />
            <div style={{ height: 1, backgroundColor: 'var(--border)', margin: '4px 0' }} />
            <ToggleSwitch label="Push Notifications" checked={preferences.push} onChange={(v) => setPreferences({ ...preferences, push: v })} />
            <div style={{ height: 1, backgroundColor: 'var(--border)', margin: '4px 0' }} />
            <ToggleSwitch label="SMS Notifications" checked={preferences.sms} onChange={(v) => setPreferences({ ...preferences, sms: v })} />
            <div style={{ marginTop: 12 }}>
              <Button size="sm" icon={<Bell size={14} />} onClick={handleSavePreferences} disabled={savingPrefs}>{savingPrefs ? 'Saving...' : 'Save Preferences'}</Button>
            </div>
          </div>
        </Card>

        <Card hover={false}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Moon size={20} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>Theme</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 14 }}>Appearance</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{isDark ? 'Dark mode is active' : 'Light mode is active'}</p>
            </div>
            <ToggleSwitch label="" checked={isDark} onChange={toggleTheme} />
          </div>
        </Card>

      </div>
    </div>
  );
}
