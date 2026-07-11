import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Clock, ShieldCheck, XCircle, AlertCircle, CheckCircle, ArrowRight, Edit3, Upload, Search, BookOpen, Building2, UserCheck, Package, Handshake, DollarSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from "../../assets/logo.png";

const roleIcons = {
  franchisor: { icon: Building2, label: 'Franchisor', emoji: '🏢' },
  franchisee: { icon: UserCheck, label: 'Franchisee', emoji: '💼' },
  supplier: { icon: Package, label: 'Supplier', emoji: '📦' },
  consultant: { icon: Handshake, label: 'Consultant', emoji: '🤝' },
  investor: { icon: DollarSign, label: 'Investor', emoji: '💰' },
};

const statusConfig = {
  pending_profile_completion: {
    label: 'Profile Incomplete',
    icon: AlertCircle,
    color: '#F59E0B',
    bg: '#FEF3C7',
    title: 'Profile Not Completed',
    description: 'Please complete your profile to continue.',
    note: 'Fill in your details and submit for verification.',
  },
  pending_admin_review: {
    label: 'Pending Verification',
    icon: Clock,
    color: '#8B5CF6',
    bg: '#EDE9FE',
    title: 'Verification Submitted',
    description: 'Thank you for submitting your information. Your account is under review.',
    note: 'Our team usually reviews applications within 24-48 hours.',
  },
  verified: {
    label: 'Verified',
    icon: ShieldCheck,
    color: '#10B981',
    bg: '#D1FAE5',
    title: "You're Verified!",
    description: 'Your account has been fully verified.',
    note: 'You now have full access to all features.',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    color: '#DC2626',
    bg: '#FEE2E2',
    title: 'Verification Rejected',
    description: 'Your verification was not approved.',
    note: 'Please contact support for more information.',
  },
  need_more_information: {
    label: 'Additional Info Required',
    icon: AlertCircle,
    color: '#F59E0B',
    bg: '#FEF3C7',
    title: 'Additional Information Required',
    description: 'Our team needs more information to verify your account.',
    note: '',
  },
};

const steps = [
  { key: 'account', label: 'Account Created' },
  { key: 'role', label: 'Role Selected' },
  { key: 'submitted', label: 'Verification Submitted' },
  { key: 'approved', label: 'Waiting for Approval' },
];

export default function OnboardingStatus() {
  const { user, fetchAuthStatus } = useAuth();
  const navigate = useNavigate();
  const [creatingCompany, setCreatingCompany] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) return null;

  const role = user.role;
  const hasValidRole = role && role !== "none";

  useEffect(() => {
    if (user && !hasValidRole) navigate('/onboarding/select-role');
  }, [user, hasValidRole, navigate]);

  const handleCreateCompany = async () => {
    setCreatingCompany(true);
    try {
      const res = await fetch('/api/onboarding/create-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          companyName: user.companyName || user.brandName || `${user.name || 'Unknown'}'s Company`,
          industry: user.preferredIndustry || user.industries?.[0] || 'Other',
          companyDescription: user.companyDescription || null,
          website: user.website || null,
          businessEmail: user.businessEmail || null,
          businessAddress: typeof user.location === 'string' ? user.location : null,
        }),
      });
      if (res.ok) {
        await fetchAuthStatus();
      } else {
        const err = await res.json().catch(() => ({ error: 'Failed to create company' }));
        alert(err.error || 'Failed to create company');
      }
    } catch {
      alert('Network error');
    } finally {
      setCreatingCompany(false);
    }
  };

  const roleInfo = roleIcons[role] || { icon: Building2, label: role || 'User', emoji: '👤' };
  const status = user.accountStatus || 'pending_admin_review';
  const config = statusConfig[status] || statusConfig.pending_admin_review;
  const Icon = config.icon;
  const RoleIcon = roleInfo.icon;

  const isPending = status === 'pending_admin_review';
  const isVerified = status === 'verified';
  const isRejected = status === 'rejected';
  const needsInfo = status === 'need_more_information';
  const hasRole = role && role !== "none";

  const getStepStatus = (stepKey) => {
    switch (stepKey) {
      case 'account': return 'done';
      case 'role': return hasRole ? 'done' : 'pending';
      case 'submitted': return !hasRole ? 'pending' : (isPending || needsInfo || isRejected || isVerified ? 'done' : 'pending');
      case 'approved': return isVerified ? 'done' : (isRejected ? 'error' : 'pending');
      default: return 'pending';
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--background)' }}>
      <header style={{ padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <Link to="/">
          <img src={logo} alt="Franchisia" style={{ height: 48, width: 'auto' }} />
        </Link>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 24px 60px' }}>
        <div style={{ width: '100%', maxWidth: 640 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{roleInfo.emoji}</div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
              Welcome, {user.name || 'User'}!
            </h1>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>
              You are registered as <strong style={{ color: 'var(--primary)' }}>{roleInfo.label}</strong>
            </p>
          </div>

          {user.needsCompany && (
            <div style={{
              padding: 20, borderRadius: 12, backgroundColor: '#FEF3C7',
              marginBottom: 24, border: '2px solid #F59E0B',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <AlertCircle size={24} color="#F59E0B" />
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#92400E' }}>Company Registration Required</p>
                  <p style={{ fontSize: 13, color: '#92400E', opacity: 0.8 }}>You need to register a company before you can access all features.</p>
                </div>
              </div>
              <button
                onClick={handleCreateCompany}
                disabled={creatingCompany}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '12px 24px', borderRadius: 8, border: 'none',
                  backgroundColor: '#F59E0B', color: '#fff', cursor: 'pointer',
                  fontSize: 14, fontWeight: 600, opacity: creatingCompany ? 0.7 : 1,
                }}
              >
                {creatingCompany ? 'Creating...' : 'Complete Company Registration'}
              </button>
            </div>
          )}

          <div style={{
            padding: 24, borderRadius: 12, backgroundColor: config.bg,
            marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={24} color={config.color} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 16, fontWeight: 600, color: config.color, marginBottom: 2 }}>{config.title}</p>
              <p style={{ fontSize: 14, color: config.color, opacity: 0.8 }}>{config.description}</p>
            </div>
            <span style={{
              padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600,
              backgroundColor: config.color, color: '#fff', whiteSpace: 'nowrap',
            }}>
              {config.label}
            </span>
          </div>

          {user.rejectionReason && (
            <div style={{ marginBottom: 24, padding: '12px 16px', backgroundColor: '#FEE2E2', borderRadius: 'var(--radius-sm)', fontSize: 14, color: '#DC2626' }}>
              Reason: {user.rejectionReason}
            </div>
          )}

          {user.verificationNotes && (
            <div style={{ marginBottom: 24, padding: '12px 16px', backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-sm)', fontSize: 14, color: '#92400E' }}>
              Note: {user.verificationNotes}
            </div>
          )}

          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Progress</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {steps.map((step, index) => {
                const stepStatus = getStepStatus(step.key);
                return (
                  <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      backgroundColor: stepStatus === 'done' ? '#D1FAE5' : stepStatus === 'error' ? '#FEE2E2' : '#F1F5F9',
                    }}>
                      {stepStatus === 'done' ? (
                        <CheckCircle size={16} color="#10B981" />
                      ) : stepStatus === 'error' ? (
                        <XCircle size={16} color="#DC2626" />
                      ) : (
                        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#94A3B8' }} />
                      )}
                    </div>
                    <span style={{
                      flex: 1, fontSize: 14, fontWeight: 500,
                      color: stepStatus === 'done' ? '#10B981' : stepStatus === 'error' ? '#DC2626' : 'var(--text-secondary)',
                    }}>
                      {step.label}
                    </span>
                    {index < steps.length - 1 && (
                      <div style={{ width: 1, height: 24, backgroundColor: '#E2E8F0', marginLeft: 14 }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Link to={`/onboarding/${role}`} style={{ textDecoration: 'none' }}>
              <div style={{
                padding: 20, borderRadius: 12, backgroundColor: 'var(--surface)',
                border: '2px solid var(--border)', cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
                <Edit3 size={20} color="var(--primary)" style={{ marginBottom: 8 }} />
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Edit Profile</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Update your verification information</p>
              </div>
            </Link>

            <Link to={`/onboarding/${role}`} style={{ textDecoration: 'none' }}>
              <div style={{
                padding: 20, borderRadius: 12, backgroundColor: 'var(--surface)',
                border: '2px solid var(--border)', cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
                <Upload size={20} color="var(--primary)" style={{ marginBottom: 8 }} />
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Update Documents</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Upload or replace required documents</p>
              </div>
            </Link>

            <Link to="/companies" style={{ textDecoration: 'none' }}>
              <div style={{
                padding: 20, borderRadius: 12, backgroundColor: 'var(--surface)',
                border: '2px solid var(--border)', cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
                <Search size={20} color="var(--primary)" style={{ marginBottom: 8 }} />
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Browse Public Companies</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Explore franchise opportunities</p>
              </div>
            </Link>

            <Link to="/about" style={{ textDecoration: 'none' }}>
              <div style={{
                padding: 20, borderRadius: 12, backgroundColor: 'var(--surface)',
                border: '2px solid var(--border)', cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
                <BookOpen size={20} color="var(--primary)" style={{ marginBottom: 8 }} />
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Getting Started Guide</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Learn how to use Franchisia</p>
              </div>
            </Link>
          </div>

          {config.note && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 24, textAlign: 'center' }}>{config.note}</p>
          )}
        </div>
      </main>
    </div>
  );
}