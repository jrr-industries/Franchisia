import { useState, useEffect, useCallback } from 'react';
import { Settings2, Shield, Globe, ToggleLeft, ToggleRight, RefreshCw, Download, Plus, Trash2, Star, Building2, MessageSquare, Mail, Phone, MapPin, X, Save, Undo2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useSite, updateLiveStore } from '../../context/SiteContext';

const API = '/api';

export default function AdminSettings() {
  const { stats, setStats, testimonials, setTestimonials, brands, setBrands, contact, setContact, maintenanceMode, setMaintenanceMode } = useSite();

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [flags, setFlags] = useState({});
  const [toast, setToast] = useState(null);

  const [localStats, setLocalStats] = useState(null);
  const [localTestimonials, setLocalTestimonials] = useState(null);
  const [localBrands, setLocalBrands] = useState(null);
  const [localContact, setLocalContact] = useState(null);

  useEffect(() => {
    if (!loading && localStats === null) {
      setLocalStats(JSON.parse(JSON.stringify(stats)));
      setLocalTestimonials(JSON.parse(JSON.stringify(testimonials)));
      setLocalBrands(JSON.parse(JSON.stringify(brands)));
      setLocalContact(JSON.parse(JSON.stringify(contact)));
    }
  }, [loading, localStats, stats, testimonials, brands, contact]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API}/admin/settings`, { credentials: 'include' });
        if (res.ok) { const d = await res.json(); setSettings(d); setMaintenanceMode(d.maintenanceMode); setFlags(d.featureFlags || {}); }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchSettings();
  }, []);

  const showToast = useCallback((msg, isError) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const toggleMaintenance = async () => {
    const next = !maintenanceMode;
    setMaintenanceMode(next);
    updateLiveStore({ stats: localStats, testimonials: localTestimonials, brands: localBrands, contact: localContact, maintenanceMode: next });
    setSaving(true);
    try {
      await fetch(`${API}/admin/settings/maintenance`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ enabled: next }),
      });
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

  const saveToContext = useCallback(() => {
    if (!localStats) return;
    setStats(localStats);
    setTestimonials(localTestimonials);
    setBrands(localBrands);
    setContact(localContact);
  }, [localStats, localTestimonials, localBrands, localContact, setStats, setTestimonials, setBrands, setContact]);

  const handleSave = () => {
    const payload = { stats: localStats, testimonials: localTestimonials, brands: localBrands, contact: localContact };
    updateLiveStore(payload);
    saveToContext();
    fetch(`${API}/admin/site-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    }).catch(() => {});
    showToast('Changes saved successfully');
  };

  const handleDiscard = () => {
    setLocalStats(JSON.parse(JSON.stringify(stats)));
    setLocalTestimonials(JSON.parse(JSON.stringify(testimonials)));
    setLocalBrands(JSON.parse(JSON.stringify(brands)));
    setLocalContact(JSON.parse(JSON.stringify(contact)));
    showToast('Changes discarded', true);
  };

  const hasChanges = localStats !== null && (
    JSON.stringify(localStats) !== JSON.stringify(stats) ||
    JSON.stringify(localTestimonials) !== JSON.stringify(testimonials) ||
    JSON.stringify(localBrands) !== JSON.stringify(brands) ||
    JSON.stringify(localContact) !== JSON.stringify(contact)
  );

  if (loading) return <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Loading settings...</div>;

  return (
    <div>
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, padding: '12px 20px', backgroundColor: toast.includes('discarded') ? '#FEE2E2' : '#D1FAE5', color: toast.includes('discarded') ? '#991B1B' : '#065F46', borderRadius: 8, fontSize: 14, fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          {toast}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Settings</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Platform configuration and feature management</p>
      </div>

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

      <Card hover={false} padding="24px" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: maintenanceMode ? '#FEE2E2' : '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={20} color={maintenanceMode ? '#EF4444' : '#10B981'} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Maintenance Mode</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>When enabled, only admins can access the platform</p>
          </div>
          <Badge variant={maintenanceMode ? 'danger' : 'success'}>{maintenanceMode ? 'Active' : 'Inactive'}</Badge>
        </div>
        <Button
          variant={maintenanceMode ? 'danger' : 'primary'}
          onClick={toggleMaintenance}
          disabled={saving}
          icon={saving ? <RefreshCw size={14} className="spin" /> : null}
        >
          {maintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
        </Button>
      </Card>

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

      <Card hover={false} padding="24px" style={{ marginBottom: 20 }}>
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

      <Card hover={false} padding="24px" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#E8EEFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Settings2 size={20} color="#004ac6" />
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Site Content Management</h2>
        </div>

        {localStats && (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, justifyContent: 'flex-end' }}>
              <Button variant="outline" size="sm" icon={<Undo2 size={14} />} onClick={handleDiscard}>Discard</Button>
              <Button variant="primary" size="sm" icon={<Save size={14} />} onClick={handleSave} disabled={!hasChanges}>Save Changes</Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Star size={16} /> Statistics
                </h3>
                {localStats.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    <input value={s.value} onChange={(e) => {
      const s2 = [...localStats];
      s2[i] = { ...s2[i], value: e.target.value };
      setLocalStats(s2);
      updateLiveStore({ stats: s2, testimonials: localTestimonials, brands: localBrands, contact: localContact, maintenanceMode });
    }} style={{ width: 120, padding: '6px 10px', fontSize: 13, border: '1px solid var(--outline-variant)', borderRadius: 6, backgroundColor: 'var(--surface-container-low)' }} />
    <input value={s.label} onChange={(e) => {
      const s2 = [...localStats];
      s2[i] = { ...s2[i], label: e.target.value };
      setLocalStats(s2);
      updateLiveStore({ stats: s2, testimonials: localTestimonials, brands: localBrands, contact: localContact, maintenanceMode });
                    }} style={{ flex: 1, padding: '6px 10px', fontSize: 13, border: '1px solid var(--outline-variant)', borderRadius: 6, backgroundColor: 'var(--surface-container-low)' }} />
                    <button onClick={() => {
      const s2 = localStats.filter((_, j) => j !== i);
      setLocalStats(s2);
      updateLiveStore({ stats: s2, testimonials: localTestimonials, brands: localBrands, contact: localContact, maintenanceMode });
    }} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: 4, display: 'flex' }}><Trash2 size={14} /></button>
                </div>
              ))}
              <button onClick={() => {
                const s2 = [...localStats, { value: '', label: '' }];
                setLocalStats(s2);
                updateLiveStore({ stats: s2, testimonials: localTestimonials, brands: localBrands, contact: localContact, maintenanceMode });
                }} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '6px 0' }}><Plus size={14} /> Add Stat</button>
              </div>

              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MessageSquare size={16} /> Testimonials
                </h3>
                {localTestimonials.map((t, i) => (
                  <div key={i} style={{ padding: 12, backgroundColor: 'var(--surface-container-low)', borderRadius: 8, marginBottom: 8 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                      <input value={t.name} onChange={(e) => {
                        const t2 = [...localTestimonials];
                        t2[i] = { ...t2[i], name: e.target.value };
        setLocalTestimonials(t2);
        updateLiveStore({ stats: localStats, testimonials: t2, brands: localBrands, contact: localContact, maintenanceMode });
      }} placeholder="Name" style={{ flex: 1, padding: '6px 10px', fontSize: 13, border: '1px solid var(--outline-variant)', borderRadius: 6, backgroundColor: 'var(--surface)' }} />
      <input value={t.role} onChange={(e) => {
        const t2 = [...localTestimonials];
        t2[i] = { ...t2[i], role: e.target.value };
        setLocalTestimonials(t2);
        updateLiveStore({ stats: localStats, testimonials: t2, brands: localBrands, contact: localContact, maintenanceMode });
      }} placeholder="Role" style={{ flex: 1, padding: '6px 10px', fontSize: 13, border: '1px solid var(--outline-variant)', borderRadius: 6, backgroundColor: 'var(--surface)' }} />
      <select value={t.rating} onChange={(e) => {
        const t2 = [...localTestimonials];
        t2[i] = { ...t2[i], rating: parseInt(e.target.value) };
        setLocalTestimonials(t2);
        updateLiveStore({ stats: localStats, testimonials: t2, brands: localBrands, contact: localContact, maintenanceMode });
                      }} style={{ width: 60, padding: '6px', fontSize: 13, border: '1px solid var(--outline-variant)', borderRadius: 6, backgroundColor: 'var(--surface)' }}>
                        {[1,2,3,4,5].map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <button onClick={() => {
                        const t2 = localTestimonials.filter((_, j) => j !== i);
                        setLocalTestimonials(t2);
                        updateLiveStore({ stats: localStats, testimonials: t2, brands: localBrands, contact: localContact, maintenanceMode });
                      }} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: 4, display: 'flex' }}><Trash2 size={14} /></button>
                    </div>
                    <textarea value={t.text} onChange={(e) => {
                      const t2 = [...localTestimonials];
                      t2[i] = { ...t2[i], text: e.target.value };
                      setLocalTestimonials(t2);
                      updateLiveStore({ stats: localStats, testimonials: t2, brands: localBrands, contact: localContact, maintenanceMode });
                    }} placeholder="Testimonial text" style={{ width: '100%', padding: '6px 10px', fontSize: 13, border: '1px solid var(--outline-variant)', borderRadius: 6, backgroundColor: 'var(--surface)', resize: 'vertical', minHeight: 50 }} />
                  </div>
                ))}
                <button onClick={() => {
                  const t2 = [...localTestimonials, { name: '', role: '', text: '', rating: 5 }];
                  setLocalTestimonials(t2);
                  updateLiveStore({ stats: localStats, testimonials: t2, brands: localBrands, contact: localContact, maintenanceMode });
                }} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '6px 0' }}><Plus size={14} /> Add Testimonial</button>
              </div>

              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Building2 size={16} /> Trusted Brands
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {localBrands.map((b, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', backgroundColor: 'var(--surface-container-low)', borderRadius: 6 }}>
                      <input value={b} onChange={(e) => {
                        const b2 = [...localBrands];
                        b2[i] = e.target.value;
                        setLocalBrands(b2);
                        updateLiveStore({ stats: localStats, testimonials: localTestimonials, brands: b2, contact: localContact, maintenanceMode });
                      }} style={{ width: 100, padding: '4px 6px', fontSize: 12, border: '1px solid var(--outline-variant)', borderRadius: 4, backgroundColor: 'var(--surface)' }} />
                      <button onClick={() => {
                        const b2 = localBrands.filter((_, j) => j !== i);
                        setLocalBrands(b2);
                        updateLiveStore({ stats: localStats, testimonials: localTestimonials, brands: b2, contact: localContact, maintenanceMode });
                      }} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: 2, display: 'flex' }}><X size={12} /></button>
                    </div>
                  ))}
                  <button onClick={() => {
                    const b2 = [...localBrands, ''];
                    setLocalBrands(b2);
                    updateLiveStore({ stats: localStats, testimonials: localTestimonials, brands: b2, contact: localContact, maintenanceMode });
                  }} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', background: 'none', border: '1px dashed var(--outline-variant)', borderRadius: 6, color: 'var(--primary)', cursor: 'pointer', fontSize: 12 }}><Plus size={12} /> Add Brand</button>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={16} /> Contact Information
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Mail size={14} style={{ color: 'var(--on-surface-variant)' }} />
                    <input value={localContact.email} onChange={(e) => {
                      const c = { ...localContact, email: e.target.value };
                      setLocalContact(c);
                      updateLiveStore({ stats: localStats, testimonials: localTestimonials, brands: localBrands, contact: c, maintenanceMode });
                    }} style={{ flex: 1, padding: '6px 10px', fontSize: 13, border: '1px solid var(--outline-variant)', borderRadius: 6, backgroundColor: 'var(--surface-container-low)' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Phone size={14} style={{ color: 'var(--on-surface-variant)' }} />
                    <input value={localContact.phone} onChange={(e) => {
                      const c = { ...localContact, phone: e.target.value };
                      setLocalContact(c);
                      updateLiveStore({ stats: localStats, testimonials: localTestimonials, brands: localBrands, contact: c, maintenanceMode });
                    }} style={{ flex: 1, padding: '6px 10px', fontSize: 13, border: '1px solid var(--outline-variant)', borderRadius: 6, backgroundColor: 'var(--surface-container-low)' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MapPin size={14} style={{ color: 'var(--on-surface-variant)' }} />
                    <input value={localContact.address} onChange={(e) => {
                      const c = { ...localContact, address: e.target.value };
                      setLocalContact(c);
                      updateLiveStore({ stats: localStats, testimonials: localTestimonials, brands: localBrands, contact: c, maintenanceMode });
                    }} style={{ flex: 1, padding: '6px 10px', fontSize: 13, border: '1px solid var(--outline-variant)', borderRadius: 6, backgroundColor: 'var(--surface-container-low)' }} />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
