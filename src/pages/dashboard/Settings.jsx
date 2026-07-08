import { useState } from 'react';
import { Save, Lock, Bell, Moon, Trash2, Eye, EyeOff } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

  const [profile, setProfile] = useState({ name: 'John Doe', email: 'john@example.com', phone: '+1 (555) 123-4567' });
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [preferences, setPreferences] = useState({ email: true, push: true, sms: false });

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const PasswordInput = ({ label, value, onChange, field }) => (
    <div style={{ position: 'relative' }}>
      <Input
        label={label}
        type={showPassword[field] ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange({ ...password, [field]: e.target.value })}
      />
      <button
        type="button"
        onClick={() => togglePasswordVisibility(field)}
        style={{
          position: 'absolute',
          right: 12,
          bottom: 10,
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          display: 'flex',
        }}
      >
        {showPassword[field] ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );

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
            <Input label="Email Address" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
            <Input label="Phone Number" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            <div style={{ marginTop: 4 }}>
              <Button size="sm" icon={<Save size={14} />}>Save Changes</Button>
            </div>
          </div>
        </Card>

        <Card hover={false}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Lock size={20} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>Change Password</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <PasswordInput label="Current Password" value={password.current} onChange={setPassword} field="current" />
            <PasswordInput label="New Password" value={password.new} onChange={setPassword} field="new" />
            <PasswordInput label="Confirm New Password" value={password.confirm} onChange={setPassword} field="confirm" />
            <div style={{ marginTop: 4 }}>
              <Button size="sm" icon={<Lock size={14} />}>Update Password</Button>
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
              <Button size="sm" icon={<Bell size={14} />}>Save Preferences</Button>
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

        <Card hover={false} style={{ borderColor: 'var(--danger)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Trash2 size={20} style={{ color: 'var(--danger)' }} />
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--danger)' }}>Danger Zone</h2>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button variant="danger" size="sm" icon={<Trash2 size={14} />} onClick={() => setShowDeleteModal(true)}>
            Delete Account
          </Button>
        </Card>
      </div>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Account" width={400}>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Are you sure you want to delete your account? This action cannot be undone. All your data, franchises, and messages will be permanently removed.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="secondary" size="sm" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" size="sm">Yes, Delete My Account</Button>
        </div>
      </Modal>
    </div>
  );
}
