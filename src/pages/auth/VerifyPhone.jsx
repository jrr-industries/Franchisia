import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, RefreshCw } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';

export default function VerifyPhone() {
  const { user, sendPhoneOtp, verifyPhone } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!user.emailVerified) {
      navigate('/verify-email');
      return;
    }
    if (user.phoneVerified) {
      navigate('/select-role');
    }
  }, [user, navigate]);

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!phone) {
      setError('Please enter your phone number');
      return;
    }
    setResending(true);
    setError('');
    setMessage('');
    try {
      await sendPhoneOtp(phone);
      setStep('otp');
      setMessage('OTP sent to your phone');
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }
    setSubmitting(true);
    try {
      await verifyPhone(otp);
      navigate('/select-role');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <Card padding="40px" hover={false} style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 24, color: 'var(--primary)', marginBottom: 20 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'inline-block' }} />
            Franchisia
          </Link>
          <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Phone size={24} style={{ color: 'var(--primary)' }} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Verify Your Phone</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            {step === 'phone' ? 'Enter your phone number to receive an OTP' : `OTP sent to ${phone}`}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} style={{
              width: 8, height: 8, borderRadius: '50%',
              backgroundColor: s <= 3 ? 'var(--primary)' : 'var(--border)',
            }} />
          ))}
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>Step 3 of 5</span>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: 'var(--radius-sm)', fontSize: 14, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ padding: '12px 16px', backgroundColor: '#D1FAE5', color: '#059669', borderRadius: 'var(--radius-sm)', fontSize: 14, marginBottom: 16 }}>
            {message}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              icon={<Phone size={16} />}
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setError(''); }}
              placeholder="+1 (555) 123-4567"
              required
            />
            <Button type="submit" size="lg" icon={<ArrowRight size={18} />} fullWidth disabled={resending}>
              {resending ? 'Sending...' : 'Send OTP'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Enter OTP"
              name="otp"
              value={otp}
              onChange={(e) => { setOtp(e.target.value); setError(''); }}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              required
            />
            <Button type="submit" size="lg" icon={<ArrowRight size={18} />} fullWidth disabled={submitting}>
              {submitting ? 'Verifying...' : 'Verify Phone'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setStep('phone')}>
              Change phone number
            </Button>
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={handleSendOtp}
                disabled={resending}
                style={{
                  background: 'none', border: 'none', color: 'var(--primary)',
                  fontWeight: 500, fontSize: 14, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}
              >
                <RefreshCw size={14} />
                {resending ? 'Resending...' : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
