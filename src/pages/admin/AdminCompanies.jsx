import { useState } from 'react';
import {
  Plus, MoreHorizontal, Eye, Edit3, Trash2, CheckCircle, XCircle,
  Filter, Building2, MapPin, Save, BarChart3, Info, Phone, Mail
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
import { useSite } from '../../context/SiteContext';

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 700 },
  subtitle: { fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 },
  filters: { display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'flex-end' },
  filterItem: { minWidth: 180 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, borderBottom: '2px solid var(--border)', whiteSpace: 'nowrap' },
  td: { padding: '14px 16px', fontSize: 14, borderBottom: '1px solid var(--border)' },
  pagWrap: { padding: '16px 0', display: 'flex', justifyContent: 'center' },
  tabRow: { display: 'flex', gap: 0, marginBottom: 24, borderBottom: '2px solid var(--border)' },
  tab: (active) => ({ padding: '12px 24px', fontSize: 14, fontWeight: 500, background: 'none', border: 'none', borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent', color: active ? 'var(--primary)' : 'var(--text-secondary)', marginBottom: -2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }),
  label: { fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 6 },
  input: { width: '100%', padding: '10px 16px', fontSize: 14, color: 'var(--text)', backgroundColor: 'var(--surface)', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)', outline: 'none' },
  textarea: { width: '100%', padding: '10px 16px', fontSize: 14, color: 'var(--text)', backgroundColor: 'var(--surface)', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)', outline: 'none', minHeight: 80, resize: 'vertical', fontFamily: 'inherit' },
  formGroup: { marginBottom: 16 },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  section: { marginBottom: 32 },
};

const tabs = [
  { id: 'companies', label: 'Companies', icon: Building2 },
  { id: 'stats', label: 'Homepage Stats', icon: BarChart3 },
  { id: 'about', label: 'About Page', icon: Info },
  { id: 'contact', label: 'Contact Info', icon: Phone },
];

const allCompanies = [
  { name: 'Pizza Palace', industry: 'Food & Beverage', owner: 'Bob Smith', listings: 12, status: 'Active', verified: true },
  { name: 'FitZone Gym', industry: 'Fitness', owner: 'Alice Johnson', listings: 8, status: 'Active', verified: true },
  { name: 'CleanPro Services', industry: 'Services', owner: 'David Brown', listings: 5, status: 'Pending', verified: false },
  { name: 'EduBright Learning', industry: 'Education', owner: 'Carol White', listings: 3, status: 'Active', verified: false },
  { name: 'TechFix Repairs', industry: 'Technology', owner: 'Frank Miller', listings: 7, status: 'Suspended', verified: true },
  { name: 'GreenLeaf Organics', industry: 'Retail', owner: 'Grace Wilson', listings: 4, status: 'Active', verified: false },
  { name: 'PetCare Plus', industry: 'Services', owner: 'Henry Taylor', listings: 6, status: 'Active', verified: true },
  { name: 'BrewHouse Cafe', industry: 'Food & Beverage', owner: 'Eve Davis', listings: 2, status: 'Inactive', verified: false },
];

const industryOptions = [
  { value: '', label: 'All Industries' },
  { value: 'Food & Beverage', label: 'Food & Beverage' },
  { value: 'Fitness', label: 'Fitness' },
  { value: 'Services', label: 'Services' },
  { value: 'Education', label: 'Education' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Retail', label: 'Retail' },
];

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Suspended', label: 'Suspended' },
  { value: 'Inactive', label: 'Inactive' },
];

function StatsEditor() {
  const { stats, setStats } = useSite();
  const [local, setLocal] = useState(stats.map((s) => ({ ...s })));

  const handleChange = (i, field, val) => {
    const updated = [...local];
    updated[i] = { ...updated[i], [field]: val };
    setLocal(updated);
  };

  const handleSave = () => {
    setStats(local);
  };

  return (
    <Card hover={false} padding="24px">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600 }}>Homepage Statistics</h2>
        <Button size="sm" icon={<Save size={16} />} onClick={handleSave}>Save Changes</Button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {local.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input style={{ ...s.input, flex: 1, fontFamily: "'JetBrains Mono', monospace" }} value={s.value} onChange={(e) => handleChange(i, 'value', e.target.value)} placeholder="Value" />
            <input style={{ ...s.input, flex: 2 }} value={s.label} onChange={(e) => handleChange(i, 'label', e.target.value)} placeholder="Label" />
          </div>
        ))}
      </div>
    </Card>
  );
}

function AboutEditor() {
  const { about, setAbout } = useSite();
  const [local, setLocal] = useState({ ...about, teamMembers: about.teamMembers.map((m) => ({ ...m })), timeline: about.timeline.map((t) => ({ ...t })) });

  const handleChange = (field, val) => setLocal({ ...local, [field]: val });
  const handleTeamChange = (i, field, val) => {
    const members = [...local.teamMembers];
    members[i] = { ...members[i], [field]: val };
    setLocal({ ...local, teamMembers: members });
  };
  const handleTimelineChange = (i, field, val) => {
    const tl = [...local.timeline];
    tl[i] = { ...tl[i], [field]: val };
    setLocal({ ...local, timeline: tl });
  };
  const handleSave = () => setAbout(local);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button size="sm" icon={<Save size={16} />} onClick={handleSave}>Save Changes</Button>
      </div>
      <Card hover={false} padding="24px" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Hero Section</h3>
        <div style={s.formGroup}>
          <label style={s.label}>Hero Title</label>
          <input style={s.input} value={local.heroTitle} onChange={(e) => handleChange('heroTitle', e.target.value)} />
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>Hero Description</label>
          <textarea style={s.textarea} value={local.heroDesc} onChange={(e) => handleChange('heroDesc', e.target.value)} />
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card hover={false} padding="24px">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Mission</h3>
          <textarea style={s.textarea} value={local.mission} onChange={(e) => handleChange('mission', e.target.value)} />
        </Card>
        <Card hover={false} padding="24px">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Vision</h3>
          <textarea style={s.textarea} value={local.vision} onChange={(e) => handleChange('vision', e.target.value)} />
        </Card>
      </div>

      <Card hover={false} padding="24px" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Team Members</h3>
        {local.teamMembers.map((m, i) => (
          <div key={i} style={{ ...s.formRow, marginBottom: 12, padding: 12, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
            <input style={s.input} value={m.name} onChange={(e) => handleTeamChange(i, 'name', e.target.value)} placeholder="Name" />
            <input style={s.input} value={m.role} onChange={(e) => handleTeamChange(i, 'role', e.target.value)} placeholder="Role" />
            <div style={{ gridColumn: '1 / -1' }}>
              <textarea style={{ ...s.textarea, minHeight: 60 }} value={m.bio} onChange={(e) => handleTeamChange(i, 'bio', e.target.value)} placeholder="Bio" />
            </div>
          </div>
        ))}
      </Card>

      <Card hover={false} padding="24px">
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Timeline</h3>
        {local.timeline.map((t, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
            <input style={{ ...s.input, width: 100, flexShrink: 0 }} value={t.year} onChange={(e) => handleTimelineChange(i, 'year', e.target.value)} placeholder="Year" />
            <input style={s.input} value={t.title} onChange={(e) => handleTimelineChange(i, 'title', e.target.value)} placeholder="Title" />
            <input style={{ ...s.input, flex: 2 }} value={t.desc} onChange={(e) => handleTimelineChange(i, 'desc', e.target.value)} placeholder="Description" />
          </div>
        ))}
      </Card>
    </div>
  );
}

function ContactEditor() {
  const { contact, setContact } = useSite();
  const [local, setLocal] = useState({ ...contact });

  const handleChange = (field, val) => setLocal({ ...local, [field]: val });
  const handleSave = () => setContact(local);

  return (
    <Card hover={false} padding="24px">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600 }}>Company Contact Information</h2>
        <Button size="sm" icon={<Save size={16} />} onClick={handleSave}>Save Changes</Button>
      </div>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
        This information appears in the footer and contact page.
      </p>
      <div style={s.formRow}>
        <div style={s.formGroup}>
          <label style={s.label}><Mail size={14} style={{ marginRight: 6 }} />Email Address</label>
          <input style={s.input} value={local.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="company@example.com" />
        </div>
        <div style={s.formGroup}>
          <label style={s.label}><Phone size={14} style={{ marginRight: 6 }} />Phone Number</label>
          <input style={s.input} value={local.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="+1 (555) 123-4567" />
        </div>
      </div>
      <div style={s.formGroup}>
        <label style={s.label}><MapPin size={14} style={{ marginRight: 6 }} />Address</label>
        <input style={s.input} value={local.address} onChange={(e) => handleChange('address', e.target.value)} placeholder="City, State" />
      </div>
    </Card>
  );
}

export default function AdminCompanies() {
  const [activeTab, setActiveTab] = useState('companies');
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 5;

  const filtered = allCompanies.filter((c) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.owner.toLowerCase().includes(search.toLowerCase());
    const matchIndustry = !industryFilter || c.industry === industryFilter;
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchIndustry && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Companies</h1>
          <p style={s.subtitle}>Manage companies and site content</p>
        </div>
      </div>

      <div style={s.tabRow}>
        {tabs.map((t) => (
          <button key={t.id} style={s.tab(activeTab === t.id)} onClick={() => setActiveTab(t.id)}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'companies' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <Button variant="primary" size="sm" icon={<Plus size={16} />}>Add Company</Button>
          </div>
          <Card hover={false} padding="20px">
            <div style={s.filters}>
              <div style={{ flex: 1, minWidth: 250 }}>
                <Search value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by company or owner..." />
              </div>
              <div style={s.filterItem}>
                <Select options={industryOptions} value={industryFilter} onChange={(e) => { setIndustryFilter(e.target.value); setPage(1); }} placeholder="All Industries" />
              </div>
              <div style={s.filterItem}>
                <Select options={statusOptions} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} placeholder="All Statuses" />
              </div>
              <Button variant="ghost" size="sm" icon={<Filter size={16} />}>Filters</Button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Company</th>
                    <th style={s.th}>Industry</th>
                    <th style={s.th}>Owner</th>
                    <th style={s.th}>Listings</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Verified</th>
                    <th style={{ ...s.th, textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((c, i) => (
                    <tr key={i}>
                      <td style={s.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={c.name} size={36} />
                          <span style={{ fontWeight: 500 }}>{c.name}</span>
                        </div>
                      </td>
                      <td style={s.td}><Badge variant="default">{c.industry}</Badge></td>
                      <td style={{ ...s.td, color: 'var(--text-secondary)' }}>{c.owner}</td>
                      <td style={s.td}><span style={{ fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{c.listings}</span></td>
                      <td style={s.td}>
                        <Badge variant={c.status === 'Active' ? 'success' : c.status === 'Suspended' ? 'danger' : c.status === 'Pending' ? 'warning' : 'default'}>{c.status}</Badge>
                      </td>
                      <td style={s.td}>
                        {c.verified ? <CheckCircle size={18} color="var(--accent)" /> : <XCircle size={18} color="var(--text-muted)" />}
                      </td>
                      <td style={{ ...s.td, textAlign: 'center' }}>
                        <Dropdown align="right" trigger={<button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', padding: 6, margin: '0 auto' }}><MoreHorizontal size={18} /></button>}>
                          <DropdownItem icon={<Eye size={16} />}>View</DropdownItem>
                          <DropdownItem icon={<Edit3 size={16} />}>Edit</DropdownItem>
                          <DropdownItem icon={<Building2 size={16} />}>Manage Listings</DropdownItem>
                          <DropdownItem icon={<Trash2 size={16} />} style={{ color: 'var(--danger)' }}>Delete</DropdownItem>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                  {paginated.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>No companies found</td></tr>
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
        </>
      )}

      {activeTab === 'stats' && <StatsEditor />}
      {activeTab === 'about' && <AboutEditor />}
      {activeTab === 'contact' && <ContactEditor />}
    </div>
  );
}
