import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { useSiteValue } from '../../context/SiteContext';

export default function Contact() {
  const contact = useSiteValue('contact');
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const contactInfo = [
    { icon: Mail, label: 'Email', value: contact.email, desc: 'We respond within 24 hours' },
    { icon: Phone, label: 'Phone', value: contact.phone, desc: 'Mon-Fri 9am-6pm EST' },
    { icon: MapPin, label: 'Office', value: contact.address, desc: '123 Market Street, Suite 400' },
  ];

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
            <Badge variant="info" style={{ marginBottom: 12 }}>Support</Badge>
            <h1 style={{ fontSize: 42, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em', color: 'var(--on-surface)' }}>Get in Touch</h1>
            <p style={{ fontSize: 16, color: 'var(--on-surface-variant)', maxWidth: 500, margin: '0 auto' }}>
              Have questions or feedback? We'd love to hear from you.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 48, flexWrap: 'wrap', justifyContent: 'center' }}>
            {contactInfo.map((item) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', backgroundColor: 'var(--surface)', border: '1px solid var(--outline-variant)', borderRadius: 12, flex: '1 1 180px', minWidth: 180 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <item.icon size={18} color="var(--primary)" />
                </div>
                <div>
                  <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 2 }}>{item.label}</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)' }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <Card padding="32px">
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p style={{ fontSize: 24, marginBottom: 12 }}>🎉</p>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Message Sent!</h2>
                <p style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>Thank you for reaching out. We'll get back to you soon.</p>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Send us a message</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Input label="Your Name" name="name" value={form.name} onChange={handleChange} required placeholder="John Doe" />
                    <Input label="Your Email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="john@example.com" />
                  </div>
                  <Input label="Subject" name="subject" value={form.subject} onChange={handleChange} required placeholder="How can we help?" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)' }}>Message</label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      placeholder="Tell us more about your inquiry..."
                      rows={5}
                      style={{ padding: '10px 16px', fontSize: 14, border: '1px solid var(--outline-variant)', borderRadius: 10, backgroundColor: 'var(--surface-container-low)', color: 'var(--on-surface)', outline: 'none', resize: 'vertical' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--outline-variant)'; }}
                    />
                  </div>
                  <Button type="submit" icon={<Send size={16} />} fullWidth>Send Message</Button>
                </form>
              </>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}
