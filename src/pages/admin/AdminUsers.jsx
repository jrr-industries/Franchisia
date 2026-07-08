import { useState, useEffect } from 'react';
import {
  Plus, MoreHorizontal, Eye, Edit3, Trash2, Mail, Shield,
  Filter, ArrowUpDown, UserCheck, UserX, ShieldCheck, Clock, XCircle, AlertCircle,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Search from '../../components/ui/Search';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import Dropdown, { DropdownItem } from '../../components/ui/Dropdown';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';

const API = 'http://localhost:3001/api';

const statusBadge = {
  pending_email_verification: { label: 'Pending Email', variant: 'warning' },
  pending_phone_verification: { label: 'Pending Phone', variant: 'warning' },
  pending_profile_completion: { label: 'Incomplete', variant: 'warning' },
  pending_admin_review: { label: 'Pending Review', variant: 'info' },
  verified: { label: 'Verified', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'danger' },
  need_more_information: { label: 'Needs Info', variant: 'warning' },
};

const roleLabels = {
  admin: 'Admin', franchisor: 'Franchisor', franchisee: 'Franchisee',
  consultant: 'Consultant', investor: 'Investor', supplier: 'Supplier',
};

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 700 },
  subtitle: { fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 },
  filters: { display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'flex-end' },
  filterItem: { minWidth: 180 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left', padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)',
    fontWeight: 500, borderBottom: '2px solid var(--border)', whiteSpace: 'nowrap',
  },
  td: { padding: '14px 16px', fontSize: 14, borderBottom: '1px solid var(--border)' },
  pagWrap: { padding: '16px 0', display: 'flex', justifyContent: 'center' },
};

export default function AdminUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const headers = { Authorization: `Bearer ${token}` };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: perPage });
      if (statusFilter) params.set('status', statusFilter);
      if (roleFilter) params.set('role', roleFilter);
      const res = await fetch(`${API}/admin/users?${params}`, { headers });
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token, page, roleFilter, statusFilter]);

  const handleToggleActive = async (userId, currentActive) => {
    try {
      await fetch(`${API}/admin/users/${userId}/toggle-active`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'franchisor', label: 'Franchisor' },
    { value: 'franchisee', label: 'Franchisee' },
    { value: 'consultant', label: 'Consultant' },
    { value: 'investor', label: 'Investor' },
    { value: 'supplier', label: 'Supplier' },
    { value: 'admin', label: 'Admin' },
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending_email_verification', label: 'Pending Email' },
    { value: 'pending_phone_verification', label: 'Pending Phone' },
    { value: 'pending_profile_completion', label: 'Incomplete' },
    { value: 'pending_admin_review', label: 'Pending Review' },
    { value: 'verified', label: 'Verified' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'need_more_information', label: 'Needs Info' },
  ];

  const filtered = users;
  const totalPages = Math.ceil(total / perPage);

  return (
    <div>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Users</h1>
          <p style={s.subtitle}>Manage all platform users ({total} total)</p>
        </div>
      </div>

      <Card hover={false} padding="20px" style={{ marginBottom: 24 }}>
        <div style={s.filters}>
          <div style={{ flex: 1, minWidth: 250 }}>
            <Search value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or email..." />
          </div>
          <div style={s.filterItem}>
            <Select
              options={roleOptions}
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              placeholder="All Roles"
            />
          </div>
          <div style={s.filterItem}>
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              placeholder="All Statuses"
            />
          </div>
          <Button variant="ghost" size="sm" icon={<Filter size={16} />}>Filters</Button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>User</th>
                <th style={s.th}>Email</th>
                <th style={s.th}>Role</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Joined</th>
                <th style={{ ...s.th, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>No users found</td></tr>
              ) : filtered.map((u) => {
                const sb = statusBadge[u.accountStatus] || { label: u.accountStatus, variant: 'default' };
                return (
                  <tr key={u.id}>
                    <td style={s.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={u.fullName} size={36} />
                        <span style={{ fontWeight: 500 }}>{u.fullName}</span>
                      </div>
                    </td>
                    <td style={{ ...s.td, color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={s.td}><Badge variant="info">{roleLabels[u.role] || u.role}</Badge></td>
                    <td style={s.td}>
                      <Badge variant={sb.variant}>{sb.label}</Badge>
                    </td>
                    <td style={{ ...s.td, color: 'var(--text-muted)', fontSize: 13 }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ ...s.td, textAlign: 'center' }}>
                      <Dropdown
                        align="right"
                        trigger={
                          <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', padding: 6, margin: '0 auto' }}>
                            <MoreHorizontal size={18} />
                          </button>
                        }
                      >
                        <DropdownItem icon={<Eye size={16} />}>View</DropdownItem>
                        <DropdownItem icon={<Edit3 size={16} />}>Edit</DropdownItem>
                        <DropdownItem icon={<Mail size={16} />}>Send Email</DropdownItem>
                        <DropdownItem
                          icon={u.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                          onClick={() => handleToggleActive(u.id, u.isActive)}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </DropdownItem>
                      </Dropdown>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={s.pagWrap}>
            <Pagination current={page} total={totalPages} onChange={setPage} />
          </div>
        )}
      </Card>
    </div>
  );
}
