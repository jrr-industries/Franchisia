import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SiteContext = createContext();

const STORAGE_KEY = 'franchisia-site';
const STORE_EVENT = 'site-store-update';

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
  maintenanceMode: false,
};

function mergeStored(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (key in target) {
      result[key] = source[key];
    }
  }
  return result;
}

let liveStore = null;

function getLiveStore() {
  if (!liveStore) {
    const stored = loadFromStorage();
    liveStore = stored ? mergeStored(defaults, stored) : { ...defaults };
  }
  return liveStore;
}

export function updateLiveStore(updates) {
  const store = getLiveStore();
  Object.assign(store, updates);
  saveToStorage(store);
  window.dispatchEvent(new CustomEvent(STORE_EVENT));
}

export function SiteProvider({ children }) {
  const [data, setData] = useState(() => {
    const stored = loadFromStorage();
    const merged = stored ? mergeStored(defaults, stored) : { ...defaults };
    liveStore = merged;
    return merged;
  });

  useEffect(() => {
    liveStore = data;
  }, [data]);

  useEffect(() => {
    fetch('/api/public/site-content')
      .then(r => r.json())
      .then(serverData => {
        if (serverData && typeof serverData === 'object') {
          const merged = mergeStored(defaults, serverData);
          liveStore = merged;
          saveToStorage(merged);
          setData(merged);
        }
      })
      .catch(() => {});
  }, []);

  const setStats = useCallback((stats) => setData((prev) => {
    const next = { ...prev, stats };
    liveStore = next;
    return next;
  }), []);
  const setTestimonials = useCallback((testimonials) => setData((prev) => {
    const next = { ...prev, testimonials };
    liveStore = next;
    return next;
  }), []);
  const setBrands = useCallback((brands) => setData((prev) => {
    const next = { ...prev, brands };
    liveStore = next;
    return next;
  }), []);
  const setAbout = useCallback((about) => setData((prev) => {
    const next = { ...prev, about };
    liveStore = next;
    return next;
  }), []);
  const setContact = useCallback((contact) => setData((prev) => {
    const next = { ...prev, contact };
    liveStore = next;
    return next;
  }), []);
  const setMaintenanceMode = useCallback((maintenanceMode) => setData((prev) => {
    const next = { ...prev, maintenanceMode };
    liveStore = next;
    return next;
  }), []);

  return (
    <SiteContext.Provider value={{
      stats: data.stats, setStats,
      testimonials: data.testimonials, setTestimonials,
      brands: data.brands, setBrands,
      about: data.about, setAbout,
      contact: data.contact, setContact,
      maintenanceMode: data.maintenanceMode, setMaintenanceMode,
    }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const context = useContext(SiteContext);
  if (!context) throw new Error('useSite must be used within SiteProvider');
  return context;
}

export function useSiteValue(key) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const handler = () => setTick(t => t + 1);
    window.addEventListener(STORE_EVENT, handler);
    return () => window.removeEventListener(STORE_EVENT, handler);
  }, []);

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && key in data) return data[key];
    }
  } catch {}
  return defaults[key];
}
