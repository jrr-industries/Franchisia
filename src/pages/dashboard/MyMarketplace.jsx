import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, MoreHorizontal, Eye, Edit3, Copy, Archive, Trash2, Send,
  Store, Search as SearchIcon, Loader2,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import ListingForm from './ListingForm';

const API = '/api';

const statusTabs = [
  { key: 'draft', label: 'Draft', color: 'var(--text-muted)' },
  { key: 'active', label: 'Published', color: 'var(--success)' },
  { key: 'closed', label: 'Archived', color: 'var(--text-muted)' },
];

const statusBadge = (status) => {
  const map = {
    draft: { label: 'Draft', variant: 'default' },
    active: { label: 'Published', variant: 'success' },
    pending: { label: 'Pending', variant: 'warning' },
    suspended: { label: 'Suspended', variant: 'danger' },
    closed: { label: 'Archived', variant: 'info' },
  };
  return map[status] || { label: status, variant: 'default' };
};

export default function MyMarketplace() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusTab) params.set('status', statusTab);
      const res = await fetch(`${API}/listings/my?${params}`, { credentials: 'include' });
      if (res.ok) { const d = await res.json(); setListings(d.listings || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [statusTab]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const handleAction = async (id, action) => {
    try {
      const endpoints = {
        publish: `${API}/listings/${id}/publish`,
        unpublish: `${API}/listings/${id}/unpublish`,
        archive: `${API}/listings/${id}/close`,
        delete: `${API}/listings/${id}`,
        duplicate: `${API}/listings/${id}/duplicate`,
      };
      const endpoint = endpoints[action];
      if (!endpoint) return;
      const method = action === 'delete' ? 'DELETE' : action === 'duplicate' ? 'POST' : 'PUT';
      await fetch(endpoint, { method, credentials: 'include' });
      fetchListings();
    } catch (e) { console.error(e); }
  };

  const filtered = search
    ? listings.filter((l) => l.title.toLowerCase().includes(search.toLowerCase()))
    : listings;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>My Marketplace</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Manage your franchise listings</p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />} onClick={() => { setEditing(null); setFormOpen(true); }}>
          Create Listing
        </Button>
      </div>

      <Card hover={false} padding="20px">
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <SearchIcon size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search listings..." style={{ width: '100%', padding: '10px 16px 10px 36px', fontSize: 14, color: 'var(--text)', backgroundColor: 'var(--surface)', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)', outline: 'none' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          <button onClick={() => setStatusTab('')} style={{ padding: '8px 16px', fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', borderRadius: 8, backgroundColor: !statusTab ? 'var(--primary)' : 'transparent', color: !statusTab ? '#fff' : 'var(--text-secondary)' }}>All</button>
          {statusTabs.map((t) => (
            <button key={t.key} onClick={() => setStatusTab(t.key)} style={{ padding: '8px 16px', fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', borderRadius: 8, backgroundColor: statusTab === t.key ? 'var(--primary)' : 'transparent', color: statusTab === t.key ? '#fff' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: t.color }} />
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} /></div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
            <Store size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p style={{ fontSize: 16, marginBottom: 4 }}>No listings yet</p>
            <p style={{ fontSize: 14 }}>Create your first franchise listing to get started.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((l) => {
              const sb = statusBadge(l.status);
              return (
                <div key={l.id} style={{ display: 'flex', gap: 16, padding: 16, backgroundColor: 'var(--surface-container-low)', borderRadius: 12, alignItems: 'center' }}>
                  <div style={{ width: 72, height: 56, borderRadius: 8, backgroundColor: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                    {l.images?.[0] ? (
                      <img src={l.images[0]} alt={l.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Store size={24} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 600 }}>{l.title}</span>
                      <Badge variant={sb.variant}>{sb.label}</Badge>
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      <span>{l._count?.applications || 0} applications</span>
                      <span>{l.viewCount || 0} views</span>
                      <span>{l._count?.bookmarks || 0} followers</span>
                      <span>Created {new Date(l.createdAt).toLocaleDateString()}</span>
                      <span>Updated {new Date(l.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {l.status === 'draft' && (
                      <>
                        <Button variant="primary" size="sm" icon={<Send size={12} />} onClick={() => handleAction(l.id, 'publish')}>Publish</Button>
                        <Button variant="outline" size="sm" icon={<Edit3 size={12} />} onClick={() => { setEditing(l); setFormOpen(true); }}>Edit</Button>
                      </>
                    )}
                    {l.status === 'active' && (
                      <>
                        <Button variant="outline" size="sm" icon={<Eye size={12} />} onClick={() => window.open(`/listing/${l.slug}`, '_blank')}>View</Button>
                        <Button variant="outline" size="sm" icon={<Edit3 size={12} />} onClick={() => { setEditing(l); setFormOpen(true); }}>Edit</Button>
                        <Button variant="ghost" size="sm" onClick={() => handleAction(l.id, 'unpublish')}>Unpublish</Button>
                      </>
                    )}
                    {l.status === 'closed' && (
                      <Button variant="outline" size="sm" icon={<Eye size={12} />} onClick={() => window.open(`/listing/${l.slug}`, '_blank')}>View</Button>
                    )}
                    <div style={{ position: 'relative' }}>
                      <button onClick={() => {
                        const menu = document.getElementById(`menu-${l.id}`);
                        if (menu) menu.style.display = menu.style.display === 'none' ? 'flex' : 'none';
                      }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 6, display: 'flex', borderRadius: 8 }}>
                        <MoreHorizontal size={16} />
                      </button>
                      <div id={`menu-${l.id}`} style={{ display: 'none', position: 'absolute', right: 0, top: '100%', zIndex: 50, backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 4, flexDirection: 'column', minWidth: 140, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        {l.status === 'active' && <button onClick={() => { handleAction(l.id, 'unpublish'); document.getElementById(`menu-${l.id}`).style.display = 'none'; }} style={{ padding: '8px 12px', fontSize: 13, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8 }}><Send size={14} /> Unpublish</button>}
                        {l.status !== 'closed' && <button onClick={() => { handleAction(l.id, 'archive'); document.getElementById(`menu-${l.id}`).style.display = 'none'; }} style={{ padding: '8px 12px', fontSize: 13, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8 }}><Archive size={14} /> Archive</button>}
                        <button onClick={() => { handleAction(l.id, 'duplicate'); document.getElementById(`menu-${l.id}`).style.display = 'none'; }} style={{ padding: '8px 12px', fontSize: 13, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8 }}><Copy size={14} /> Duplicate</button>
                        <button onClick={() => { if (confirm('Delete this listing?')) { handleAction(l.id, 'delete'); } document.getElementById(`menu-${l.id}`).style.display = 'none'; }} style={{ padding: '8px 12px', fontSize: 13, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)' }}><Trash2 size={14} /> Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <AnimatePresence>
        {formOpen && (
          <ListingForm
            listing={editing}
            onClose={() => { setFormOpen(false); setEditing(null); }}
            onSaved={() => { setFormOpen(false); setEditing(null); fetchListings(); }}
          />
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
