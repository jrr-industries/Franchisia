import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Briefcase, DollarSign, MapPin, FileText, MessageSquare,
  CheckCircle, ChevronLeft, ChevronRight, Upload, X, Loader2,
  Building2, Globe, Calendar, Link, Camera, Check, ShieldCheck,
  Award, BarChart3, TrendingUp, Banknote, Clock, Download,
} from 'lucide-react';
import Button from './ui/Button';
import { useToast } from './ui/Toast';
import { useAuth } from '../context/AuthContext';

const API = '/api';

const steps = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'business', label: 'Business', icon: Briefcase },
  { id: 'financial', label: 'Financial', icon: DollarSign },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'cover', label: 'Cover Letter', icon: MessageSquare },
  { id: 'terms', label: 'Terms', icon: CheckCircle },
];

const emptyForm = {
  personalInfo: {
    fullName: '', email: '', phone: '', dateOfBirth: '',
    currentCountry: '', currentState: '', currentCity: '',
    currentOccupation: '', linkedInProfile: '', profilePhoto: '',
  },
  businessInfo: {
    yearsOfExperience: '', currentBusiness: '', currentCompany: '',
    previousFranchiseExperience: false, preferredIndustry: '',
    preferredBusinessModel: '',
  },
  financialInfo: {
    investmentBudget: '', netWorth: '', availableLiquidCapital: '',
    fundingSource: '', ownCapital: '', bankLoan: '', investor: '', other: '',
    expectedTimeline: '',
  },
  locationPreference: {
    preferredCountry: '', preferredState: '', preferredCity: '',
    preferredTerritory: '', isRemote: false,
  },
  coverLetter: '',
  acceptedPolicyVersion: null,
  acceptedPolicyTerms: null,
  acceptedAt: null,
};

const fundingOptions = ['Own Capital', 'Bank Loan', 'Investor', 'Other'];

const docTypes = [
  { id: 'resume', label: 'Resume / CV' },
  { id: 'government_id', label: 'Government ID' },
  { id: 'business_registration', label: 'Business Registration' },
  { id: 'financial_statement', label: 'Financial Statement' },
  { id: 'net_worth_proof', label: 'Net Worth Proof' },
  { id: 'business_proposal', label: 'Business Proposal' },
  { id: 'additional', label: 'Additional Document' },
];

export default function ApplyWizard({ listing, company, onClose, onApplied }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [policyAccepted, setPolicyAccepted] = useState(null);
  const [showPolicies, setShowPolicies] = useState(false);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          fullName: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          currentCountry: user.country || '',
          currentState: user.state || '',
          currentCity: user.city || '',
          profilePhoto: user.image || '',
        },
      }));
    }
  }, [user]);

  const update = useCallback((section, field, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const validateStep = (stepIdx) => {
    const errs = {};
    const s = steps[stepIdx].id;

    if (s === 'personal') {
      const p = form.personalInfo;
      if (!p.fullName?.trim()) errs.fullName = 'Required';
      if (!p.email?.trim()) errs.email = 'Required';
      if (!p.phone?.trim()) errs.phone = 'Required';
      if (!p.currentCountry?.trim()) errs.currentCountry = 'Required';
      if (!p.currentOccupation?.trim()) errs.currentOccupation = 'Required';
    }
    if (s === 'business') {
      const b = form.businessInfo;
      if (!b.yearsOfExperience) errs.yearsOfExperience = 'Required';
      if (!b.preferredIndustry?.trim()) errs.preferredIndustry = 'Required';
    }
    if (s === 'financial') {
      const f = form.financialInfo;
      if (!f.investmentBudget) errs.investmentBudget = 'Required';
      if (!f.netWorth) errs.netWorth = 'Required';
    }
    if (s === 'location') {
      const l = form.locationPreference;
      if (!l.preferredCountry?.trim()) errs.preferredCountry = 'Required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleFileUpload = async (docType) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.docx,.doc,.jpg,.jpeg,.png';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(docType);
      try {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch(`${API}/uploads/application-document`, {
          method: 'POST', credentials: 'include', body: fd,
        });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        setDocuments((prev) => [
          ...prev,
          { type: docType, fileName: data.fileName || file.name, url: data.url, uploadedAt: new Date().toISOString() },
        ]);
        addToast('Document uploaded', 'success');
      } catch {
        addToast('Upload failed', 'error');
      } finally {
        setUploading(null);
      }
    };
    input.click();
  };

  const removeDocument = (idx) => {
    setDocuments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!policyAccepted) {
      addToast('Please accept the franchise terms', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        listingId: listing.id,
        personalInfo: form.personalInfo,
        businessInfo: form.businessInfo,
        financialInfo: form.financialInfo,
        locationPreference: form.locationPreference,
        coverLetter: form.coverLetter?.trim() || null,
        acceptedPolicyVersion: policyAccepted?.policyVersion || null,
        acceptedPolicyTerms: 'I have read and agree to the company\'s Franchise Policies & Terms.',
        acceptedAt: policyAccepted?.acceptedAt || null,
      };

      const res = await fetch(`${API}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        addToast(err.error || 'Failed to submit', 'error');
        return;
      }

      const application = await res.json();

      if (documents.length > 0) {
        await Promise.all(documents.map((doc) =>
          fetch(`${API}/applications/${application.id}/documents`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(doc),
          })
        ));
      }

      addToast('Application submitted successfully!', 'success');
      onApplied?.(application);
    } catch {
      addToast('Network error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const stepProgress = ((step + 1) / steps.length) * 100;

  const renderPersonal = () => {
    const p = form.personalInfo;
    return (
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Personal Information</h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>Tell us about yourself</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Full Name *" error={errors.fullName}>
            <input value={p.fullName} onChange={(e) => update('personalInfo', 'fullName', e.target.value)} placeholder="John Doe" style={inpStyle(errors.fullName)} />
          </Field>
          <Field label="Email *" error={errors.email}>
            <input value={p.email} onChange={(e) => update('personalInfo', 'email', e.target.value)} placeholder="john@example.com" style={inpStyle(errors.email)} />
          </Field>
          <Field label="Phone Number *" error={errors.phone}>
            <input value={p.phone} onChange={(e) => update('personalInfo', 'phone', e.target.value)} placeholder="+1 (555) 123-4567" style={inpStyle(errors.phone)} />
          </Field>
          <Field label="Date of Birth (optional)">
            <input type="date" value={p.dateOfBirth} onChange={(e) => update('personalInfo', 'dateOfBirth', e.target.value)} style={inpStyle()} />
          </Field>
          <Field label="Current Country *" error={errors.currentCountry}>
            <input value={p.currentCountry} onChange={(e) => update('personalInfo', 'currentCountry', e.target.value)} placeholder="United States" style={inpStyle(errors.currentCountry)} />
          </Field>
          <Field label="Current State">
            <input value={p.currentState} onChange={(e) => update('personalInfo', 'currentState', e.target.value)} placeholder="California" style={inpStyle()} />
          </Field>
          <Field label="Current City">
            <input value={p.currentCity} onChange={(e) => update('personalInfo', 'currentCity', e.target.value)} placeholder="Los Angeles" style={inpStyle()} />
          </Field>
          <Field label="Current Occupation *" error={errors.currentOccupation}>
            <input value={p.currentOccupation} onChange={(e) => update('personalInfo', 'currentOccupation', e.target.value)} placeholder="Business Owner" style={inpStyle(errors.currentOccupation)} />
          </Field>
          <Field label="LinkedIn Profile (optional)">
            <input value={p.linkedInProfile} onChange={(e) => update('personalInfo', 'linkedInProfile', e.target.value)} placeholder="https://linkedin.com/in/johndoe" style={inpStyle()} />
          </Field>
          <Field label="Profile Photo (optional)">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {p.profilePhoto ? (
                <img src={p.profilePhoto} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  <Camera size={20} />
                </div>
              )}
              <input value={p.profilePhoto} onChange={(e) => update('personalInfo', 'profilePhoto', e.target.value)} placeholder="Image URL" style={{ ...inpStyle(), flex: 1 }} />
            </div>
          </Field>
        </div>
      </div>
    );
  };

  const renderBusiness = () => {
    const b = form.businessInfo;
    return (
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Business Information</h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>Your business background and experience</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Years of Experience *" error={errors.yearsOfExperience}>
            <select value={b.yearsOfExperience} onChange={(e) => update('businessInfo', 'yearsOfExperience', e.target.value)} style={selStyle(errors.yearsOfExperience)}>
              <option value="">Select years</option>
              {['0-1', '1-3', '3-5', '5-10', '10+'].map((y) => (
                <option key={y} value={y}>{y} years</option>
              ))}
            </select>
          </Field>
          <Field label="Current Business (optional)">
            <input value={b.currentBusiness} onChange={(e) => update('businessInfo', 'currentBusiness', e.target.value)} placeholder="Restaurant, Retail, etc." style={inpStyle()} />
          </Field>
          <Field label="Current Company (optional)">
            <input value={b.currentCompany} onChange={(e) => update('businessInfo', 'currentCompany', e.target.value)} placeholder="Company name" style={inpStyle()} />
          </Field>
          <Field label="Previous Franchise Experience">
            <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="radio" checked={b.previousFranchiseExperience === true} onChange={() => update('businessInfo', 'previousFranchiseExperience', true)} style={{ accentColor: 'var(--primary)' }} />
                Yes
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="radio" checked={b.previousFranchiseExperience === false} onChange={() => update('businessInfo', 'previousFranchiseExperience', false)} style={{ accentColor: 'var(--primary)' }} />
                No
              </label>
            </div>
          </Field>
          <Field label="Preferred Industry *" error={errors.preferredIndustry}>
            <input value={b.preferredIndustry} onChange={(e) => update('businessInfo', 'preferredIndustry', e.target.value)} placeholder="Food & Beverage, Retail, etc." style={inpStyle(errors.preferredIndustry)} />
          </Field>
          <Field label="Preferred Business Model (optional)">
            <input value={b.preferredBusinessModel} onChange={(e) => update('businessInfo', 'preferredBusinessModel', e.target.value)} placeholder="Single Unit, Multi-Unit, Master Franchise" style={inpStyle()} />
          </Field>
        </div>
      </div>
    );
  };

  const renderFinancial = () => {
    const f = form.financialInfo;
    return (
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Financial Information</h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>Your financial capability</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Investment Budget *" error={errors.investmentBudget}>
            <input type="number" value={f.investmentBudget} onChange={(e) => update('financialInfo', 'investmentBudget', e.target.value)} placeholder="50000" style={inpStyle(errors.investmentBudget)} />
          </Field>
          <Field label="Net Worth *" error={errors.netWorth}>
            <input type="number" value={f.netWorth} onChange={(e) => update('financialInfo', 'netWorth', e.target.value)} placeholder="200000" style={inpStyle(errors.netWorth)} />
          </Field>
          <Field label="Available Liquid Capital">
            <input type="number" value={f.availableLiquidCapital} onChange={(e) => update('financialInfo', 'availableLiquidCapital', e.target.value)} placeholder="100000" style={inpStyle()} />
          </Field>
          <Field label="Expected Timeline">
            <select value={f.expectedTimeline} onChange={(e) => update('financialInfo', 'expectedTimeline', e.target.value)} style={selStyle()}>
              <option value="">Select timeline</option>
              <option value="immediate">Immediate</option>
              <option value="3-6 months">3-6 Months</option>
              <option value="6-12 months">6-12 Months</option>
              <option value="12+ months">12+ Months</option>
            </select>
          </Field>
        </div>
        <Field label="Funding Source" style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {fundingOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => update('financialInfo', 'fundingSource', f.fundingSource === opt ? '' : opt)}
                style={{
                  padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                  border: `1px solid ${f.fundingSource === opt ? 'var(--primary)' : 'var(--border)'}`,
                  backgroundColor: f.fundingSource === opt ? 'var(--primary-light)' : 'var(--surface)',
                  color: f.fundingSource === opt ? 'var(--primary)' : 'var(--text-secondary)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </Field>
      </div>
    );
  };

  const renderLocation = () => {
    const l = form.locationPreference;
    return (
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Location Preference</h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>Where would you like to operate?</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Preferred Country *" error={errors.preferredCountry}>
            <input value={l.preferredCountry} onChange={(e) => update('locationPreference', 'preferredCountry', e.target.value)} placeholder="United States" style={inpStyle(errors.preferredCountry)} />
          </Field>
          <Field label="Preferred State">
            <input value={l.preferredState} onChange={(e) => update('locationPreference', 'preferredState', e.target.value)} placeholder="California" style={inpStyle()} />
          </Field>
          <Field label="Preferred City">
            <input value={l.preferredCity} onChange={(e) => update('locationPreference', 'preferredCity', e.target.value)} placeholder="Los Angeles" style={inpStyle()} />
          </Field>
          <Field label="Preferred Territory">
            <input value={l.preferredTerritory} onChange={(e) => update('locationPreference', 'preferredTerritory', e.target.value)} placeholder="Downtown / Metro Area" style={inpStyle()} />
          </Field>
          <Field label="Remote / Local">
            <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="radio" checked={l.isRemote === true} onChange={() => update('locationPreference', 'isRemote', true)} style={{ accentColor: 'var(--primary)' }} />
                Remote
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="radio" checked={l.isRemote === false} onChange={() => update('locationPreference', 'isRemote', false)} style={{ accentColor: 'var(--primary)' }} />
                Local
              </label>
            </div>
          </Field>
        </div>
      </div>
    );
  };

  const renderDocuments = () => (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Documents</h3>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
        Upload supporting documents (PDF, DOCX, JPG, PNG)
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {docTypes.map((dt) => {
          const existing = documents.find((d) => d.type === dt.id);
          return (
            <div key={dt.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderRadius: 8, backgroundColor: 'var(--surface-container-low)',
              border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <FileText size={18} color="var(--primary)" />
                <div>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{dt.label}</span>
                  {existing && (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>
                      {existing.fileName}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {existing ? (
                  <button onClick={() => removeDocument(documents.indexOf(existing))}
                    style={{ padding: '6px 10px', borderRadius: 6, border: 'none', backgroundColor: '#FEE2E2', color: '#991B1B', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <X size={14} /> Remove
                  </button>
                ) : (
                  <button onClick={() => handleFileUpload(dt.id)} disabled={uploading === dt.id}
                    style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {uploading === dt.id ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={14} />}
                    Upload
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderCoverLetter = () => (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Cover Letter</h3>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
        Tell the franchisor why you're interested and what makes you a suitable partner
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Why are you interested in this franchise?</label>
          <textarea
            value={form.coverLetter}
            onChange={(e) => setForm((prev) => ({ ...prev, coverLetter: e.target.value }))}
            placeholder="Share your motivation and interest in this franchise opportunity..."
            style={{ ...inpStyle(), minHeight: 120, resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>
      </div>
    </div>
  );

  const renderTerms = () => (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Review & Submit</h3>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
        Review your application before submitting
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
        <SummarySection title="Personal Information" data={form.personalInfo} fields={[
          { label: 'Name', key: 'fullName' }, { label: 'Email', key: 'email' },
          { label: 'Phone', key: 'phone' }, { label: 'Occupation', key: 'currentOccupation' },
          { label: 'Location', key: 'currentCountry' },
        ]} />
        <SummarySection title="Business Experience" data={form.businessInfo} fields={[
          { label: 'Experience', key: 'yearsOfExperience' },
          { label: 'Industry', key: 'preferredIndustry' },
        ]} />
        <SummarySection title="Financial" data={form.financialInfo} fields={[
          { label: 'Budget', key: 'investmentBudget', fmt: (v) => `$${Number(v || 0).toLocaleString()}` },
          { label: 'Net Worth', key: 'netWorth', fmt: (v) => `$${Number(v || 0).toLocaleString()}` },
        ]} />
        <SummarySection title="Location" data={form.locationPreference} fields={[
          { label: 'Country', key: 'preferredCountry' },
          { label: 'City', key: 'preferredCity' },
        ]} />
        {documents.length > 0 && (
          <div style={{ padding: 12, borderRadius: 8, backgroundColor: 'var(--surface-container-low)' }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Documents: {documents.length} uploaded</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={!!policyAccepted}
            onChange={(e) => {
              if (e.target.checked) {
                setPolicyAccepted({ policyVersion: '1.0', acceptedAt: new Date().toISOString() });
              } else {
                setPolicyAccepted(null);
              }
            }}
            style={{ marginTop: 2, accentColor: 'var(--primary)', width: 18, height: 18 }}
          />
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            I certify that all submitted information is accurate and complete.
          </span>
        </label>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={!!policyAccepted}
            onChange={(e) => {
              if (e.target.checked) {
                setPolicyAccepted({ policyVersion: '1.0', acceptedAt: new Date().toISOString() });
              } else {
                setPolicyAccepted(null);
              }
            }}
            style={{ marginTop: 2, accentColor: 'var(--primary)', width: 18, height: 18 }}
          />
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            I agree to the company's Franchise Policies & Terms.
          </span>
        </label>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (steps[step].id) {
      case 'personal': return renderPersonal();
      case 'business': return renderBusiness();
      case 'financial': return renderFinancial();
      case 'location': return renderLocation();
      case 'documents': return renderDocuments();
      case 'cover': return renderCoverLetter();
      case 'terms': return renderTerms();
      default: return null;
    }
  };

  const canProceed = () => {
    if (steps[step].id === 'terms') return !!policyAccepted;
    return true;
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)', padding: 24,
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        backgroundColor: 'var(--surface)', borderRadius: 16,
        width: '100%', maxWidth: 800, maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
              Apply to {listing?.title || 'Opportunity'}
            </h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, display: 'flex', borderRadius: 8 }}>
              <X size={20} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 12 }}>
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isComplete = i < step;
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => { if (i < step) setStep(i); }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: isComplete ? 'var(--primary)' : isActive ? 'var(--primary)' : 'var(--surface-container-low)',
                      color: isComplete || isActive ? '#fff' : 'var(--text-muted)',
                      fontSize: 12, fontWeight: 600, transition: 'all 0.2s',
                    }}>
                      {isComplete ? <Check size={14} /> : <Icon size={14} />}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--text)' : 'var(--text-muted)', display: 'none' }}>
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{
                      flex: 1, height: 2,
                      backgroundColor: i < step ? 'var(--primary)' : 'var(--border)',
                      margin: '0 4px', transition: 'background-color 0.3s',
                    }} />
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ width: '100%', height: 3, backgroundColor: 'var(--surface-container-low)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${stepProgress}%`, height: '100%', backgroundColor: 'var(--primary)', borderRadius: 2, transition: 'width 0.3s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{steps[step].label}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Step {step + 1} of {steps.length}</span>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
          <div>
            {step > 0 && (
              <Button variant="outline" onClick={handleBack} icon={<ChevronLeft size={16} />}>
                Back
              </Button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            {step < steps.length - 1 ? (
              <Button variant="primary" onClick={handleNext} disabled={!canProceed()} icon={<ChevronRight size={16} />}>
                Continue
              </Button>
            ) : (
              <Button variant="primary" onClick={handleSubmit} disabled={submitting || !policyAccepted}
                icon={submitting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={16} />}>
                {submitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children, style }) {
  return (
    <div style={{ marginBottom: 4, ...style }}>
      <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6, color: error ? 'var(--danger)' : undefined }}>
        {label} {error && <span style={{ color: 'var(--danger)', fontSize: 11 }}>({error})</span>}
      </label>
      {children}
    </div>
  );
}

function SummarySection({ title, data, fields }) {
  return (
    <div style={{ padding: 12, borderRadius: 8, backgroundColor: 'var(--surface-container-low)' }}>
      <span style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>{title}</span>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
        {fields.map((f) => {
          const val = data?.[f.key];
          return val ? (
            <div key={f.key} style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--text-muted)' }}>{f.label}: </span>
              {f.fmt ? f.fmt(val) : val}
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
}

function inpStyle(error) {
  return {
    width: '100%', padding: '10px 14px', fontSize: 14,
    border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
    borderRadius: 8, backgroundColor: 'var(--background)', color: 'var(--text)',
    outline: 'none', boxSizing: 'border-box',
  };
}

function selStyle(error) {
  return {
    width: '100%', padding: '10px 14px', fontSize: 14,
    border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
    borderRadius: 8, backgroundColor: 'var(--background)', color: 'var(--text)',
    outline: 'none', boxSizing: 'border-box', cursor: 'pointer',
  };
}