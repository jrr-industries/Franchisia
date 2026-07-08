import { useState } from 'react';
import { MapPin, Users, Briefcase } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Search from '../../components/ui/Search';

const companies = [
  { id: 1, name: 'McDonald\'s Corporation', industry: 'Fast Food', location: 'Chicago, IL', followers: '12.4K', opportunities: 8 },
  { id: 2, name: 'Subway IP LLC', industry: 'Fast Food', location: 'Miami, FL', followers: '8.2K', opportunities: 5 },
  { id: 3, name: '7-Eleven Inc.', industry: 'Retail', location: 'Dallas, TX', followers: '6.7K', opportunities: 12 },
  { id: 4, name: 'KFC Corporation', industry: 'Fast Food', location: 'Louisville, KY', followers: '10.1K', opportunities: 6 },
  { id: 5, name: 'Anytime Fitness', industry: 'Fitness', location: 'Woodbury, MN', followers: '4.5K', opportunities: 9 },
  { id: 6, name: 'Pizza Hut LLC', industry: 'Fast Food', location: 'Plano, TX', followers: '7.8K', opportunities: 4 },
  { id: 7, name: 'The UPS Store', industry: 'Retail', location: 'San Diego, CA', followers: '3.2K', opportunities: 7 },
  { id: 8, name: 'Massage Envy', industry: 'Hospitality', location: 'Scottsdale, AZ', followers: '2.9K', opportunities: 3 },
  { id: 9, name: 'Taco Bell Corp.', industry: 'Fast Food', location: 'Irvine, CA', followers: '9.3K', opportunities: 10 },
  { id: 10, name: 'Dunkin\' Brands', industry: 'Fast Food', location: 'Canton, MA', followers: '11.5K', opportunities: 6 },
];

export default function Companies() {
  const [search, setSearch] = useState('');

  const filtered = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Companies Directory</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          Browse franchise companies and explore opportunities.
        </p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Search
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search companies by name, industry, or location..."
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {filtered.map((c) => (
          <Card key={c.id} padding="20px">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div style={{ width: 50, height: 50, borderRadius: 12, backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: 'var(--primary)', flexShrink: 0 }}>
                {c.name.split(' ')[0][0]}
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600 }}>{c.name}</h3>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.industry}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                <MapPin size={14} /> {c.location}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                <Users size={14} /> {c.followers} followers
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                <Briefcase size={14} /> {c.opportunities} open opportunities
              </div>
            </div>
            <Button variant="primary" size="sm" fullWidth>View Company</Button>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 16 }}>No companies found matching your search.</p>
        </div>
      )}
    </div>
  );
}
