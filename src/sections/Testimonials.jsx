import { Star } from 'lucide-react';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';

const testimonials = [
  { name: 'Sarah Johnson', role: 'Franchisor, Coffee Chain', text: 'Franchisia helped us connect with qualified franchisees across the country. The platform made the entire process seamless.', rating: 5 },
  { name: 'Mark Williams', role: 'Franchisee', text: 'I found my dream franchise through Franchisia. The search filters and company profiles gave me all the information I needed to make a decision.', rating: 5 },
  { name: 'Emily Chen', role: 'Broker', text: 'As a broker, this platform has been invaluable. I can manage multiple clients and opportunities all in one place.', rating: 5 },
  { name: 'David Rodriguez', role: 'Investor', text: 'The analytics and ROI calculators gave me the confidence to invest. Highly recommended for serious investors.', rating: 4 },
];

export default function Testimonials() {
  return (
    <section style={{ padding: '80px 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>What Our Users Say</h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
            Join thousands of professionals who have found success on Franchisia.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {testimonials.map((t) => (
            <Card key={t.name} padding="24px">
              <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} fill={i < t.rating ? '#F59E0B' : 'none'} color={i < t.rating ? '#F59E0B' : 'var(--border)'} />
                ))}
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16, fontStyle: 'italic' }}>"{t.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar name={t.name} size={36} />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
