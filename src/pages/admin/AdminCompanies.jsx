import { useState, useEffect } from 'react';
import {
  Building2, Check, X, MoreHorizontal, Eye, Search as SearchIcon, Star, StarOff,
  Square, CheckSquare, Briefcase, MapPin, DollarSign, Users, MessageSquare, Activity,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import Dropdown, { DropdownItem } from '../../components/ui/Dropdown';
import Modal from '../../components/ui/Modal';

const API = '/api';

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [verifFilter, setVerifFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [profileModal, setProfileModal] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [profileTab, setProfileTab] = useState('overview');
  const perPage = 10;

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: perPage });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (verifFilter) params.set('isVerified', verifFilter);
      const res = await fetch(`${API}/admin/companies?${params}`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCompanies(data.companies || []);
      setTotal(data.total || 0);
      setSelected(new Set());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCompanies(); }, [page, statusFilter, verifFilter]);
  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchCompanies(); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const toggleSelect = (id) => {
    setSelected(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  const handleBulk = async (action) => {
    try {
      await fetch(`${API}/admin/companies/bulk-action`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ companyIds: Array.from(selected), action }),
      });
      setSelected(new Set()); fetchCompanies();
    } catch (e) { console.error(e); }
  };

  const handleVerify = async (id, isVerified) => {
    try { await fetch(`${API}/admin/companies/${id}/verify`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ isVerified }) }); fetchCompanies(); }
    catch (e) { console.error(e); }
  };

  const handleStatus = async (id, status) => {
    try { await fetch(`${API}/admin/companies/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ status }) }); fetchCompanies(); }
    catch (e) { console.error(e); }
  };

  const openProfile = async (company) => {
    setProfileModal(company);
    setProfileData(null);
    setProfileTab('overview');
    try {
      const res = await fetch(`${API}/admin/companies/${company.id}/profile`, { credentials: 'include' });
      if (res.ok) setProfileData(await res.json());
    } catch (e) { console.error(e); }
  };

  const totalPages = Math.ceil(total / perPage);

  function TabBtn({ active, onClick, children }) {
    return <button onClick={onClick} style={{ padding: '8px 16px', fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', borderRadius: 8, backgroundColor: active ? 'var(--primary)' : 'transparent', color: active ? '#fff' : 'var(--text-secondary)' }}>{children}</button>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h1 style={{ fontSize: 24, fontWeight: 700 }}>Companies</h1><p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>{total} total companies</p></div>
      </div>

      <Card hover={false} padding="20px" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 250 }}>
            <SearchIcon size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search companies..." style={{ width: '100%', padding: '10px 16px 10px 36px', fontSize: 14, color: 'var(--text)', backgroundColor: 'var(--surface)', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)', outline: 'none' }} />
          </div>
          <div style={{ minWidth: 150 }}>
            <Select options={[{ value: '', label: 'All Status' }, { value: 'active', label: 'Active' }, { value: 'pending', label: 'Pending' }, { value: 'suspended', label: 'Suspended' }, { value: 'inactive', label: 'Inactive' }]} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} />
          </div>
          <div style={{ minWidth: 150 }}>
            <Select options={[{ value: '', label: 'All Verification' }, { value: 'true', label: 'Verified' }, { value: 'false', label: 'Unverified' }]} value={verifFilter} onChange={(e) => { setVerifFilter(e.target.value); setPage(1); }} />
          </div>
        </div>

        {selected.size > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
            <CheckSquare size={16} color="var(--primary)" />
            <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{selected.size} selected</span>
            <Button size="sm" variant="primary" onClick={() => handleBulk('verify')}>Verify</Button>
            <Button size="sm" variant="outline" onClick={() => handleBulk('unverify')}>Unverify</Button>
            <Button size="sm" variant="outline" onClick={() => handleBulk('suspend')}>Suspend</Button>
            <Button size="sm" variant="outline" onClick={() => handleBulk('activate')}>Activate</Button>
            <Button size="sm" variant="danger" onClick={() => handleBulk('delete')}>Delete</Button>
            <button onClick={() => setSelected(new Set())} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={16} /></button>
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ width: 40, textAlign: 'left', padding: '12px 16px', borderBottom: '2px solid var(--border)' }}>
                  <button onClick={() => { if (selected.size === companies.length) setSelected(new Set()); else setSelected(new Set(companies.map(c => c.id))); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {selected.size === companies.length && companies.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
                  </button>
                </th>
                {['Company', 'Industry', 'Owner', 'Followers', 'Listings', 'Verified', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, borderBottom: '2px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : companies.length === 0 ? (
                <tr><td colSpan={9} style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>No companies found</td></tr>
              ) : companies.map((c) => (
                <tr key={c.id} style={{ backgroundColor: selected.has(c.id) ? 'var(--primary-light)' : 'transparent' }}>
                  <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                    <button onClick={() => toggleSelect(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      {selected.has(c.id) ? <CheckSquare size={16} color="var(--primary)" /> : <Square size={16} />}
                    </button>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => openProfile(c)}>
                      {c.logoUrl ? <img src={c.logoUrl} alt={c.name} style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} /> : <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={18} style={{ color: 'var(--primary)' }} /></div>}
                      <span style={{ fontWeight: 500 }}>{c.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{c.industry}</td>
                  <td style={{ padding: '14px 16px', fontSize: 14, borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{c.owner?.name || c.owner?.email || 'N/A'}</td>
                  <td style={{ padding: '14px 16px', fontSize: 14, borderBottom: '1px solid var(--border)' }}>{c._count?.followers || 0}</td>
                  <td style={{ padding: '14px 16px', fontSize: 14, borderBottom: '1px solid var(--border)' }}>{c._count?.listings || 0}</td>
                  <td style={{ padding: '14px 16px', fontSize: 14, borderBottom: '1px solid var(--border)' }}><Badge variant={c.isVerified ? 'success' : 'warning'}>{c.isVerified ? 'Verified' : 'Unverified'}</Badge></td>
                  <td style={{ padding: '14px 16px', fontSize: 14, borderBottom: '1px solid var(--border)' }}><Badge variant={c.status === 'active' ? 'success' : c.status === 'suspended' ? 'danger' : 'warning'}>{c.status}</Badge></td>
                  <td style={{ padding: '14px 16px', fontSize: 14, borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                    <Dropdown align="right" trigger={<button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', padding: 6, margin: '0 auto', cursor: 'pointer' }}><MoreHorizontal size={18} /></button>}>
                      <DropdownItem icon={<Eye size={16} />} onClick={() => openProfile(c)}>View Details</DropdownItem>
                      <DropdownItem icon={<Check size={16} />} onClick={() => handleVerify(c.id, !c.isVerified)}>{c.isVerified ? 'Unverify' : 'Verify'}</DropdownItem>
                      <DropdownItem icon={c.status === 'active' ? <X size={16} /> : <Check size={16} />} onClick={() => handleStatus(c.id, c.status === 'active' ? 'suspended' : 'active')}>{c.status === 'active' ? 'Suspend' : 'Activate'}</DropdownItem>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && <div style={{ padding: '16px 0', display: 'flex', justifyContent: 'center' }}><Pagination current={page} total={totalPages} onChange={setPage} /></div>}
      </Card>

      {/* Company Profile Modal */}
      {profileModal && (
        <Modal onClose={() => setProfileModal(null)}>
          <div style={{ padding: 24, maxWidth: 680, width: '90vw', maxHeight: '85vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
              {profileModal.logoUrl ? <img src={profileModal.logoUrl} alt={profileModal.name} style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover' }} /> : <div style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={28} color="var(--primary)" /></div>}
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>{profileModal.name}</h2>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{profileModal.industry} • {profileModal.owner?.name || 'No owner'}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button size="sm" variant={profileModal.isVerified ? 'outline' : 'primary'} onClick={() => { handleVerify(profileModal.id, !profileModal.isVerified); setProfileModal(null); }}>
                  {profileModal.isVerified ? 'Unverify' : 'Verify'}
                </Button>
                <Button size="sm" variant={profileModal.status === 'active' ? 'danger' : 'primary'} onClick={() => { handleStatus(profileModal.id, profileModal.status === 'active' ? 'suspended' : 'active'); setProfileModal(null); }}>
                  {profileModal.status === 'active' ? 'Suspend' : 'Activate'}
                </Button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
              {['overview', 'listings', 'activity'].map(tab => (
                <TabBtn key={tab} active={profileTab === tab} onClick={() => setProfileTab(tab)}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</TabBtn>
              ))}
            </div>

            {profileTab === 'overview' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14 }}>
                  <div><strong>Status:</strong> <Badge variant={profileModal.status === 'active' ? 'success' : profileModal.status === 'suspended' ? 'danger' : 'warning'}>{profileModal.status}</Badge></div>
                  <div><strong>Verified:</strong> {profileModal.isVerified ? 'Yes' : 'No'}</div>
                  <div><strong>Industry:</strong> {profileModal.industry}</div>
                  <div><strong>Created:</strong> {new Date(profileModal.createdAt).toLocaleDateString()}</div>
                </div>
                {profileData?.company && (
                  <div style={{ marginTop: 20 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Stats</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                      <Card hover={false} padding="12px" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>{profileData.company._count?.followers || 0}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Followers</div>
                      </Card>
                      <Card hover={false} padding="12px" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>{profileData.company._count?.listings || 0}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Listings</div>
                      </Card>
                      <Card hover={false} padding="12px" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>{profileData.company._count?.reviews || 0}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Reviews</div>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
            )}

            {profileTab === 'listings' && (
              <div>
                {profileData?.company?.listings?.length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {profileData.company.listings.map((l) => (
                      <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, backgroundColor: 'var(--bg)', borderRadius: 8 }}>
                        <Briefcase size={16} color="var(--primary)" />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, fontSize: 14 }}>{l.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            Status: {l.status} • Applications: {l._count?.applications || 0} • Created: {new Date(l.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No listings yet</div>}
              </div>
            )}

            {profileTab === 'activity' && (
              <div>
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                  Company activity timeline coming soon.
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
