import { useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, Moon, Sun, Menu } from 'lucide-react';
import Avatar from './ui/Avatar';
import Search from './ui/Search';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Dropdown, { DropdownItem } from './ui/Dropdown';

export default function Topbar({ onToggleSidebar }) {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header
      style={{
        height: 64,
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={onToggleSidebar}
          style={{ background: 'none', border: 'none', color: 'var(--text)', display: 'flex', padding: 4 }}
        >
          <Menu size={20} />
        </button>
        <Search placeholder="Search franchises, companies..." style={{ maxWidth: 360 }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={toggleTheme} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: 8, borderRadius: 8, display: 'flex' }}>
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button onClick={() => navigate('/messages')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: 8, borderRadius: 8, display: 'flex', position: 'relative' }}>
          <MessageSquare size={18} />
          <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--danger)' }} />
        </button>

        <button onClick={() => navigate('/notifications')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: 8, borderRadius: 8, display: 'flex', position: 'relative' }}>
          <Bell size={18} />
          <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--danger)' }} />
        </button>

        <Dropdown
          align="right"
          trigger={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <Avatar name={user?.name || 'User'} size={32} />
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{user?.name || 'User'}</span>
            </div>
          }
        >
          <DropdownItem onClick={() => navigate('/profile')}>Profile</DropdownItem>
          <DropdownItem onClick={() => navigate('/settings')}>Settings</DropdownItem>
          <DropdownItem onClick={() => { logout(); navigate('/'); }}>Logout</DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}
