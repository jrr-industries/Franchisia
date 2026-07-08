import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import Button from '../components/ui/Button';

const plans = [
  {
    name: 'Starter', price: '$0', period: 'forever', desc: 'Perfect for getting started',
    features: ['Basic profile', 'Browse franchises', 'Email support'],
    cta: 'Get Started', variant: 'outline',
  },
  {
    name: 'Professional', price: '$10', period: '/month', desc: 'For serious franchise seekers', popular: true,
    features: ['Verified profile', 'Unlimited search', 'Direct messaging', 'Investment calculator', 'Priority support', 'Application tracking'],
    cta: 'Start Free Trial', variant: 'primary',
  },
  {
    name: 'Enterprise', price: '$25', period: '/month', desc: 'For franchisors & brokers',
    features: ['Everything in Pro', 'Unlimited listings', 'CRM tools', 'Analytics dashboard', 'Dedicated manager', 'Custom branding'],
    cta: 'Contact Sales', variant: 'outline',
  },
];

export default function PricingSection() {
  return (
    <section style={{ padding: '80px 0', backgroundColor: 'var(--background)' }} id="pricing">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>Simple, Transparent Pricing</h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
            Choose the plan that fits your needs. No hidden fees.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
          {plans.map((plan) => (
            <div
              key={plan.name}
              style={{
                backgroundColor: 'var(--surface)',
                border: `2px solid ${plan.popular ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: 32,
                position: 'relative',
              }}
            >
              {plan.popular && (
                <span style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--primary)', color: '#fff', padding: '4px 16px', borderRadius: 100, fontSize: 12, fontWeight: 600 }}>
                  Most Popular
                </span>
              )}
              <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{plan.name}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>{plan.desc}</p>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 40, fontWeight: 800 }}>{plan.price}</span>
                <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{plan.period}</span>
              </div>
              <Link to="/signup"><Button variant={plan.variant} fullWidth>{plan.cta}</Button></Link>
              <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-secondary)' }}>
                    <Check size={16} color="var(--accent)" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
