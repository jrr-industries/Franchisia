import { useState } from 'react';
import {
  Plus, MoreHorizontal, Eye, Edit3, Trash2, Mail, Shield,
  Filter, ArrowUpDown, UserCheck, UserX
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
  formGroup: { marginBottom: 16 },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
};

const allUsers = [
  { name: 'Alice Johnson', email: 'alice@example.com', role: 'Investor', status: 'Active', date: 'Jan 15, 2026', avatar: '' },
  { name: 'Bob Smith', email: 'bob@example.com', role: 'Franchisor', status: 'Active', date: 'Feb 3, 2026', avatar: '' },
  { name: 'Carol White', email: 'carol@example.com', role: 'Admin', status: 'Suspended', date: 'Mar 12, 2026', avatar: '' },
  { name: 'David Brown', email: 'david@example.com', role: 'Consultant', status: 'Active', date: 'Feb 28, 2026', avatar: '' },
  { name: 'Eve Davis', email: 'eve@example.com', role: 'Investor', status: 'Pending', date: 'Jan 5, 2026', avatar: '' },
  { name: 'Frank Miller', email: 'frank@example.com', role: 'Franchisor', status: 'Active', date: 'Apr 1, 2026', avatar: '' },
  { name: 'Grace Wilson', email: 'grace@example.com', role: 'Consultant', status: 'Inactive', date: 'Dec 20, 2025', avatar: '' },
  { name: 'Henry Taylor', email: 'henry@example.com', role: 'Investor', status: 'Active', date: 'Mar 22, 2026', avatar: '' },
];

const roleOptions = [
  { value: '', label: 'All Roles' },
  { value: 'Investor', label: 'Investor' },
  { value: 'Franchisor', label: 'Franchisor' },
  { value: 'Consultant', label: 'Consultant' },
  { value: 'Admin', label: 'Admin' },
];

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Suspended', label: 'Suspended' },
  { value: 'Inactive', label: 'Inactive' },
];

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const perPage = 5;

  const filtered = allUsers.filter((u) => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    const matchStatus = !statusFilter || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const roleColors = { Investor: 'info', Franchisor: 'default', Consultant: 'warning', Admin: 'danger' };

  return (
    <div>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Users</h1>
          <p style={s.subtitle}>Manage all platform users</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus size={16} />} onClick={() => setShowAddModal(true)}>Add User</Button>
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
              {paginated.map((u, i) => (
                <tr key={i}>
                  <td style={s.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={u.name} size={36} />
                      <span style={{ fontWeight: 500 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ ...s.td, color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={s.td}><Badge variant={roleColors[u.role]}>{u.role}</Badge></td>
                  <td style={s.td}>
                    <Badge variant={u.status === 'Active' ? 'success' : u.status === 'Suspended' ? 'danger' : u.status === 'Pending' ? 'warning' : 'default'}>
                      {u.status}
                    </Badge>
                  </td>
                  <td style={{ ...s.td, color: 'var(--text-muted)' }}>{u.date}</td>
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
                      <DropdownItem icon={<Shield size={16} />}>Change Role</DropdownItem>
                      <DropdownItem icon={<Trash2 size={16} />} style={{ color: 'var(--danger)' }}>Delete</DropdownItem>
                    </Dropdown>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={s.pagWrap}>
            <Pagination current={page} total={totalPages} onChange={setPage} />
          </div>
        )}
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New User" width={520}>
        <div>
          <div style={s.formRow}>
            <div style={s.formGroup}>
              <label style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 6 }}>First Name</label>
              <input placeholder="John" style={{
                width: '100%', padding: '10px 16px', fontSize: 14, color: 'var(--text)',
                backgroundColor: 'var(--surface)', border: '2px solid var(--border)',
                borderRadius: 'var(--radius-sm)', outline: 'none',
              }} />
            </div>
            <div style={s.formGroup}>
              <label style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 6 }}>Last Name</label>
              <input placeholder="Doe" style={{
                width: '100%', padding: '10px 16px', fontSize: 14, color: 'var(--text)',
                backgroundColor: 'var(--surface)', border: '2px solid var(--border)',
                borderRadius: 'var(--radius-sm)', outline: 'none',
              }} />
            </div>
          </div>
          <div style={s.formGroup}>
            <label style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 6 }}>Email</label>
            <input placeholder="john@example.com" style={{
              width: '100%', padding: '10px 16px', fontSize: 14, color: 'var(--text)',
              backgroundColor: 'var(--surface)', border: '2px solid var(--border)',
              borderRadius: 'var(--radius-sm)', outline: 'none',
            }} />
          </div>
          <div style={s.formRow}>
            <div style={s.formGroup}>
              <label style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 6 }}>Role</label>
              <Select options={[
                { value: 'Investor', label: 'Investor' },
                { value: 'Franchisor', label: 'Franchisor' },
                { value: 'Consultant', label: 'Consultant' },
                { value: 'Admin', label: 'Admin' },
              ]} placeholder="Select role" />
            </div>
            <div style={s.formGroup}>
              <label style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 6 }}>Status</label>
              <Select options={[
                { value: 'Active', label: 'Active' },
                { value: 'Pending', label: 'Pending' },
              ]} placeholder="Select status" />
            </div>
          </div>
          <div style={s.formGroup}>
            <label style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 6 }}>Password</label>
            <input type="password" placeholder="••••••••" style={{
              width: '100%', padding: '10px 16px', fontSize: 14, color: 'var(--text)',
              backgroundColor: 'var(--surface)', border: '2px solid var(--border)',
              borderRadius: 'var(--radius-sm)', outline: 'none',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <Button variant="secondary" size="md" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button variant="primary" size="md">Create User</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
