import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, Save, Building2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useMasterData } from '../../hooks/useCMS';

const API = '/api';

const sections = ['basic', 'investment', 'territory', 'requirements', 'media', 'seo', 'contact'];

const sectionLabels = {
  basic: 'Basic Information',
  investment: 'Investment',
  territory: 'Territory',
  requirements: 'Requirements',
  media: 'Media',
  seo: 'SEO',
  contact: 'Contact Information',
};

export default function ListingForm({ listing, onClose, onSaved }) {
  const isEdit = !!listing;
  const [activeSection, setActiveSection] = useState('basic');
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState(null);
  const [policy, setPolicy] = useState(null);
  const [usePolicy, setUsePolicy] = useState(true);
  const { data: industries } = useMasterData('industries');
  const { data: businessTypes } = useMasterData('business-types');
  const { data: opportunityTypes } = useMasterData('opportunity-types');

  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    industry: '',
    businessType: '',
    opportunityType: '',
    images: [],
    videoUrl: '',
    investmentMin: '',
    investmentMax: '',
    roiPercentage: '',
    franchiseFee: '',
    royaltyFee: '',
    breakEvenMonths: '',
    location: '',
    city: '',
    state: '',
    country: '',
    isRemote: false,
    areaRequired: '',
    requirements: '',
    support: '',
    training: '',
    seoTitle: '',
    seoDescription: '',
    contactEmail: '',
    contactPhone: '',
  });

  useEffect(() => {
    const init = async () => {
      try {
        const [coRes, poRes] = await Promise.all([
          fetch(`${API}/companies/my`, { credentials: 'include' }),
          fetch(`${API}/policies/my`, { credentials: 'include' }),
        ]);
        if (coRes.ok) { const d = await coRes.json(); setCompany(d.company || d); }
        if (poRes.ok) { const d = await poRes.json(); const p = d.policies?.[0] || d.policy || d; setPolicy(p); }
      } catch (e) { console.error(e); }
    };
    init();
  }, []);

  useEffect(() => {
    if (listing) {
      setForm({
        title: listing.title || '',
        slug: listing.slug || '',
        description: listing.description || '',
        industry: listing.industry || '',
        businessType: listing.businessType || '',
        opportunityType: listing.opportunityType || '',
        images: listing.images || [],
        videoUrl: listing.videoUrl || '',
        investmentMin: listing.investmentMin || '',
        investmentMax: listing.investmentMax || '',
        roiPercentage: listing.roiPercentage || '',
        franchiseFee: listing.franchiseFee || '',
        royaltyFee: listing.royaltyFee || '',
        breakEvenMonths: listing.breakEvenMonths || '',
        location: listing.location || '',
        city: listing.city || '',
        state: listing.state || '',
        country: listing.country || '',
        isRemote: listing.isRemote || false,
        areaRequired: listing.areaRequired || '',
        requirements: listing.requirements || '',
        support: listing.support || '',
        training: listing.training || '',
        seoTitle: listing.seoTitle || '',
        seoDescription: listing.seoDescription || '',
        contactEmail: listing.contactEmail || '',
        contactPhone: listing.contactPhone || '',
      });
    }
  }, [listing]);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (!form.title?.trim()) { alert('Title is required'); setSaving(false); return; }
      if (!form.industry?.trim()) { alert('Industry is required'); setSaving(false); return; }

      const images = Array.isArray(form.images)
        ? form.images
        : form.images?.split('\n').map(s => s.trim()).filter(Boolean) || [];

      const body = {
        ...form,
        images,
        companyId: company?.id,
        slug: form.slug?.trim() || form.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        investmentMin: form.investmentMin ? parseFloat(form.investmentMin) : undefined,
        investmentMax: form.investmentMax ? parseFloat(form.investmentMax) : undefined,
        roiPercentage: form.roiPercentage ? parseFloat(form.roiPercentage) : undefined,
        franchiseFee: form.franchiseFee ? parseFloat(form.franchiseFee) : undefined,
        breakEvenMonths: form.breakEvenMonths ? parseInt(form.breakEvenMonths) : undefined,
      };
      Object.keys(body).forEach((k) => { if (body[k] === '' || body[k] === undefined) delete body[k]; });

      const url = isEdit ? `${API}/listings/${listing.id}` : `${API}/listings`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) { const e = await res.json(); alert(e.error || 'Failed to save'); return; }
      onSaved?.();
    } catch (e) { console.error(e); alert('Failed to save listing'); }
    finally { setSaving(false); }
  };

  const inp = (key, placeholder, opts = {}) => (
    <input
      value={form[key] ?? ''}
      onChange={(e) => update(key, opts.type === 'number' ? e.target.value : e.target.value)}
      placeholder={placeholder}
      type={opts.type || 'text'}
      style={{ width: '100%', padding: '10px 14px', fontSize: 14, border: '1px solid var(--border)', borderRadius: 8, backgroundColor: 'var(--background)', color: 'var(--text)', outline: 'none', boxSizing: 'border-box', ...(opts.style || {}) }}
    />
  );

  const textarea = (key, placeholder) => (
    <textarea
      value={form[key] ?? ''}
      onChange={(e) => update(key, e.target.value)}
      placeholder={placeholder}
      style={{ width: '100%', padding: '10px 14px', fontSize: 14, border: '1px solid var(--border)', borderRadius: 8, backgroundColor: 'var(--background)', color: 'var(--text)', outline: 'none', minHeight: 100, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
    />
  );

  const fieldGroup = (label, children) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );

  const renderBasic = () => (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {fieldGroup('Title *', inp('title', 'e.g. Quick Service Restaurant Franchise'))}
        {fieldGroup('Slug', inp('slug', 'auto-generated'))}
      </div>
      {fieldGroup('Description', textarea('description', 'Describe your franchise opportunity...'))}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {fieldGroup('Industry', (
          <select value={form.industry} onChange={(e) => update('industry', e.target.value)} style={{ width: '100%', padding: '10px 14px', fontSize: 14, border: '1px solid var(--border)', borderRadius: 8, backgroundColor: 'var(--background)', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }}>
            <option value="">Select Industry</option>
            {industries?.map?.((i) => <option key={i.id || i} value={i.name || i}>{i.name || i}</option>)}
          </select>
        ))}
        {fieldGroup('Business Type', (
          <select value={form.businessType} onChange={(e) => update('businessType', e.target.value)} style={{ width: '100%', padding: '10px 14px', fontSize: 14, border: '1px solid var(--border)', borderRadius: 8, backgroundColor: 'var(--background)', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }}>
            <option value="">Select Business Type</option>
            {(businessTypes?.items || []).map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
          </select>
        ))}
        {fieldGroup('Opportunity Type', (
          <select value={form.opportunityType} onChange={(e) => update('opportunityType', e.target.value)} style={{ width: '100%', padding: '10px 14px', fontSize: 14, border: '1px solid var(--border)', borderRadius: 8, backgroundColor: 'var(--background)', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }}>
            <option value="">Select Opportunity Type</option>
            {(opportunityTypes?.items || []).map((o) => <option key={o.id} value={o.name}>{o.name}</option>)}
          </select>
        ))}
      </div>
    </>
  );

  const renderInvestment = () => (
    <>
      {usePolicy && policy && (
        <div style={{ marginBottom: 20, padding: 16, backgroundColor: 'var(--surface-container-low)', borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building2 size={18} color="var(--primary)" />
              <span style={{ fontSize: 14, fontWeight: 600 }}>Use Current Company Policy</span>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: 40, height: 22 }}>
              <input type="checkbox" checked={usePolicy} onChange={(e) => setUsePolicy(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
              <span style={{ position: 'absolute', inset: 0, backgroundColor: usePolicy ? 'var(--primary)' : 'var(--border)', borderRadius: 11, transition: '0.2s', cursor: 'pointer' }}>
                <span style={{ position: 'absolute', left: usePolicy ? 20 : 2, top: 2, width: 18, height: 18, borderRadius: '50%', backgroundColor: '#fff', transition: '0.2s' }} />
              </span>
            </label>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            <p>Policy v{policy.version} • {policy.isActive ? 'Active' : 'Draft'}</p>
            {policy.franchiseFee && <p>Franchise Fee: {policy.franchiseFee}</p>}
            {policy.royaltyFee && <p>Royalty Fee: {policy.royaltyFee}</p>}
          </div>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {fieldGroup('Min Investment ($)', inp('investmentMin', 'e.g. 50000', { type: 'number' }))}
        {fieldGroup('Max Investment ($)', inp('investmentMax', 'e.g. 200000', { type: 'number' }))}
        {fieldGroup('ROI (%)', inp('roiPercentage', 'e.g. 25', { type: 'number' }))}
        {fieldGroup('Franchise Fee ($)', inp('franchiseFee', 'e.g. 30000', { type: 'number' }))}
        {fieldGroup('Royalty Fee', inp('royaltyFee', 'e.g. 6%'))}
        {fieldGroup('Break-even (months)', inp('breakEvenMonths', 'e.g. 18', { type: 'number' }))}
      </div>
    </>
  );

  const renderTerritory = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {fieldGroup('Location', inp('location', 'e.g. Downtown, City Center'))}
      {fieldGroup('City', inp('city', 'e.g. New York'))}
      {fieldGroup('State', inp('state', 'e.g. NY'))}
      {fieldGroup('Country', inp('country', 'e.g. United States'))}
      {fieldGroup('Area Required', inp('areaRequired', 'e.g. 1000 sq ft'))}
      <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 10 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.isRemote} onChange={(e) => update('isRemote', e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--primary)' }} />
          <span style={{ fontSize: 14 }}>Remote opportunity</span>
        </label>
      </div>
    </div>
  );

  const renderRequirements = () => (
    <>
      {fieldGroup('Requirements', textarea('requirements', 'List the requirements for potential franchisees...'))}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {fieldGroup('Support Offered', textarea('support', 'Describe the support you provide...'))}
        {fieldGroup('Training Provided', textarea('training', 'Describe the training program...'))}
      </div>
    </>
  );

  const renderMedia = () => (
    <>
      {fieldGroup('Image URLs (one per line)', textarea('images', 'https://example.com/image1.jpg\nhttps://example.com/image2.jpg'))}
      {fieldGroup('Video URL', inp('videoUrl', 'https://youtube.com/watch?v=...'))}
    </>
  );

  const renderSeo = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {fieldGroup('SEO Title', inp('seoTitle', 'Meta title for search engines'))}
      {fieldGroup('SEO Description', textarea('seoDescription', 'Meta description for search engines'))}
    </div>
  );

  const renderContact = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {fieldGroup('Contact Email', inp('contactEmail', 'franchise@company.com'))}
      {fieldGroup('Contact Phone', inp('contactPhone', '+1 (555) 123-4567'))}
    </div>
  );

  const sectionContent = {
    basic: renderBasic,
    investment: renderInvestment,
    territory: renderTerritory,
    requirements: renderRequirements,
    media: renderMedia,
    seo: renderSeo,
    contact: renderContact,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 24 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: 'var(--surface)', borderRadius: 16, width: '100%', maxWidth: 800, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>{isEdit ? 'Edit Listing' : 'Create Listing'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, display: 'flex', borderRadius: 8 }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 4, padding: '16px 24px', borderBottom: '1px solid var(--border)', overflow: 'auto' }}>
          {sections.map((s) => (
            <button
              key={s}
              onClick={() => setActiveSection(s)}
              style={{ padding: '8px 14px', fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', borderRadius: 8, whiteSpace: 'nowrap', backgroundColor: activeSection === s ? 'var(--primary)' : 'transparent', color: activeSection === s ? '#fff' : 'var(--text-secondary)', transition: 'all 0.15s' }}
            >
              {sectionLabels[s]}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          {sectionContent[activeSection]()}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" icon={saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Update Listing' : 'Create Listing'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
