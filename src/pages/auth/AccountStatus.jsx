import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, UserCheck, ShieldCheck, XCircle, AlertCircle, Clock } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const statusConfig = {
  pending_email_verification: {
    label: 'Pending Email Verification',
    icon: Mail,
    color: '#F59E0B',
    bg: '#FEF3C7',
    description: 'Please verify your email address to continue.',
    action: { label: 'Verify Email', to: '/verify-email' },
  },
  pending_phone_verification: {
    label: 'Pending Phone Verification',
    icon: Phone,
    color: '#F59E0B',
    bg: '#FEF3C7',
    description: 'Please verify your phone number to continue.',
    action: { label: 'Verify Phone', to: '/verify-phone' },
  },
  pending_profile_completion: {
    label: 'Pending Profile Completion',
    icon: UserCheck,
    color: '#F59E0B',
    bg: '#FEF3C7',
    description: 'Please complete your profile and select your role.',
    action: { label: 'Complete Profile', to: '/select-role' },
  },
  pending_admin_review: {
    label: 'Under Admin Review',
    icon: Clock,
    color: '#8B5CF6',
    bg: '#EDE9FE',
    description: 'Your documents are being reviewed by our team. This usually takes 1-2 business days.',
    action: null,
  },
  verified: {
    label: 'Verified',
    icon: ShieldCheck,
    color: '#10B981',
    bg: '#D1FAE5',
    description: 'Your account is fully verified. Welcome to Franchisia!',
    action: { label: 'Go to Dashboard', to: '/dashboard' },
  },
  rejected: {
    label: 'Verification Rejected',
    icon: XCircle,
    color: '#DC2626',
    bg: '#FEE2E2',
    description: 'Your verification was rejected. Please contact support for more information.',
    action: null,
  },
  need_more_information: {
    label: 'Additional Information Required',
    icon: AlertCircle,
    color: '#F59E0B',
    bg: '#FEF3C7',
    description: 'Our team needs more information to verify your account.',
    action: { label: 'Upload Documents', to: '/upload-documents' },
  },
};

const steps = [
  { key: 'email_verified', label: 'Email Verified', icon: Mail, getStatus: (u) => u?.emailVerified ? 'done' : 'pending' },
  { key: 'phone_verified', label: 'Phone Verified', icon: Phone, getStatus: (u) => u?.phoneVerified ? 'done' : 'pending' },
  { key: 'profile', label: 'Profile Complete', icon: UserCheck, getStatus: (u) => u?.accountStatus !== 'pending_profile_completion' ? 'done' : 'pending' },
  { key: 'admin_review', label: 'Admin Review', icon: Clock, getStatus: (u) => {
    if (['franchisee', 'investor'].includes(u?.role) && u?.emailVerified && u?.phoneVerified) return 'done';
    if (['pending_admin_review', 'verified', 'rejected'].includes(u?.accountStatus)) return u?.accountStatus === 'verified' ? 'done' : 'current';
    return 'pending';
  }},
  { key: 'verified', label: 'Verified', icon: ShieldCheck, getStatus: (u) => u?.accountStatus === 'verified' ? 'done' : u?.accountStatus === 'rejected' ? 'error' : 'pending' },
];

export default function AccountStatus() {
  const { user, fetchAuthStatus } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchAuthStatus().finally(() => setLoading(false));
  }, [user, navigate, fetchAuthStatus]);

  if (loading || !user) return null;

  const config = statusConfig[user.accountStatus] || statusConfig.pending_email_verification;
  const Icon = config.icon;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <Card padding="40px" hover={false} style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: config.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Icon size={32} style={{ color: config.color }} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{config.label}</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{config.description}</p>
          {user.rejectionReason && (
            <div style={{ marginTop: 12, padding: '12px 16px', backgroundColor: '#FEE2E2', borderRadius: 'var(--radius-sm)', fontSize: 14, color: '#DC2626' }}>
              Reason: {user.rejectionReason}
            </div>
          )}
          {user.verificationNotes && (
            <div style={{ marginTop: 12, padding: '12px 16px', backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-sm)', fontSize: 14, color: '#92400E' }}>
              Note: {user.verificationNotes}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {steps.map((step, idx) => {
            const status = step.getStatus(user);
            const Icon = step.icon;
            return (
              <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    backgroundColor: status === 'done' ? '#D1FAE5' : status === 'error' ? '#FEE2E2' : status === 'current' ? '#EDE9FE' : '#F3F4F6',
                    color: status === 'done' ? '#10B981' : status === 'error' ? '#DC2626' : status === 'current' ? '#8B5CF6' : '#D1D5DB',
                  }}>
                    <Icon size={18} />
                  </div>
                  {idx < steps.length - 1 && (
                    <div style={{
                      width: 2, height: 24,
                      backgroundColor: status === 'done' ? '#10B981' : '#E5E7EB',
                    }} />
                  )}
                </div>
                <span style={{
                  fontSize: 14, fontWeight: 500,
                  color: status === 'done' ? '#10B981' : status === 'error' ? '#DC2626' : status === 'current' ? 'var(--text)' : '#D1D5DB',
                }}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {config.action && (
          <Button onClick={() => navigate(config.action.to)} size="lg" fullWidth>
            {config.action.label}
          </Button>
        )}
      </Card>
    </div>
  );
}
