import { useState } from 'react';
import { MapPin, DollarSign, TrendingUp, Star } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Search from '../../components/ui/Search';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';

const industries = [
  { value: 'all', label: 'All Industries' },
  { value: 'fast-food', label: 'Fast Food' },
  { value: 'retail', label: 'Retail' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'tech', label: 'Technology' },
];

const locations = [
  { value: 'all', label: 'All Locations' },
  { value: 'new-york', label: 'New York' },
  { value: 'los-angeles', label: 'Los Angeles' },
  { value: 'chicago', label: 'Chicago' },
  { value: 'miami', label: 'Miami' },
  { value: 'remote', label: 'Remote' },
];

const investmentRanges = [
  { value: 'all', label: 'Any Investment' },
  { value: 'under-50k', label: 'Under $50K' },
  { value: '50k-150k', label: '$50K - $150K' },
  { value: '150k-500k', label: '$150K - $500K' },
  { value: '500k-plus', label: '$500K+' },
];

const businessTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'franchise', label: 'Franchise' },
  { value: 'independent', label: 'Independent' },
  { value: 'joint-venture', label: 'Joint Venture' },
];

const franchises = [
  { id: 1, name: 'McDonald\'s', industry: 'Fast Food', investment: '$150K - $350K', location: 'New York, NY', roi: '18%', verified: true },
  { id: 2, name: 'Subway', industry: 'Fast Food', investment: '$80K - $200K', location: 'Miami, FL', roi: '14%', verified: true },
  { id: 3, name: '7-Eleven', industry: 'Retail', investment: '$50K - $120K', location: 'Chicago, IL', roi: '22%', verified: true },
  { id: 4, name: 'Anytime Fitness', industry: 'Fitness', investment: '$80K - $200K', location: 'Los Angeles, CA', roi: '16%', verified: false },
  { id: 5, name: 'KFC', industry: 'Fast Food', investment: '$200K - $500K', location: 'New York, NY', roi: '20%', verified: true },
  { id: 6, name: 'Pizza Hut', industry: 'Fast Food', investment: '$150K - $400K', location: 'Chicago, IL', roi: '15%', verified: true },
  { id: 7, name: 'The UPS Store', industry: 'Retail', investment: '$100K - $250K', location: 'Los Angeles, CA', roi: '12%', verified: false },
  { id: 8, name: 'Massage Envy', industry: 'Hospitality', investment: '$200K - $450K', location: 'Miami, FL', roi: '19%', verified: true },
];

export default function Discover() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ industry: 'all', location: 'all', investment: 'all', type: 'all' });

  const handleFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Discover Franchises</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Find the perfect franchise opportunity for you.</p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Search
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search franchises, industries, locations..."
        />
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ width: 240, flexShrink: 0 }}>
          <Card hover={false}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Filters</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Select
                label="Industry"
                options={industries}
                value={filters.industry}
                onChange={(e) => handleFilter('industry', e.target.value)}
              />
              <Select
                label="Location"
                options={locations}
                value={filters.location}
                onChange={(e) => handleFilter('location', e.target.value)}
              />
              <Select
                label="Investment Range"
                options={investmentRanges}
                value={filters.investment}
                onChange={(e) => handleFilter('investment', e.target.value)}
              />
              <Select
                label="Business Type"
                options={businessTypes}
                value={filters.type}
                onChange={(e) => handleFilter('type', e.target.value)}
              />
              <Button variant="secondary" size="sm" fullWidth onClick={() => setFilters({ industry: 'all', location: 'all', investment: 'all', type: 'all' })}>
                Clear Filters
              </Button>
            </div>
          </Card>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
            {franchises.map((f) => (
              <Card key={f.id} padding="20px">
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 12, backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, color: 'var(--primary)', flexShrink: 0 }}>
                    {f.name[0]}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 15 }}>{f.name}</span>
                      {f.verified && <Badge variant="success">Verified</Badge>}
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{f.industry}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <MapPin size={14} /> {f.location}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <DollarSign size={14} /> {f.investment}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
                    <TrendingUp size={14} /> ROI: {f.roi}
                  </div>
                </div>
                <Button variant="primary" size="sm" fullWidth>Apply Now</Button>
              </Card>
            ))}
          </div>
          <Pagination current={page} total={5} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}
