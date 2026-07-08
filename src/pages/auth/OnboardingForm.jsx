import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';

const businessRoles = ['franchisor', 'supplier', 'consultant'];

export default function OnboardingForm() {
  const { role } = useParams();
  const { user, updateOnboarding, submitForReview } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!role || !['franchisor', 'franchisee', 'supplier', 'consultant', 'investor'].includes(role)) {
      navigate('/select-role');
    }
  }, [role, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSaveAndContinue = async () => {
    setError('');
    setSubmitting(true);
    try {
      await updateOnboarding(role, form);
      setCompleted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitForReview = async () => {
    setSubmitting(true);
    try {
      await submitForReview();
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <Card padding="40px" hover={false} style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <AlertCircle size={32} style={{ color: '#F59E0B' }} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Application Submitted</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Your profile has been submitted for admin review.
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
            We'll notify you once your account is verified. This usually takes 1-2 business days.
          </p>
          <Button onClick={() => navigate('/dashboard')} size="lg">
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (completed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <Card padding="40px" hover={false} style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle size={32} style={{ color: '#10B981' }} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
            {businessRoles.includes(role) ? 'Profile Complete!' : 'Welcome to Franchisia!'}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
            {businessRoles.includes(role)
              ? 'Please upload your business documents and submit for admin review to start using the platform.'
              : 'Your account is ready. Start exploring franchise opportunities!'}
          </p>
          {businessRoles.includes(role) ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Button onClick={() => navigate('/upload-documents')} size="lg" fullWidth>
                Upload Documents
              </Button>
              <Button onClick={handleSubmitForReview} variant="secondary" size="lg" fullWidth disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit for Review'}
              </Button>
            </div>
          ) : (
            <Button onClick={() => navigate('/dashboard')} size="lg">
              Go to Dashboard
            </Button>
          )}
        </Card>
      </div>
    );
  }

  const renderFranchisorForm = () => (
    <>
      <Input label="Company Name" name="companyName" value={form.companyName || ''} onChange={handleChange} placeholder="Your company name" required />
      <Input label="Official Business Email" name="businessEmail" type="email" value={form.businessEmail || ''} onChange={handleChange} placeholder="business@company.com" required />
      <Input label="Phone Number" name="phone" type="tel" value={form.phone || ''} onChange={handleChange} placeholder="+1 (555) 123-4567" required />
      <Input label="Company Website (optional)" name="website" value={form.website || ''} onChange={handleChange} placeholder="https://example.com" />
      <Input label="Business Registration Number" name="businessRegistrationNumber" value={form.businessRegistrationNumber || ''} onChange={handleChange} placeholder="Registration #" required />
      <Input label="Location" name="location" value={form.location || ''} onChange={handleChange} placeholder="City, Country" required />
    </>
  );

  const renderFranchiseeForm = () => (
    <>
      <Input label="Phone Number" name="phone" type="tel" value={form.phone || ''} onChange={handleChange} placeholder="+1 (555) 123-4567" />
      <Input label="Location" name="location" value={form.location || ''} onChange={handleChange} placeholder="City, Country" />
      <Input label="Investment Budget (optional)" name="investmentCapacity" type="number" value={form.investmentCapacity || ''} onChange={handleChange} placeholder="50000" />
      <Input label="Preferred Industry (optional)" name="preferredIndustry" value={form.preferredIndustry || ''} onChange={handleChange} placeholder="Fast Food, Retail, etc." />
      <Input label="Preferred Location (optional)" name="preferredLocation" value={form.preferredLocation || ''} onChange={handleChange} placeholder="City, State" />
      <Input label="LinkedIn Profile (optional)" name="linkedinUrl" value={form.linkedinUrl || ''} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
      <Input label="Headline (optional)" name="headline" value={form.headline || ''} onChange={handleChange} placeholder="e.g. Experienced entrepreneur looking for opportunities" />
      <Input label="Bio (optional)" name="bio" value={form.bio || ''} onChange={handleChange} placeholder="Tell us about yourself" />
    </>
  );

  const renderSupplierForm = () => (
    <>
      <Input label="Company Name" name="companyName" value={form.companyName || ''} onChange={handleChange} placeholder="Your company name" required />
      <Input label="Business Email" name="businessEmail" type="email" value={form.businessEmail || ''} onChange={handleChange} placeholder="business@company.com" required />
      <Input label="Phone Number" name="phone" type="tel" value={form.phone || ''} onChange={handleChange} placeholder="+1 (555) 123-4567" required />
      <Input label="Website" name="website" value={form.website || ''} onChange={handleChange} placeholder="https://example.com" required />
      <Input label="GST/Tax Number" name="gstNumber" value={form.gstNumber || ''} onChange={handleChange} placeholder="GST #" required />
      <Input label="Business Registration Number" name="businessRegistrationNumber" value={form.businessRegistrationNumber || ''} onChange={handleChange} placeholder="Registration #" required />
      <Input label="Location" name="location" value={form.location || ''} onChange={handleChange} placeholder="City, Country" />
    </>
  );

  const renderConsultantForm = () => (
    <>
      <Input label="Full Name" name="fullName" value={form.fullName || user?.fullName || ''} onChange={handleChange} placeholder="Your full name" required />
      <Input label="Consultancy Name" name="consultancyName" value={form.consultancyName || ''} onChange={handleChange} placeholder="Your consultancy name" required />
      <Input label="Phone Number" name="phone" type="tel" value={form.phone || ''} onChange={handleChange} placeholder="+1 (555) 123-4567" required />
      <Input label="LinkedIn Profile" name="linkedinUrl" value={form.linkedinUrl || ''} onChange={handleChange} placeholder="https://linkedin.com/in/..." required />
      <Input label="Years of Experience" name="experienceYears" type="number" value={form.experienceYears || ''} onChange={handleChange} placeholder="5" required />
      <Input label="Business Registration Number (optional)" name="businessRegistrationNumber" value={form.businessRegistrationNumber || ''} onChange={handleChange} placeholder="Registration #" />
      <Input label="Location" name="location" value={form.location || ''} onChange={handleChange} placeholder="City, Country" />
      <Input label="Headline (optional)" name="headline" value={form.headline || ''} onChange={handleChange} placeholder="e.g. Franchise consultant with 10+ years experience" />
      <Input label="Bio (optional)" name="bio" value={form.bio || ''} onChange={handleChange} placeholder="Tell us about your consultancy" />
    </>
  );

  const renderInvestorForm = () => (
    <>
      <Input label="Phone Number" name="phone" type="tel" value={form.phone || ''} onChange={handleChange} placeholder="+1 (555) 123-4567" />
      <Input label="Location" name="location" value={form.location || ''} onChange={handleChange} placeholder="City, Country" />
      <Input label="Investment Range (optional)" name="investmentRange" value={form.investmentRange || ''} onChange={handleChange} placeholder="e.g. $50K - $200K" />
      <Input label="Industries of Interest (optional)" name="industries" value={form.industries || ''} onChange={handleChange} placeholder="Fast Food, Retail, Healthcare" />
      <Input label="LinkedIn Profile (optional)" name="linkedinUrl" value={form.linkedinUrl || ''} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
      <Input label="Headline (optional)" name="headline" value={form.headline || ''} onChange={handleChange} placeholder="e.g. Angel investor looking for franchise opportunities" />
      <Input label="Bio (optional)" name="bio" value={form.bio || ''} onChange={handleChange} placeholder="Tell us about yourself" />
    </>
  );

  const forms = {
    franchisor: renderFranchisorForm,
    franchisee: renderFranchiseeForm,
    supplier: renderSupplierForm,
    consultant: renderConsultantForm,
    investor: renderInvestorForm,
  };

  const roleLabels = {
    franchisor: 'Franchisor',
    franchisee: 'Franchisee',
    supplier: 'Supplier',
    consultant: 'Consultant',
    investor: 'Investor',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <Card padding="40px" hover={false} style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 24, color: 'var(--primary)', marginBottom: 20 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'inline-block' }} />
            Franchisia
          </Link>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
            Complete Your Profile
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Tell us more about yourself as a {roleLabels[role] || role}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} style={{
              width: 8, height: 8, borderRadius: '50%',
              backgroundColor: s <= 5 ? 'var(--primary)' : 'var(--border)',
            }} />
          ))}
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>Step 5 of 5</span>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: 'var(--radius-sm)', fontSize: 14, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {forms[role] ? forms[role]() : <p>Invalid role</p>}

          <Button
            onClick={handleSaveAndContinue}
            size="lg"
            icon={<ArrowRight size={18} />}
            fullWidth
            disabled={submitting}
            style={{ marginTop: 8 }}
          >
            {submitting ? 'Saving...' : 'Save & Continue'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
