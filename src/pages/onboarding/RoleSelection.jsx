import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, UserCheck, Package, Handshake, DollarSign, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from "../../assets/logo.png";

const roles = [
  { value: 'franchisor', label: 'Franchisor', desc: 'Own or represent a franchise brand.', icon: Building2 },
  { value: 'franchisee', label: 'Franchisee', desc: 'Looking to invest in and operate a franchise.', icon: UserCheck },
  { value: 'supplier', label: 'Supplier', desc: 'Provide products or services to franchise businesses.', icon: Package },
  { value: 'consultant', label: 'Consultant', desc: 'Help franchisors and franchisees grow.', icon: Handshake },
  { value: 'investor', label: 'Investor', desc: 'Invest in franchise businesses.', icon: DollarSign },
];

const roleEmojis = {
  franchisor: '🏢', franchisee: '💼', supplier: '📦', consultant: '🤝', investor: '💰',
};

export default function RoleSelection() {
  const { user, selectRole } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) { setError('Please select a role'); return; }
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--background)' }}>
      <header style={{ padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <img src={logo} alt="Franchisia" style={{ height: 48, width: 'auto' }} />
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
          Back to Home
        </button>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px 60px' }}>
        <div style={{ width: '100%', maxWidth: 640 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>Choose Your Role</h1>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>Select how you'll use Franchisia.</p>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: 'var(--radius-sm)', fontSize: 14, marginBottom: 16 }}>{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {roles.map((r) => {
                const isSelected = selected === r.value;
                const Icon = r.icon;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => { setSelected(r.value); setError(''); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', width: '100%',
                      borderRadius: 12, cursor: 'pointer', textAlign: 'left', border: 'none',
                      backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--surface)',
                      outline: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                      outlineOffset: -1,
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontSize: 32, width: 48, textAlign: 'center', flexShrink: 0 }}>
                      {r.value === 'franchisor' ? '🏢' : r.value === 'franchisee' ? '💼' : r.value === 'supplier' ? '📦' : r.value === 'consultant' ? '🤝' : '💰'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 2 }}>{r.label}</div>
                      <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{r.desc}</div>
                    </div>
                    {isSelected && (
                      <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Check size={14} color="#fff" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%',
                padding: '16px 32px', borderRadius: 8, border: 'none', cursor: 'pointer',
                backgroundColor: selected ? 'var(--primary)' : '#D1D5DB', color: '#fff',
                fontSize: 16, fontWeight: 600, transition: 'all 0.15s',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Continuing...' : 'Continue'}
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}