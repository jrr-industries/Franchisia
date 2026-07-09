import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Clock, ShieldCheck, XCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const statusConfig = {
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
    title: 'You\'re Verified!',
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

export default function VerificationStatus() {
  const { user, fetchAuthStatus } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) return null;

  const status = user.accountStatus;
  const config = statusConfig[status] || statusConfig.pending_admin_review;
  const Icon = config.icon;

  const isPending = status === 'pending_admin_review';
  const isVerified = status === 'verified';
  const isRejected = status === 'rejected';
  const needsInfo = status === 'need_more_information';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--background)' }}>
      <header style={{ padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 22, color: 'var(--primary)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'inline-block' }} />
          Franchisia
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: config.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Icon size={40} color={config.color} />
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{config.title}</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>{config.description}</p>

          <div style={{
            padding: '16px 24px', borderRadius: 12, backgroundColor: config.bg,
            marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: config.color }}>Current Status:</span>
            <span style={{ fontSize: 14, color: config.color }}>{config.label}</span>
          </div>

          {config.note && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 32 }}>{config.note}</p>
          )}

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

          {needsInfo && (
            <div style={{ marginBottom: 24, padding: '12px 16px', backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-sm)', fontSize: 14, color: '#92400E' }}>
              Please upload the requested documents to continue.
            </div>
          )}

          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%',
              padding: '16px 32px', borderRadius: 8, border: 'none', cursor: 'pointer',
              backgroundColor: 'var(--primary)', color: '#fff', fontSize: 16, fontWeight: 600,
            }}
          >
            Go to Dashboard
            <ArrowRight size={18} />
          </button>
        </div>
      </main>
    </div>
  );
}