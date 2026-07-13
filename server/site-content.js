import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, 'data');
const FILE_PATH = join(DATA_DIR, 'site-content.json');

const defaults = {
  stats: [
    { value: '10,000+', label: 'Active Franchise Listings' },
    { value: '50,000+', label: 'Registered Professionals' },
    { value: '2,500+', label: 'Verified Franchisors' },
    { value: '15,000+', label: 'Successful Matches' },
    { value: '$2.5B+', label: 'Total Investment Facilitated' },
    { value: '98%', label: 'Satisfaction Rate' },
  ],
  testimonials: [
    { name: 'Sarah Johnson', role: 'Franchisor, Coffee Chain', text: 'Franchisia helped us connect with qualified franchisees across the country. The platform made the entire process seamless.', rating: 5 },
    { name: 'Mark Williams', role: 'Franchisee', text: 'I found my dream franchise through Franchisia. The search filters and company profiles gave me all the information I needed.', rating: 5 },
    { name: 'Emily Chen', role: 'Broker', text: 'As a broker, this platform has been invaluable. I can manage multiple clients and opportunities all in one place.', rating: 5 },
    { name: 'David Rodriguez', role: 'Investor', text: 'The analytics and ROI calculators gave me the confidence to invest. Highly recommended for serious investors.', rating: 4 },
  ],
  brands: ['McDonald\'s', 'Subway', 'KFC', 'Starbucks', 'Domino\'s', 'Burger King', 'Pizza Hut', 'Dunkin\''],
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

function ensureDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

let cached = null;

export function getSiteContent() {
  if (cached) return cached;
  ensureDir();
  try {
    if (existsSync(FILE_PATH)) {
      const raw = readFileSync(FILE_PATH, 'utf-8');
      const data = JSON.parse(raw);
      cached = { ...defaults, ...data };
      return cached;
    }
  } catch (e) {
    console.error('Failed to read site content:', e);
  }
  cached = { ...defaults };
  return cached;
}

export function setSiteContent(updates) {
  const current = getSiteContent();
  const merged = { ...current, ...updates };
  cached = merged;
  ensureDir();
  try {
    writeFileSync(FILE_PATH, JSON.stringify(merged, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write site content:', e);
  }
  return merged;
}
