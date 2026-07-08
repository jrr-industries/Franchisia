import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'hello@franchisia.com', desc: 'We respond within 24 hours' },
  { icon: Phone, label: 'Phone', value: '+1 (555) 123-4567', desc: 'Mon-Fri 9am-6pm EST' },
  { icon: MapPin, label: 'Office', value: 'San Francisco, CA', desc: '123 Market Street, Suite 400' },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div>
      <section style={{ padding: '80px 0' }}>
        <div className="container" style={{ maxWidth: 700 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <Badge variant="info" style={{ marginBottom: 12 }}>Get in Touch</Badge>
            <h1 style={{ fontSize: 42, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em' }}>Contact Us</h1>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
              Have a question or want to learn more? We'd love to hear from you.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 48 }}>
            {contactInfo.map((info) => {
              const Icon = info.icon;
              return (
                <Card key={info.label} padding="20px" hover={false}>
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <Icon size={18} color="var(--primary)" />
                  </div>
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{info.label}</h4>
                  <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500, marginBottom: 4 }}>{info.value}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{info.desc}</p>
                </Card>
              );
            })}
          </div>

          {submitted ? (
            <Card padding="40px" hover={false} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
              <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Message Sent!</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
                Thank you for reaching out. We'll get back to you within 24 hours.
              </p>
              <Button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}>Send Another Message</Button>
            </Card>
          ) : (
            <Card padding="32px" hover={false}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24 }}>Send us a message</h3>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Input label="Your Name" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
                  <Input label="Your Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com" required />
                </div>
                <Input label="Subject" name="subject" value={form.subject} onChange={handleChange} placeholder="How can we help?" required />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your inquiry..."
                    required
                    rows={5}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      fontSize: 14,
                      color: 'var(--text)',
                      backgroundColor: 'var(--surface)',
                      border: '2px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      outline: 'none',
                      resize: 'vertical',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  />
                </div>
                <Button type="submit" size="lg" icon={<Send size={16} />} fullWidth>Send Message</Button>
              </form>
            </Card>
          )}
        </div>
      </section>

      <section style={{ padding: '0 0 80px' }}>
        <div className="container">
          <Card padding="0" hover={false} style={{ overflow: 'hidden', height: 300 }}>
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'var(--surface-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                fontSize: 14,
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <MapPin size={32} style={{ margin: '0 auto 8px', display: 'block' }} />
                <p>Map Placeholder — San Francisco, CA</p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
