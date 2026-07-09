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
      { name: 'brandName', label: 'Brand Name', type: 'text', required: true },
      { name: 'website', label: 'Website', type: 'url', required: true, placeholder: 'https://' },
      { name: 'industry', label: 'Industry', type: 'text', required: true },
      { name: 'businessRegistrationNumber', label: 'Company Registration Number', type: 'text', required: true },
      { name: 'gstNumber', label: 'GST (Optional)', type: 'text', required: false },
      { name: 'businessEmail', label: 'Business Email', type: 'email', required: true },
      { name: 'businessAddress', label: 'Business Address', type: 'text', required: true },
      { name: 'numberOfOutlets', label: 'Number of Outlets', type: 'number', required: true },
      { name: 'yearsInBusiness', label: 'Years in Business', type: 'number', required: true },
      { name: 'companyDescription', label: 'Company Description', type: 'textarea', required: true },
    ],
    hasUpload: true,
    uploadLabel: 'Upload Registration Document',
    hasSecondUpload: true,
    secondUploadLabel: 'Upload Business License',
    hasImageUpload: true,
    needsReview: true,
  },
  franchisee: {
    label: 'Franchisee',
    icon: '💼',
    color: '#10B981',
    description: 'Tell us about your investment preferences.',
    status: 'verified',
    fields: [
      { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
      { name: 'city', label: 'City', type: 'text', required: true },
      { name: 'country', label: 'Country', type: 'text', required: true },
      { name: 'investmentBudget', label: 'Investment Budget', type: 'text', required: true, placeholder: 'e.g. $50,000 - $200,000' },
      { name: 'preferredIndustry', label: 'Preferred Industry', type: 'text', required: true },
      { name: 'businessExperience', label: 'Business Experience', type: 'text', required: true, placeholder: 'Years of experience in this field' },
      { name: 'linkedinProfile', label: 'LinkedIn (Optional)', type: 'url', required: false, placeholder: 'https://linkedin.com/in/' },
    ],
    hasUpload: true,
    uploadLabel: 'Upload Government ID',
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
      { name: 'servicesOffered', label: 'Services Offered', type: 'text', required: true },
      { name: 'website', label: 'Website', type: 'url', required: true, placeholder: 'https://' },
      { name: 'gstNumber', label: 'GST (Optional)', type: 'text', required: false },
      { name: 'businessAddress', label: 'Address', type: 'text', required: true },
      { name: 'contactPerson', label: 'Contact Person', type: 'text', required: true },
    ],
    hasUpload: true,
    uploadLabel: 'Upload Business Registration',
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
      { name: 'yearsOfExperience', label: 'Years of Experience', type: 'number', required: true },
      { name: 'certifications', label: 'Certifications', type: 'text', required: true, placeholder: 'e.g. CFE, Certified Franchise Executive' },
      { name: 'linkedinProfile', label: 'LinkedIn', type: 'url', required: true, placeholder: 'https://linkedin.com/in/' },
      { name: 'website', label: 'Website', type: 'url', required: true, placeholder: 'https://' },
    ],
    hasUpload: true,
    uploadLabel: 'Upload Resume',
    needsReview: true,
  },
  investor: {
    label: 'Investor',
    icon: '💰',
    color: '#EC4899',
    description: 'Set your investment criteria.',
    status: 'verified',
    fields: [
      { name: 'investmentRange', label: 'Investment Capacity', type: 'text', required: true, placeholder: 'e.g. $100,000 - $1,000,000' },
      { name: 'interestedIndustries', label: 'Preferred Industries', type: 'text', required: true },
      { name: 'company', label: 'Company (Optional)', type: 'text', required: false },
      { name: 'linkedinProfile', label: 'LinkedIn', type: 'url', required: false, placeholder: 'https://linkedin.com/in/' },
    ],
    hasUpload: true,
    uploadLabel: 'Upload Government ID',
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
  const [uploadingSecond, setUploadingSecond] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    if (!config) navigate('/onboarding/select-role');
  }, [role, config, navigate]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === 'file') return;
    setForm({ ...form, [name]: value });
    setError('');
  };

  const handleFileUpload = async (docType, setUploadingFn) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = docType === 'image' ? '.png,.jpg,.jpeg,.webp' : '.pdf,.png,.jpg,.jpeg';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setUploadingFn(true);
      try {
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
        await uploadDocument({
          type: docType,
          url: base64,
          fileName: file.name,
        });
        setForm({ ...form, [`_uploaded_${docType}`]: true });
      } catch (err) {
        setError('Failed to upload file');
      } finally {
        setUploadingFn(false);
      }
    };
    input.click();
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
        navigate('/onboarding/status');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReview = async () => {
    setSubmitting(true);
    try {
      await submitForReview();
      navigate('/onboarding/status');
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
              <div style={{ marginBottom: 12 }}>
                <button
                  onClick={() => handleFileUpload('document', setUploading)}
                  disabled={uploading}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%',
                    padding: '14px 24px', borderRadius: 8, border: '2px dashed var(--primary)',
                    backgroundColor: form._uploaded_document ? '#D1FAE5' : 'transparent',
                    color: form._uploaded_document ? '#10B981' : 'var(--primary)',
                    cursor: 'pointer', fontSize: 14, fontWeight: 500,
                  }}
                >
                  <Upload size={16} />
                  {uploading ? 'Uploading...' : form._uploaded_document ? 'Document Uploaded' : config.uploadLabel}
                </button>
              </div>
            )}
            {config.hasSecondUpload && (
              <div style={{ marginBottom: 12 }}>
                <button
                  onClick={() => handleFileUpload('business_license', setUploadingSecond)}
                  disabled={uploadingSecond}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%',
                    padding: '14px 24px', borderRadius: 8, border: '2px dashed var(--primary)',
                    backgroundColor: form._uploaded_business_license ? '#D1FAE5' : 'transparent',
                    color: form._uploaded_business_license ? '#10B981' : 'var(--primary)',
                    cursor: 'pointer', fontSize: 14, fontWeight: 500,
                  }}
                >
                  <Upload size={16} />
                  {uploadingSecond ? 'Uploading...' : form._uploaded_business_license ? 'License Uploaded' : config.secondUploadLabel}
                </button>
              </div>
            )}
            {config.hasImageUpload && (
              <>
                <div style={{ marginBottom: 12 }}>
                  <button
                    onClick={() => handleFileUpload('company_logo', setUploadingLogo)}
                    disabled={uploadingLogo}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%',
                      padding: '14px 24px', borderRadius: 8, border: '2px dashed var(--primary)',
                      backgroundColor: form._uploaded_company_logo ? '#D1FAE5' : 'transparent',
                      color: form._uploaded_company_logo ? '#10B981' : 'var(--primary)',
                      cursor: 'pointer', fontSize: 14, fontWeight: 500,
                    }}
                  >
                    <Upload size={16} />
                    {uploadingLogo ? 'Uploading...' : form._uploaded_company_logo ? 'Logo Uploaded' : 'Upload Company Logo'}
                  </button>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <button
                    onClick={() => handleFileUpload('company_banner', setUploadingBanner)}
                    disabled={uploadingBanner}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%',
                      padding: '14px 24px', borderRadius: 8, border: '2px dashed var(--primary)',
                      backgroundColor: form._uploaded_company_banner ? '#D1FAE5' : 'transparent',
                      color: form._uploaded_company_banner ? '#10B981' : 'var(--primary)',
                      cursor: 'pointer', fontSize: 14, fontWeight: 500,
                    }}
                  >
                    <Upload size={16} />
                    {uploadingBanner ? 'Uploading...' : form._uploaded_company_banner ? 'Banner Uploaded' : 'Upload Company Banner'}
                  </button>
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => navigate('/onboarding/status')}
                style={{
                  flex: 1, padding: '14px 24px', borderRadius: 8, border: '2px solid var(--border)',
                  backgroundColor: 'transparent', color: 'var(--text)', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                }}
              >
                View Status
              </button>
              {config.needsReview && form._uploaded_document && (
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
        onClick={() => navigate('/onboarding/select-role')}
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
                  {field.type === 'textarea' ? (
                    <textarea
                      name={field.name}
                      value={form[field.name] || ''}
                      onChange={handleChange}
                      placeholder={field.placeholder || ''}
                      rows={4}
                      style={{
                        width: '100%', padding: '12px 16px', fontSize: 14,
                        color: 'var(--text)', backgroundColor: 'var(--surface)',
                        border: '2px solid var(--border)', borderRadius: 8, outline: 'none',
                        fontFamily: 'inherit', resize: 'vertical',
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                    />
                  ) : (
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
                  )}
                </div>
              ))}

              {config.hasImageUpload && (
                <div>
                  <label style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 6 }}>
                    Company Logo
                  </label>
                  <button
                    type="button"
                    onClick={() => handleFileUpload('company_logo', setUploadingLogo)}
                    disabled={uploadingLogo}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%',
                      padding: '12px 16px', borderRadius: 8, border: '2px dashed var(--border)',
                      backgroundColor: 'transparent', color: 'var(--text-secondary)',
                      cursor: 'pointer', fontSize: 14,
                    }}
                  >
                    <Upload size={16} />
                    {uploadingLogo ? 'Uploading...' : form._uploaded_company_logo ? 'Logo Uploaded' : 'Upload company logo'}
                  </button>
                  {form._uploaded_company_logo && (
                    <p style={{ fontSize: 13, color: '#10B981', marginTop: 4 }}>Logo uploaded successfully</p>
                  )}
                </div>
              )}

              {config.hasImageUpload && (
                <div>
                  <label style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 6 }}>
                    Company Banner
                  </label>
                  <button
                    type="button"
                    onClick={() => handleFileUpload('company_banner', setUploadingBanner)}
                    disabled={uploadingBanner}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%',
                      padding: '12px 16px', borderRadius: 8, border: '2px dashed var(--border)',
                      backgroundColor: 'transparent', color: 'var(--text-secondary)',
                      cursor: 'pointer', fontSize: 14,
                    }}
                  >
                    <Upload size={16} />
                    {uploadingBanner ? 'Uploading...' : form._uploaded_company_banner ? 'Banner Uploaded' : 'Upload company banner'}
                  </button>
                  {form._uploaded_company_banner && (
                    <p style={{ fontSize: 13, color: '#10B981', marginTop: 4 }}>Banner uploaded successfully</p>
                  )}
                </div>
              )}

              {config.hasUpload && (
                <div>
                  <label style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 6 }}>
                    {config.uploadLabel}
                  </label>
                  <button
                    type="button"
                    onClick={() => handleFileUpload('document', setUploading)}
                    disabled={uploading}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%',
                      padding: '12px 16px', borderRadius: 8, border: '2px dashed var(--border)',
                      backgroundColor: 'transparent', color: 'var(--text-secondary)',
                      cursor: 'pointer', fontSize: 14,
                    }}
                  >
                    <Upload size={16} />
                    {uploading ? 'Uploading...' : form._uploaded_document ? 'Re-upload' : 'Upload file'}
                  </button>
                  {form._uploaded_document && (
                    <p style={{ fontSize: 13, color: '#10B981', marginTop: 4 }}>File uploaded successfully</p>
                  )}
                </div>
              )}

              {config.hasSecondUpload && (
                <div>
                  <label style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 6 }}>
                    {config.secondUploadLabel}
                  </label>
                  <button
                    type="button"
                    onClick={() => handleFileUpload('business_license', setUploadingSecond)}
                    disabled={uploadingSecond}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%',
                      padding: '12px 16px', borderRadius: 8, border: '2px dashed var(--border)',
                      backgroundColor: 'transparent', color: 'var(--text-secondary)',
                      cursor: 'pointer', fontSize: 14,
                    }}
                  >
                    <Upload size={16} />
                    {uploadingSecond ? 'Uploading...' : form._uploaded_business_license ? 'Re-upload' : 'Upload file'}
                  </button>
                  {form._uploaded_business_license && (
                    <p style={{ fontSize: 13, color: '#10B981', marginTop: 4 }}>File uploaded successfully</p>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => navigate('/onboarding/status')}
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