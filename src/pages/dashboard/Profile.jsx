import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  MapPin, Briefcase, Mail, MessageSquare, UserPlus, Calendar,
  GraduationCap, Star, ExternalLink, Award, ThumbsUp
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Tabs from '../../components/ui/Tabs';

const s = {
  page: { maxWidth: 1000, margin: '0 auto' },
  cover: {
    height: 220, borderRadius: 'var(--radius-lg)',
    background: 'linear-gradient(135deg, var(--primary), #7C3AED, var(--accent))',
    position: 'relative', marginBottom: 60,
  },
  infoRow: {
    display: 'flex', alignItems: 'flex-end', gap: 24, padding: '0 32px',
    marginTop: -50, position: 'relative', zIndex: 1,
  },
  infoText: { flex: 1 },
  name: { fontSize: 24, fontWeight: 700, marginBottom: 4 },
  title: { fontSize: 15, color: 'var(--text-secondary)', marginBottom: 6 },
  loc: { fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 },
  stats: {
    display: 'flex', gap: 32, padding: '20px 32px', borderBottom: '1px solid var(--border)', marginBottom: 24,
  },
  stat: { textAlign: 'center' },
  statVal: { fontSize: 22, fontWeight: 700 },
  statLabel: { fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 },
  btns: { display: 'flex', gap: 12, marginLeft: 'auto', alignItems: 'flex-end', paddingBottom: 4 },
  sectionTitle: { fontSize: 16, fontWeight: 600, marginBottom: 16 },
  expCard: {
    padding: 16, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
    marginBottom: 12,
  },
  expHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  expRole: { fontWeight: 600, fontSize: 15 },
  expCompany: { fontSize: 14, color: 'var(--text-secondary)', marginBottom: 2 },
  expDate: { fontSize: 13, color: 'var(--text-muted)' },
  skillChip: {
    display: 'inline-flex', padding: '6px 16px', backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)', borderRadius: 100, fontSize: 13, fontWeight: 500,
  },
  appCard: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: 12,
  },
  reviewCard: {
    padding: 16, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: 12,
  },
  stars: { display: 'flex', gap: 2, color: '#F59E0B', marginBottom: 8 },
};

const experience = [
  { company: 'Franchise Corp', role: 'Senior Franchise Consultant', dates: 'Jan 2023 - Present', description: 'Leading franchise development strategies.' },
  { company: 'Business Growth Inc', role: 'Business Analyst', dates: 'Jun 2020 - Dec 2022', description: 'Analyzed market trends and expansion opportunities.' },
];

const education = [
  { school: 'University of Business', degree: 'MBA in Entrepreneurship', year: '2020' },
  { school: 'State University', degree: 'BBA in Marketing', year: '2018' },
];

const skills = ['Franchise Development', 'Market Analysis', 'Negotiation', 'Business Strategy', 'Financial Modeling', 'Operations Management'];

const interests = ['Food & Beverage', 'Retail', 'Healthcare', 'Education', 'Real Estate', 'Technology'];

const applications = [
  { name: 'Pizza Palace Franchise', status: 'Under Review', date: 'Mar 15, 2026' },
  { name: 'FitZone Gym', status: 'Approved', date: 'Feb 28, 2026' },
  { name: 'CleanPro Services', status: 'Pending', date: 'Apr 2, 2026' },
];

const reviews = [
  { author: 'Michael R.', rating: 5, text: 'Excellent consultant with deep industry knowledge.', date: '2 weeks ago' },
  { author: 'Sarah L.', rating: 4, text: 'Very helpful in finding the right franchise opportunity.', date: '1 month ago' },
];

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('about');

  const aboutContent = (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h3 style={s.sectionTitle}>Bio</h3>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Passionate franchise consultant with over 6 years of experience helping entrepreneurs find
          and invest in the right franchise opportunities. Specializing in emerging brands and market expansion strategies.
        </p>
      </div>

      <div style={{ marginBottom: 28 }}>
        <h3 style={s.sectionTitle}>Experience</h3>
        {experience.map((exp, i) => (
          <div key={i} style={s.expCard}>
            <div style={s.expHeader}>
              <div>
                <div style={s.expRole}>{exp.role}</div>
                <div style={s.expCompany}>{exp.company}</div>
              </div>
              <div style={s.expDate}>{exp.dates}</div>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>{exp.description}</p>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 28 }}>
        <h3 style={s.sectionTitle}>Education</h3>
        {education.map((edu, i) => (
          <div key={i} style={s.expCard}>
            <div style={s.expHeader}>
              <div>
                <div style={s.expRole}>{edu.degree}</div>
                <div style={s.expCompany}>{edu.school}</div>
              </div>
              <div style={s.expDate}>{edu.year}</div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 style={s.sectionTitle}>Skills</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {skills.map((skill, i) => (
            <Badge key={i} variant="info">{skill}</Badge>
          ))}
        </div>
      </div>
    </div>
  );

  const interestsContent = (
    <div>
      <h3 style={s.sectionTitle}>Industry Interests</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {interests.map((item, i) => (
          <span key={i} style={s.skillChip}>{item}</span>
        ))}
      </div>
    </div>
  );

  const applicationsContent = (
    <div>
      <h3 style={s.sectionTitle}>Applications</h3>
      {applications.map((app, i) => (
        <div key={i} style={s.appCard}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{app.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={14} /> {app.date}
            </div>
          </div>
          <Badge variant={app.status === 'Approved' ? 'success' : app.status === 'Under Review' ? 'warning' : 'default'}>
            {app.status}
          </Badge>
        </div>
      ))}
    </div>
  );

  const reviewsContent = (
    <div>
      <h3 style={s.sectionTitle}>Reviews</h3>
      {reviews.map((rev, i) => (
        <div key={i} style={s.reviewCard}>
          <div style={s.stars}>
            {Array.from({ length: 5 }).map((_, si) => (
              <Star key={si} size={16} fill={si < rev.rating ? '#F59E0B' : 'none'} />
            ))}
          </div>
          <p style={{ fontSize: 14, color: 'var(--text)', marginBottom: 8 }}>{rev.text}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)' }}>
            <span>{rev.author}</span>
            <span>{rev.date}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const tabs = [
    { id: 'about', label: 'About', content: aboutContent },
    { id: 'interests', label: 'Interests', content: interestsContent },
    { id: 'applications', label: 'Applications', content: applicationsContent },
    { id: 'reviews', label: 'Reviews', content: reviewsContent },
  ];

  return (
    <div style={s.page}>
      <div style={s.cover} />

      <div style={s.infoRow}>
        <Avatar src={user?.avatar} name={user?.name || 'User'} size={80} style={{ border: '4px solid var(--surface)' }} />
        <div style={s.infoText}>
          <h1 style={s.name}>{user?.name || 'Alex Johnson'}</h1>
          <div style={s.title}><Briefcase size={14} style={{ marginRight: 6 }} />Senior Franchise Consultant</div>
          <div style={s.loc}><MapPin size={14} />New York, USA</div>
        </div>
        <div style={s.btns}>
          <Button variant="primary" size="sm" icon={<MessageSquare size={16} />}>Message</Button>
          <Button variant="outline" size="sm" icon={<UserPlus size={16} />}>Follow</Button>
        </div>
      </div>

      <div style={s.stats}>
        {[{ label: 'Connections', value: '1,284' }, { label: 'Followers', value: '3,592' }, { label: 'Views', value: '14.7K' }].map((stat, i) => (
          <div key={i} style={s.stat}>
            <div style={s.statVal}>{stat.value}</div>
            <div style={s.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      <Card padding="28px">
        <Tabs tabs={tabs} />
      </Card>
    </div>
  );
}
