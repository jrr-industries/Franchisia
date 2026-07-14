import { createContext, useContext, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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
      brands: data?.brands,
      about: data?.about,
      contact: data?.contact,
      maintenanceMode: data?.maintenanceMode,
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
