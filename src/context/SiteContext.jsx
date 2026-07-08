import { createContext, useContext, useState, useEffect } from 'react';

const SiteContext = createContext();

const STORAGE_KEY = 'franchisia-site';

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

const defaults = {
  stats: [
    { value: '10,000+', label: 'Active Franchise Listings' },
    { value: '50,000+', label: 'Registered Professionals' },
    { value: '2,500+', label: 'Verified Franchisors' },
    { value: '15,000+', label: 'Successful Matches' },
    { value: '$2.5B+', label: 'Total Investment Facilitated' },
    { value: '98%', label: 'Satisfaction Rate' },
  ],
  about: {
    heroTitle: 'Building the Future of Franchise Networking',
    heroDesc: 'Franchisia is the leading professional network connecting franchisors, franchisees, consultors, investors, and suppliers worldwide.',
    mission: 'To democratize access to franchise opportunities and create a transparent, efficient ecosystem where every professional can find the perfect match.',
    vision: 'A world where franchise opportunities are accessible to everyone, empowering entrepreneurs to build successful businesses through meaningful connections.',
    teamMembers: [
      { name: 'Alexandra Reed', role: 'CEO & Founder', bio: 'Former franchisor with 15+ years of experience in the franchise industry.' },
      { name: 'Marcus Chen', role: 'CTO', bio: 'Tech leader who built scalable platforms for Fortune 500 companies.' },
      { name: 'Sophia Patel', role: 'COO', bio: 'Operations expert with a background in franchise development.' },
      { name: 'James Mitchell', role: 'VP of Sales', bio: 'Helped over 200 franchise brands expand their networks.' },
      { name: 'Olivia Torres', role: 'Head of Marketing', bio: 'Digital marketing strategist specializing in franchise growth.' },
      { name: 'Ryan Kim', role: 'Head of Product', bio: 'Product leader passionate about building intuitive user experiences.' },
    ],
    timeline: [
      { year: '2019', title: 'The Idea', desc: 'Founded with a vision to transform the franchise industry.' },
      { year: '2020', title: 'Platform Launch', desc: 'Launched the first version of Franchisia with 500 listings.' },
      { year: '2021', title: '10K Users', desc: 'Reached 10,000 registered professionals on the platform.' },
      { year: '2022', title: 'Global Expansion', desc: 'Expanded operations to 20 countries worldwide.' },
      { year: '2023', title: 'AI Features', desc: 'Introduced AI-powered matching and investment calculators.' },
      { year: '2024', title: 'Industry Leader', desc: 'Recognized as the #1 franchise networking platform.' },
    ],
  },
  contact: {
    email: 'hello@franchisia.com',
    phone: '+1 (555) 123-4567',
    address: 'San Francisco, CA',
  },
};

export function SiteProvider({ children }) {
  const [data, setData] = useState(() => loadFromStorage() || defaults);

  useEffect(() => {
    saveToStorage(data);
  }, [data]);

  const setStats = (stats) => setData((prev) => ({ ...prev, stats }));
  const setAbout = (about) => setData((prev) => ({ ...prev, about }));
  const setContact = (contact) => setData((prev) => ({ ...prev, contact }));

  return (
    <SiteContext.Provider value={{ stats: data.stats, setStats, about: data.about, setAbout, contact: data.contact, setContact }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const context = useContext(SiteContext);
  if (!context) throw new Error('useSite must be used within SiteProvider');
  return context;
}
