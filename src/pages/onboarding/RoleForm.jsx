import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Upload, Building2, Briefcase, Package, Handshake, DollarSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const roleConfig = {
  franchisor: {
    label: 'Franchisor',
    icon: '🏢',
    heading: 'Complete Your Franchisor Profile',
    description: 'Provide your business details for verification.',
    status: 'pending_admin_review',
    fields: [
      { name: 'companyName', label: 'Company Name', type: 'text', required: true },
      { name: 'businessEmail', label: 'Business Email', type: 'email', required: true },
      { name: 'website', label: 'Website', type: 'url', required: false, placeholder: 'https://' },
      { name: 'industry', label: 'Industry', type: 'text', required: true },
      { name: 'country', label: 'Country', type: 'text', required: true },
      { name: 'businessRegistrationNumber', label: 'Business Registration Number', type: 'text', required: true },
    ],
    hasUpload: true,
    uploadLabel: 'Business Registration Certificate (PDF)',
    needsReview: true,
  },
  franchisee: {
    label: 'Franchisee',
    icon: '💼',
    color: '#10B981',
    description: 'Tell us about your investment preferences.',
    status: 'verified',
    fields: [
      { name: 'investmentBudget', label: 'Investment Budget', type: 'text', required: true, placeholder: 'e.g. $50,000 - $200,000' },
      { name: 'preferredIndustry', label: 'Preferred Industry', type: 'text', required: true },
      { name: 'preferredLocation', label: 'Preferred Location', type: 'text', required: true, placeholder: 'City, State or Country' },
      { name: 'experience', label: 'Experience', type: 'text', required: true, placeholder: 'Years of experience in this field' },
    ],
    hasUpload: false,
    needsReview: false,
  },
  supplier: {
    label: 'Supplier',
    icon: '📦',
    color: '#F59E0B',
    description: 'Provide your business details for verification.',
    status: 'pending_admin_review',
    fields: [
      { name: 'companyName', label: 'Company Name', type: 'text', required: true },
      { name: 'businessEmail', label: 'Business Email', type: 'email', required: true },
      { name: 'website', label: 'Website', type: 'url', required: true, placeholder: 'https://' },
      { name: 'gstNumber', label: 'GST / Tax Number', type: 'text', required: true },
      { name: 'servicesOffered', label: 'Services Offered', type: 'text', required: true },
    ],
    hasUpload: true,
    uploadLabel: 'Business Registration Certificate',
    needsReview: true,
  },
  consultant: {
    label: 'Consultant',
    icon: '🤝',
    color: '#8B5CF6',
    description: 'Share your consulting credentials.',
    status: 'pending_admin_review',
    fields: [
      { name: 'consultancyName', label: 'Consultancy Name', type: 'text', required: true },
      { name: 'businessEmail', label: 'Business Email', type: 'email', required: true },
      { name: 'website', label: 'Website', type: 'url', required: true, placeholder: 'https://' },
      { name: 'yearsOfExperience', label: 'Years of Experience', type: 'number', required: true },
      { name: 'linkedinProfile', label: 'LinkedIn Profile', type: 'url', required: true, placeholder: 'https://linkedin.com/in/' },
    ],
    hasUpload: true,
    uploadLabel: 'Business Registration (Optional)',
    needsReview: true,
  },
  investor: {
    label: 'Investor',
    icon: '💰',
    color: '#EC4899',
    description: 'Set your investment criteria.',
    status: 'verified',
    fields: [
      { name: 'investmentRange', label: 'Investment Range', type: 'text', required: true, placeholder: 'e.g. $100,000 - $1,000,000' },
      { name: 'interestedIndustries', label: 'Interested Industries', type: 'text', required: true },
      { name: 'linkedinProfile', label: 'LinkedIn (Optional)', type: 'url', required: false, placeholder: 'https://linkedin.com/in/' },
      { name: 'company', label: 'Company (Optional)', type: 'text', required: false },
    ],
    hasUpload: false,
    needsReview: false,
  },
};

export default function RoleForm() {
  const { role } = useParams();
  const navigate = useNavigate();
  const { user, updateOnboarding, uploadDocument, submitForReview } = useAuth();

  const config = roleConfig[role];
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!config) navigate('/onboarding');
  }, [role, config, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    for (const field of config.fields) {
      if (field.required && !form[field.name]) {
        setError(`Please fill in all required fields`);
        return;
      }
    }

    setSubmitting(true);
    try {
      await updateOnboarding(role, form);
      if (config.needsReview) {
        setSuccess(true);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.png,.jpg,.jpeg';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setUploading(true);
      try {
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
        await uploadDocument({
          type: 'business_registration',
          url: base64,
          fileName: file.name,
        });
        setForm({ ...form, _uploaded: true });
      } catch (err) {
        setError('Failed to upload file');
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  const handleSubmitReview = async () => {
    setSubmitting(true);
    try {
      await submitForReview();
      navigate('/verification-status');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!config) return null;
  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--background)' }}>
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <CheckCircle size={36} color="#10B981" />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Profile Saved</h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
              {config.needsReview
                ? 'Your profile has been saved. Please upload any required documents and submit for admin review.'
                : 'Your profile is complete. You can now access the dashboard.'}
            </p>

            {config.hasUpload && (
              <div style={{ marginBottom: 24 }}>
                <button
                  onClick={handleFileUpload}
                  disabled={uploading}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%',
                    padding: '14px 24px', borderRadius: 8, border: '2px dashed var(--primary)',
                    backgroundColor: form._uploaded ? '#D1FAE5' : 'transparent',
                    color: form._uploaded ? '#10B981' : 'var(--primary)',
                    cursor: 'pointer', fontSize: 14, fontWeight: 500,
                  }}
                >
                  <Upload size={16} />
                  {uploading ? 'Uploading...' : form._uploaded ? 'Document Uploaded' : config.uploadLabel}
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  flex: 1, padding: '14px 24px', borderRadius: 8, border: '2px solid var(--border)',
                  backgroundColor: 'transparent', color: 'var(--text)', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                }}
              >
                Go to Dashboard
              </button>
              {config.needsReview && form._uploaded && (
                <button
                  onClick={handleSubmitReview}
                  disabled={submitting}
                  style={{
                    flex: 1, padding: '14px 24px', borderRadius: 8, border: 'none',
                    backgroundColor: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit for Review'}
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--background)' }}>
      <header style={{ padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 22, color: 'var(--primary)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'inline-block' }} />
          Franchisia
        </div>
      </header>

      <button
        onClick={() => navigate('/onboarding')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 40px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14, fontWeight: 500, marginBottom: 8 }}
      >
        <ArrowLeft size={16} />
        Back to role selection
      </button>

      <main style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '0 24px 60px' }}>
        <div style={{ width: '100%', maxWidth: 560 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>{config.icon}</div>
            <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>{config.label}</h1>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>{config.description}</p>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: 'var(--radius-sm)', fontSize: 14, marginBottom: 16 }}>{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
              {config.fields.map((field) => (
                <div key={field.name}>
                  <label style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 6 }}>
                    {field.label}
                    {field.required && <span style={{ color: '#DC2626', marginLeft: 2 }}>*</span>}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={form[field.name] || ''}
                    onChange={handleChange}
                    placeholder={field.placeholder || ''}
                    required={field.required}
                    style={{
                      width: '100%', padding: '12px 16px', fontSize: 14,
                      color: 'var(--text)', backgroundColor: 'var(--surface)',
                      border: '2px solid var(--border)', borderRadius: 8, outline: 'none',
                      fontFamily: 'inherit',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                  />
                </div>
              ))}

              {config.hasUpload && (
                <div>
                  <label style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 6 }}>
                    {config.uploadLabel}
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 4 }}>(Optional now)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleFileUpload}
                    disabled={uploading}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%',
                      padding: '12px 16px', borderRadius: 8, border: '2px dashed var(--border)',
                      backgroundColor: 'transparent', color: 'var(--text-secondary)',
                      cursor: 'pointer', fontSize: 14,
                    }}
                  >
                    <Upload size={16} />
                    {uploading ? 'Uploading...' : form._uploaded ? 'Re-upload' : 'Upload file'}
                  </button>
                  {form._uploaded && (
                    <p style={{ fontSize: 13, color: '#10B981', marginTop: 4 }}>File uploaded successfully</p>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                style={{
                  flex: 1, padding: '16px 24px', borderRadius: 8, border: '2px solid var(--border)',
                  backgroundColor: 'transparent', color: 'var(--text)', cursor: 'pointer', fontSize: 16, fontWeight: 600,
                }}
              >
                Skip
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  flex: 1, padding: '16px 24px', borderRadius: 8, border: 'none',
                  backgroundColor: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 16, fontWeight: 600,
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? 'Saving...' : 'Save & Continue'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}