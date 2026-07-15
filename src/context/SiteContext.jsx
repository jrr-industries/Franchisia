import { createContext, useContext, useCallback, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';

const SITE_QUERY_KEY = ['cms', 'site-content'];
const SiteContext = createContext(null);

let _qc = null;

export function updateLiveStore(updates) {
  if (_qc) {
    _qc.invalidateQueries({ queryKey: ["cms"] });
  }
}

export function SiteProvider({ children }) {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: SITE_QUERY_KEY,
    queryFn: () => fetch('/api/public/site-content').then(r => {
      if (!r.ok) throw new Error('Failed to fetch site content');
      return r.json();
    }),
    staleTime: 5 * 60 * 1000,
  });

  _qc = queryClient;

  useEffect(() => {
    let socket;
    try {
      const socketUrl = window.location.origin;
      socket = io(socketUrl, { withCredentials: true });
      socket.on('connect', () => {});
      socket.on('cms-updated', (data) => {
        queryClient.invalidateQueries({ queryKey: ["cms"] });
        queryClient.invalidateQueries({ queryKey: ["public"] });
      });
    } catch (e) {
      console.warn('Socket connection failed:', e);
    }
    return () => { if (socket) socket.disconnect(); };
  }, [queryClient]);

  const setStats = useCallback((stats) => updateLiveStore({ stats }), []);
  const setTestimonials = useCallback((testimonials) => updateLiveStore({ testimonials }), []);
  const setBrands = useCallback((brands) => updateLiveStore({ brands }), []);
  const setAbout = useCallback((about) => updateLiveStore({ about }), []);
  const setContact = useCallback((contact) => updateLiveStore({ contact }), []);
  const setMaintenanceMode = useCallback((maintenanceMode) => updateLiveStore({ maintenanceMode }), []);

  return (
    <SiteContext.Provider value={{
      stats: data?.stats,
      testimonials: data?.testimonials,
      brands: data?.settings?.brands,
      about: data?.about,
      contact: data?.contact,
      maintenanceMode: data?.settings?.maintenanceMode,
      heroSettings: data?.heroSettings,
      industries: data?.industries,
      aiSection: data?.aiSection,
      globalNetwork: data?.globalNetwork,
      mapLocation: data?.mapLocation,
      globalMetrics: data?.globalMetrics,
      newsletterSettings: data?.newsletterSettings,
      footerSettings: data?.footerSettings,
      marketplaceSearch: data?.marketplaceSearch,
      features: data?.features,
      userTypes: data?.userTypes,
      howItWorks: data?.howItWorks,
      featuredCities: data?.featuredCities,
      careers: data?.careers,
      events: data?.events,
      media: data?.media,
      setStats, setTestimonials, setBrands, setAbout, setContact, setMaintenanceMode,
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
  const { data } = useQuery({
    queryKey: SITE_QUERY_KEY,
    queryFn: () => fetch('/api/public/site-content').then(r => r.json()),
    staleTime: 5 * 60 * 1000,
  });
  return data?.[key];
}
