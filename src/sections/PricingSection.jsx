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
    <section style={{ padding: '80px 0', backgroundColor: 'var(--surface-container-lowest)' }} id="pricing">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: 'var(--on-surface)' }}>Simple, Transparent Pricing</h2>
          <p style={{ fontSize: 16, color: 'var(--on-surface-variant)', maxWidth: 600, margin: '0 auto' }}>
            Choose the plan that fits your needs. No hidden fees.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
          {plans.map((plan) => (
            <div
              key={plan.name}
              style={{
                backgroundColor: 'var(--surface)',
                border: `2px solid ${plan.popular ? 'var(--primary)' : 'var(--outline-variant)'}`,
                borderRadius: 12,
                padding: 32,
                position: 'relative',
              }}
            >
              {plan.popular && (
                <span style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--primary)', color: '#fff', padding: '4px 16px', borderRadius: 100, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Most Popular
                </span>
              )}
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: 'var(--on-surface)' }}>{plan.name}</h3>
              <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', marginBottom: 20 }}>{plan.desc}</p>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 40, fontWeight: 800, color: 'var(--on-surface)' }}>{plan.price}</span>
                <span style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>{plan.period}</span>
              </div>
              <Button variant={plan.variant} fullWidth>{plan.cta}</Button>
              <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--on-surface-variant)' }}>
                    <Check size={16} color="var(--primary)" />
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
