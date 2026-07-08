import { Check, X } from 'lucide-react';
import PricingSection from '../../sections/PricingSection';
import FAQSection from '../../sections/FAQSection';
import Badge from '../../components/ui/Badge';

const features = [
  { name: 'Basic Profile', free: true, pro: true, enterprise: true },
  { name: 'Browse Franchises', free: true, pro: true, enterprise: true },
  { name: 'Email Support', free: true, pro: true, enterprise: true },
  { name: 'Verified Profile', free: false, pro: true, enterprise: true },
  { name: 'Unlimited Search', free: false, pro: true, enterprise: true },
  { name: 'Direct Messaging', free: false, pro: true, enterprise: true },
  { name: 'Investment Calculator', free: false, pro: true, enterprise: true },
  { name: 'Priority Support', free: false, pro: true, enterprise: true },
  { name: 'Application Tracking', free: false, pro: true, enterprise: true },
  { name: 'Unlimited Listings', free: false, pro: false, enterprise: true },
  { name: 'CRM Tools', free: false, pro: false, enterprise: true },
  { name: 'Analytics Dashboard', free: false, pro: false, enterprise: true },
  { name: 'Dedicated Manager', free: false, pro: false, enterprise: true },
  { name: 'Custom Branding', free: false, pro: false, enterprise: true },
];

export default function Pricing() {
  return (
    <div>
      <PricingSection />

      <section style={{ padding: '80px 0', backgroundColor: 'var(--background)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <Badge variant="info" style={{ marginBottom: 12 }}>Comparison</Badge>
            <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>Compare Plans</h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
              See exactly what you get with each plan.
            </p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Feature</th>
                  <th style={{ textAlign: 'center', padding: '16px 20px', fontSize: 14, fontWeight: 600 }}>Starter</th>
                  <th style={{ textAlign: 'center', padding: '16px 20px', fontSize: 14, fontWeight: 600, color: 'var(--primary)' }}>Professional</th>
                  <th style={{ textAlign: 'center', padding: '16px 20px', fontSize: 14, fontWeight: 600 }}>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {features.map((f) => (
                  <tr key={f.name} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: 'var(--text)' }}>{f.name}</td>
                    <td style={{ textAlign: 'center', padding: '14px 20px' }}>
                      {f.free ? <Check size={18} color="var(--accent)" style={{ margin: '0 auto' }} /> : <X size={18} color="var(--text-muted)" style={{ margin: '0 auto' }} />}
                    </td>
                    <td style={{ textAlign: 'center', padding: '14px 20px' }}>
                      {f.pro ? <Check size={18} color="var(--accent)" style={{ margin: '0 auto' }} /> : <X size={18} color="var(--text-muted)" style={{ margin: '0 auto' }} />}
                    </td>
                    <td style={{ textAlign: 'center', padding: '14px 20px' }}>
                      {f.enterprise ? <Check size={18} color="var(--accent)" style={{ margin: '0 auto' }} /> : <X size={18} color="var(--text-muted)" style={{ margin: '0 auto' }} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <FAQSection />
    </div>
  );
}
