import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  MapPin, Globe, MessageSquare, UserPlus, ExternalLink, Star,
  Briefcase, Users, TrendingUp, Calendar, CheckCircle, Phone,
  Mail, Clock, DollarSign, ChevronRight, Heart, Share2
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Tabs from '../../components/ui/Tabs';

const s = {
  page: { maxWidth: 1000, margin: '0 auto' },
  cover: {
    height: 280, borderRadius: 'var(--radius-lg)',
    background: 'linear-gradient(135deg, #1E3A5F, var(--primary), #7C3AED)',
    position: 'relative', marginBottom: 64,
  },
  infoRow: {
    display: 'flex', alignItems: 'flex-end', gap: 24, padding: '0 32px',
    marginTop: -56, position: 'relative', zIndex: 1,
  },
  infoText: { flex: 1 },
  nameRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 },
  name: { fontSize: 24, fontWeight: 700 },
  title: { fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 },
  follower: { fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 },
  btns: { display: 'flex', gap: 12, marginLeft: 'auto', alignItems: 'flex-end', paddingBottom: 4 },
  statsRow: {
    display: 'flex', gap: 32, padding: '20px 32px', borderBottom: '1px solid var(--border)', marginBottom: 24,
  },
  stat: { textAlign: 'center' },
  statVal: { fontSize: 20, fontWeight: 700 },
  statLabel: { fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 600, marginBottom: 16 },
  desc: { fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 },
  oppCard: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: 12,
  },
  oppInfo: { flex: 1 },
  oppName: { fontWeight: 600, fontSize: 15, marginBottom: 4 },
  oppMeta: { fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 16, flexWrap: 'wrap' },
  reviewCard: {
    padding: 16, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: 12,
  },
  stars: { display: 'flex', gap: 2, color: '#F59E0B', marginBottom: 8 },
  locCard: {
    display: 'flex', alignItems: 'center', gap: 16, padding: 16,
    border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: 12,
  },
  contactCard: {
    display: 'flex', alignItems: 'center', gap: 16, padding: 16,
    border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: 12,
  },
};

const opportunities = [
  { name: 'Pizza Palace Franchise', investment: '$150K - $350K', location: 'Multiple States', type: 'Food & Beverage', roi: '25-35%' },
  { name: 'FitZone Gym', investment: '$200K - $500K', location: 'Nationwide', type: 'Fitness', roi: '20-30%' },
  { name: 'CleanPro Services', investment: '$50K - $120K', location: 'East Coast', type: 'Services', roi: '30-40%' },
];

const reviews = [
  { author: 'John D.', rating: 5, text: 'Great franchise opportunity with excellent support system.', date: '3 days ago' },
  { author: 'Emily R.', rating: 4, text: 'Solid business model and great training program.', date: '1 week ago' },
  { author: 'Mark T.', rating: 5, text: 'Exceeded my expectations in terms of ROI and support.', date: '2 weeks ago' },
];

const locations = [
  { address: '123 Business Ave, Suite 400, New York, NY 10001', phone: '+1 (212) 555-0100', type: 'Headquarters' },
  { address: '456 Commerce Blvd, Los Angeles, CA 90001', phone: '+1 (323) 555-0200', type: 'Regional Office' },
];

export default function CompanyProfile() {
  const { id } = useParams();

  const aboutContent = (
    <div>
      <h3 style={s.sectionTitle}>About</h3>
      <p style={s.desc}>
        Franchise Corp is a leading franchise development company with over 15 years of experience
        in helping entrepreneurs build successful businesses. We offer comprehensive support,
        training, and marketing assistance to all our franchise partners. Our portfolio includes
        some of the most recognized brands in the food, fitness, and service industries.
      </p>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Card padding="20px" style={{ flex: 1, minWidth: 200, textAlign: 'center' }}>
          <Users size={24} color="var(--primary)" />
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 8 }}>500+</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Franchise Locations</div>
        </Card>
        <Card padding="20px" style={{ flex: 1, minWidth: 200, textAlign: 'center' }}>
          <TrendingUp size={24} color="var(--accent)" />
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 8 }}>92%</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Success Rate</div>
        </Card>
        <Card padding="20px" style={{ flex: 1, minWidth: 200, textAlign: 'center' }}>
          <Star size={24} color="#F59E0B" />
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 8 }}>4.8</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Avg Rating</div>
        </Card>
      </div>
    </div>
  );

  const opportunitiesContent = (
    <div>
      <h3 style={s.sectionTitle}>Available Opportunities</h3>
      {opportunities.map((opp, i) => (
        <div key={i} style={s.oppCard}>
          <div style={s.oppInfo}>
            <div style={s.oppName}>{opp.name}</div>
            <div style={s.oppMeta}>
              <span><DollarSign size={14} style={{ verticalAlign: 'middle' }} /> {opp.investment}</span>
              <span><MapPin size={14} style={{ verticalAlign: 'middle' }} /> {opp.location}</span>
              <span><TrendingUp size={14} style={{ verticalAlign: 'middle' }} /> ROI: {opp.roi}</span>
              <Badge variant="info">{opp.type}</Badge>
            </div>
          </div>
          <Button variant="primary" size="sm">Apply</Button>
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

  const locationsContent = (
    <div>
      <h3 style={s.sectionTitle}>Locations</h3>
      {locations.map((loc, i) => (
        <div key={i} style={s.locCard}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--primary-light)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <MapPin size={20} color="var(--primary)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{loc.type}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{loc.address}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Phone size={12} /> {loc.phone}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const contactContent = (
    <div>
      <h3 style={s.sectionTitle}>Contact Information</h3>
      {[
        { icon: <Phone size={20} />, label: 'Phone', value: '+1 (212) 555-0100' },
        { icon: <Mail size={20} />, label: 'Email', value: 'franchise@franchisecorp.com' },
        { icon: <Globe size={20} />, label: 'Website', value: 'www.franchisecorp.com' },
        { icon: <Clock size={20} />, label: 'Business Hours', value: 'Mon - Fri, 9:00 AM - 6:00 PM' },
      ].map((item, i) => (
        <div key={i} style={s.contactCard}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--primary-light)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {item.icon}
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 1 }}>{item.label}</div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{item.value}</div>
          </div>
        </div>
      ))}
    </div>
  );

  const tabs = [
    { id: 'about', label: 'About', content: aboutContent },
    { id: 'opportunities', label: 'Opportunities', content: opportunitiesContent },
    { id: 'reviews', label: 'Reviews', content: reviewsContent },
    { id: 'locations', label: 'Locations', content: locationsContent },
    { id: 'contact', label: 'Contact', content: contactContent },
  ];

  return (
    <div style={s.page}>
      <div style={s.cover} />

      <div style={s.infoRow}>
        <Avatar name="Franchise Corp" size={64} style={{ border: '4px solid var(--surface)' }} />
        <div style={s.infoText}>
          <div style={s.nameRow}>
            <h1 style={s.name}>Franchise Corp</h1>
            <Badge variant="success" style={{ gap: 4 }}><CheckCircle size={12} /> Verified</Badge>
          </div>
          <div style={s.title}><Briefcase size={14} />Food & Beverage • Franchisor</div>
          <div style={s.follower}><MapPin size={14} />New York, USA • <Users size={14} /> 12.4K Followers</div>
        </div>
        <div style={s.btns}>
          <Button variant="primary" size="sm" icon={<MessageSquare size={16} />}>Message</Button>
          <Button variant="outline" size="sm" icon={<Globe size={16} />}>Website</Button>
          <Button variant="secondary" size="sm" icon={<UserPlus size={16} />}>Follow</Button>
        </div>
      </div>

      <div style={s.statsRow}>
        {[
          { label: 'Followers', value: '12.4K' },
          { label: 'Open Positions', value: '8' },
          { label: 'Avg ROI', value: '28%' },
          { label: 'Founded', value: '2010' },
        ].map((stat, i) => (
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
