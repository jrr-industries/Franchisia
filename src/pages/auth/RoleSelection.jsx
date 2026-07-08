import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2, UserCheck, Package, Handshake, DollarSign, ArrowRight,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';

const roles = [
  {
    value: 'franchisor',
    label: "I'm a Franchisor",
    desc: 'Post franchise opportunities and grow your brand',
    icon: Building2,
    color: '#2563EB',
    bg: '#DBEAFE',
  },
  {
    value: 'franchisee',
    label: "I'm a Franchisee",
    desc: 'Find and apply to franchise opportunities',
    icon: UserCheck,
    color: '#10B981',
    bg: '#D1FAE5',
  },
  {
    value: 'supplier',
    label: "I'm a Supplier",
    desc: 'Sell products and services to franchises',
    icon: Package,
    color: '#F59E0B',
    bg: '#FEF3C7',
  },
  {
    value: 'consultant',
    label: "I'm a Consultant",
    desc: 'Connect franchisors with the right franchisees',
    icon: Handshake,
    color: '#8B5CF6',
    bg: '#EDE9FE',
  },
  {
    value: 'investor',
    label: "I'm an Investor",
    desc: 'Discover and invest in franchise opportunities',
    icon: DollarSign,
    color: '#EC4899',
    bg: '#FCE7F3',
  },
];

export default function RoleSelection() {
  const { user, selectRole } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!user.emailVerified) {
      navigate('/verify-email');
      return;
    }
    if (!user.phoneVerified) {
      navigate('/verify-phone');
      return;
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) {
      setError('Please select how you want to use Franchisia');
      return;
    }
    setSubmitting(true);
    try {
      await selectRole(selected);
      navigate(`/onboarding/${selected}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <Card padding="40px" hover={false} style={{ width: '100%', maxWidth: 560 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 24, color: 'var(--primary)', marginBottom: 20 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'inline-block' }} />
            Franchisia
          </Link>
          <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Handshake size={24} style={{ color: 'var(--primary)' }} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>How will you use Franchisia?</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Choose your role to get started</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} style={{
              width: 8, height: 8, borderRadius: '50%',
              backgroundColor: s <= 4 ? 'var(--primary)' : 'var(--border)',
            }} />
          ))}
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>Step 4 of 5</span>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: 'var(--radius-sm)', fontSize: 14, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {roles.map((r) => {
              const isSelected = selected === r.value;
              const Icon = r.icon;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => { setSelected(r.value); setError(''); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
                    borderRadius: 'var(--radius-sm)', cursor: 'pointer', textAlign: 'left',
                    border: `2px solid ${isSelected ? r.color : 'var(--border)'}`,
                    backgroundColor: isSelected ? `${r.bg}` : 'var(--surface)',
                    transition: 'all 0.15s', width: '100%',
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    backgroundColor: isSelected ? r.color : r.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isSelected ? '#fff' : r.color, flexShrink: 0,
                  }}>
                    <Icon size={22} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{r.label}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r.desc}</p>
                  </div>
                  {isSelected && (
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      backgroundColor: r.color, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ color: '#fff', fontSize: 14 }}>&#10003;</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <Button type="submit" size="lg" icon={<ArrowRight size={18} />} fullWidth disabled={submitting}>
            {submitting ? 'Continuing...' : 'Continue'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
