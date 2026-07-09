import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!agreeTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }
    setSubmitting(true);
    try {
      await signup({ email: form.email, password: form.password, name: form.name });
      navigate('/onboarding', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <Card padding="40px" hover={false} style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 24, color: 'var(--primary)', marginBottom: 20 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'inline-block' }} />
            Franchisia
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Create Your Account</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Join the franchise network today.</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} style={{
              width: 8, height: 8, borderRadius: '50%',
              backgroundColor: s === 1 ? 'var(--primary)' : 'var(--border)',
            }} />
          ))}
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>Step 1 of 5</span>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: 'var(--radius-sm)', fontSize: 14, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Full Name"
            name="name"
            icon={<User size={16} />}
            value={form.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />
          <Input
            label="Email Address"
            name="email"
            type="email"
            icon={<Mail size={16} />}
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />
          <Input
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            icon={<Lock size={16} />}
            rightIcon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            onRightIconClick={() => setShowPassword(!showPassword)}
            value={form.password}
            onChange={handleChange}
            placeholder="Min. 8 characters"
            required
          />
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            icon={<Lock size={16} />}
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            required
          />
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--primary)', marginTop: 2, flexShrink: 0 }}
            />
            <span>
              I agree to the{' '}
              <Link to="/terms" style={{ color: 'var(--primary)', fontWeight: 500 }}>Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" style={{ color: 'var(--primary)', fontWeight: 500 }}>Privacy Policy</Link>
            </span>
          </label>
          <Button type="submit" size="lg" icon={<UserPlus size={18} />} fullWidth disabled={submitting}>
            {submitting ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </Card>
    </div>
  );
}
