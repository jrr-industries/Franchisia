import { Link } from 'react-router-dom';
import { ArrowRight, Target, Eye, Award, Clock, Users, Globe } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { useSiteValue } from '../../context/SiteContext';

export default function About() {
  const about = useSiteValue('about');

  const stats = [
    { value: '10K+', label: 'Active Listings', icon: Globe },
    { value: '50K+', label: 'Professionals', icon: Users },
    { value: '12+', label: 'Years Expertise', icon: Award },
    { value: '98%', label: 'Satisfaction', icon: Clock },
  ];

  return (
    <div>
      <section style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <Badge variant="info" style={{ marginBottom: 16 }}>About Us</Badge>
          <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 20, letterSpacing: '-0.02em' }}>
            {about.heroTitle.split('Franchise')[0]}<span style={{ color: 'var(--primary)' }}>Franchise{about.heroTitle.split('Franchise')[1] || ' Networking'}</span>
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 640, margin: '0 auto 32px' }}>
            {about.heroDesc}
          </p>
          <Link to="/signup">
            <Button size="lg" icon={<ArrowRight size={18} />}>Join Our Network</Button>
          </Link>
        </div>
      </section>

      <section style={{ padding: '80px 0', backgroundColor: 'var(--background)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            <Card padding="32px">
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Target size={24} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Our Mission</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{about.mission}</p>
            </Card>
            <Card padding="32px">
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Eye size={24} color="var(--accent)" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Our Vision</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{about.vision}</p>
            </Card>
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>Meet Our Team</h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
              Passionate people dedicated to transforming the franchise industry.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {about.teamMembers.map((member) => (
              <Card key={member.name} padding="24px" hover={false}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                  <Avatar name={member.name} size={56} />
                  <div>
                    <h4 style={{ fontSize: 16, fontWeight: 600 }}>{member.name}</h4>
                    <p style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 500 }}>{member.role}</p>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{member.bio}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 0', backgroundColor: 'var(--background)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>Our Journey</h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>
              From a bold idea to an industry-leading platform.
            </p>
          </div>
          <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 19, top: 0, bottom: 0, width: 2, backgroundColor: 'var(--border)' }} />
            {about.timeline.map((item, i) => (
              <div key={item.year} style={{ display: 'flex', gap: 24, marginBottom: 32, position: 'relative' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', zIndex: 1 }}>
                  <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{item.year.slice(2)}</span>
                </div>
                <div>
                  <Badge variant={i === about.timeline.length - 1 ? 'success' : 'default'} style={{ marginBottom: 6 }}>{item.year}</Badge>
                  <h4 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{item.title}</h4>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, textAlign: 'center' }}>
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Icon size={22} color="var(--primary)" />
                  </div>
                  <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)', fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>{s.value}</p>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
