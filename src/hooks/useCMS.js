import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API = "/api";

async function fetchJSON(url) {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
}

async function postJSON(url, data, method = "POST") {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to ${method} ${url}`);
  }
  return res.json();
}

// ── Public CMS Data ──

export function useSiteContent() {
  return useQuery({
    queryKey: ["cms", "site-content"],
    queryFn: () => fetchJSON(`${API}/public/site-content`),
    staleTime: 5 * 60 * 1000,
  });
}

export function useHeroSlides() {
  return useQuery({
    queryKey: ["cms", "hero-slides"],
    queryFn: async () => { const d = await fetchJSON(`${API}/public/hero-slides`); return d.items || []; },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserTypes() {
  return useQuery({
    queryKey: ["cms", "user-types"],
    queryFn: async () => { const d = await fetchJSON(`${API}/public/user-types`); return d.items || []; },
    staleTime: 5 * 60 * 1000,
  });
}

export function useFeatures() {
  return useQuery({
    queryKey: ["cms", "features"],
    queryFn: async () => { const d = await fetchJSON(`${API}/public/features`); return d.items || []; },
    staleTime: 5 * 60 * 1000,
  });
}

export function useHowItWorks() {
  return useQuery({
    queryKey: ["cms", "how-it-works"],
    queryFn: async () => { const d = await fetchJSON(`${API}/public/how-it-works`); return d.items || []; },
    staleTime: 5 * 60 * 1000,
  });
}

export function useFeaturedCities() {
  return useQuery({
    queryKey: ["cms", "featured-cities"],
    queryFn: async () => { const d = await fetchJSON(`${API}/public/featured-cities`); return d.items || []; },
    staleTime: 5 * 60 * 1000,
  });
}

export function useNavigation() {
  return useQuery({
    queryKey: ["cms", "navigation"],
    queryFn: async () => { const d = await fetchJSON(`${API}/public/navigation`); return d.items || []; },
    staleTime: 10 * 60 * 1000,
  });
}

// Admin mutations for new cms models

export function useCreateHeroSlide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => postJSON(`${API}/admin/cms/hero-slides`, data, "POST"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "hero-slides"] }),
  });
}

export function useUpdateHeroSlide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => postJSON(`${API}/admin/cms/hero-slides/${id}`, data, "PUT"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "hero-slides"] }),
  });
}

export function useDeleteHeroSlide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => fetch(`${API}/admin/cms/hero-slides/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "hero-slides"] }),
  });
}

export function useCreateUserType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => postJSON(`${API}/admin/cms/user-types`, data, "POST"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "user-types"] }),
  });
}

export function useUpdateUserType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => postJSON(`${API}/admin/cms/user-types/${id}`, data, "PUT"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "user-types"] }),
  });
}

export function useDeleteUserType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => fetch(`${API}/admin/cms/user-types/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "user-types"] }),
  });
}

export function useCreateFeature() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => postJSON(`${API}/admin/cms/features`, data, "POST"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "features"] }),
  });
}

export function useUpdateFeature() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => postJSON(`${API}/admin/cms/features/${id}`, data, "PUT"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "features"] }),
  });
}

export function useDeleteFeature() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => fetch(`${API}/admin/cms/features/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "features"] }),
  });
}

export function useCreateHowItWork() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => postJSON(`${API}/admin/cms/how-it-works`, data, "POST"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "how-it-works"] }),
  });
}

export function useUpdateHowItWork() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => postJSON(`${API}/admin/cms/how-it-works/${id}`, data, "PUT"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "how-it-works"] }),
  });
}

export function useDeleteHowItWork() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => fetch(`${API}/admin/cms/how-it-works/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "how-it-works"] }),
  });
}

export function useCreateCity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => postJSON(`${API}/admin/cms/featured-cities`, data, "POST"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "featured-cities"] }),
  });
}

export function useUpdateCity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => postJSON(`${API}/admin/cms/featured-cities/${id}`, data, "PUT"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "featured-cities"] }),
  });
}

export function useDeleteCity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => fetch(`${API}/admin/cms/featured-cities/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "featured-cities"] }),
  });
}

export function useCreateNavLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => postJSON(`${API}/admin/cms/navigation`, data, "POST"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "navigation"] }),
  });
}

export function useUpdateNavLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => postJSON(`${API}/admin/cms/navigation/${id}`, data, "PUT"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "navigation"] }),
  });
}

export function useDeleteNavLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => fetch(`${API}/admin/cms/navigation/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "navigation"] }),
  });
}

export function useStats() {
  return useQuery({
    queryKey: ["cms", "stats"],
    queryFn: async () => {
      const d = await fetchJSON(`${API}/public/statistics`);
      return d.items || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useTestimonials() {
  return useQuery({
    queryKey: ["cms", "testimonials"],
    queryFn: async () => {
      const d = await fetchJSON(`${API}/public/testimonials`);
      return d.items || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useFAQ() {
  return useQuery({
    queryKey: ["cms", "faq"],
    queryFn: async () => {
      const d = await fetchJSON(`${API}/public/faq`);
      return d.items || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePlans() {
  return useQuery({
    queryKey: ["cms", "plans"],
    queryFn: async () => {
      const d = await fetchJSON(`${API}/public/plans`);
      return d.items || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useBlogPosts({ page = 1, limit = 12, category } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (category) params.set("category", category);
  return useQuery({
    queryKey: ["cms", "blog", { page, limit, category }],
    queryFn: () => fetchJSON(`${API}/public/blog?${params}`),
    staleTime: 2 * 60 * 1000,
  });
}

export function useBlogPost(slug) {
  return useQuery({
    queryKey: ["cms", "blog", slug],
    queryFn: () => fetchJSON(`${API}/public/blog/${slug}`),
    enabled: !!slug,
    staleTime: 2 * 60 * 1000,
  });
}

export function useEvents(status) {
  const params = status ? `?status=${status}` : "";
  return useQuery({
    queryKey: ["cms", "events", { status }],
    queryFn: async () => {
      const d = await fetchJSON(`${API}/public/events${params}`);
      return d.items || [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function usePartners() {
  return useQuery({
    queryKey: ["cms", "partners"],
    queryFn: async () => {
      const d = await fetchJSON(`${API}/public/partners`);
      return d.items || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCareers(department) {
  const params = department ? `?department=${department}` : "";
  return useQuery({
    queryKey: ["cms", "careers", { department }],
    queryFn: async () => {
      const d = await fetchJSON(`${API}/public/careers${params}`);
      return d.items || [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useSiteContact() {
  return useQuery({
    queryKey: ["cms", "contact"],
    queryFn: () => fetchJSON(`${API}/public/contact`),
    staleTime: 10 * 60 * 1000,
  });
}

export function usePublicSettings() {
  return useQuery({
    queryKey: ["cms", "settings"],
    queryFn: () => fetchJSON(`${API}/public/settings`),
    staleTime: 10 * 60 * 1000,
  });
}

export function useIndustries() {
  return useQuery({
    queryKey: ["cms", "industries"],
    queryFn: () => fetchJSON(`${API}/public/industries`),
    staleTime: 10 * 60 * 1000,
  });
}

export function useLocations() {
  return useQuery({
    queryKey: ["cms", "locations"],
    queryFn: () => fetchJSON(`${API}/public/locations`),
    staleTime: 30 * 60 * 1000,
  });
}

export function useFeaturedCompanies() {
  return useQuery({
    queryKey: ["cms", "featured-companies"],
    queryFn: () => fetchJSON(`${API}/public/featured-companies`),
    staleTime: 5 * 60 * 1000,
  });
}

export function useFeaturedListings() {
  return useQuery({
    queryKey: ["cms", "featured-listings"],
    queryFn: () => fetchJSON(`${API}/public/featured-listings`),
    staleTime: 5 * 60 * 1000,
  });
}

export function useNewsletterSubscribe() {
  return useMutation({
    mutationFn: (data) => postJSON(`${API}/public/newsletter`, data, "POST"),
  });
}

export function useMedia({ page = 1, limit = 20, type } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (type) params.set("type", type);
  return useQuery({
    queryKey: ["cms", "media", { page, limit, type }],
    queryFn: () => fetchJSON(`${API}/public/media?${params}`),
    staleTime: 10 * 60 * 1000,
  });
}

export function getSectionContent(settings, sectionName, defaults = {}) {
  if (!settings) return defaults;
  const heading = settings[`section_${sectionName}_heading`]?.text || defaults.heading || "";
  const description = settings[`section_${sectionName}_description`]?.text || defaults.description || "";
  return { heading, description };
}

export function usePage(slug) {
  return useQuery({
    queryKey: ["cms", "page", slug],
    queryFn: () => fetchJSON(`${API}/public/pages/${slug}`),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreatePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => postJSON(`${API}/admin/cms/pages`, data, "POST"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "page"] }),
  });
}

export function useUpdatePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => postJSON(`${API}/admin/cms/pages/${id}`, data, "PUT"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "page"] }),
  });
}

export function useDeletePage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => fetch(`${API}/admin/cms/pages/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "page"] }),
  });
}

// ── Admin CMS Mutations ──

export function useUpdateSiteContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => postJSON(`${API}/admin/site-content`, data, "POST"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cms", "site-content"] });
      qc.invalidateQueries({ queryKey: ["cms", "stats"] });
      qc.invalidateQueries({ queryKey: ["cms", "testimonials"] });
    },
  });
}

export function useCreateBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => postJSON(`${API}/admin/cms/blog`, data, "POST"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "blog"] }),
  });
}

export function useUpdateBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => postJSON(`${API}/admin/cms/blog/${id}`, data, "PUT"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "blog"] }),
  });
}

export function useDeleteBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => fetch(`${API}/admin/cms/blog/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "blog"] }),
  });
}

export function useCreateCareer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => postJSON(`${API}/admin/cms/careers`, data, "POST"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "careers"] }),
  });
}

export function useUpdateCareer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => postJSON(`${API}/admin/cms/careers/${id}`, data, "PUT"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "careers"] }),
  });
}

export function useDeleteCareer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => fetch(`${API}/admin/cms/careers/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "careers"] }),
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => postJSON(`${API}/admin/cms/events`, data, "POST"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "events"] }),
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => postJSON(`${API}/admin/cms/events/${id}`, data, "PUT"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "events"] }),
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => fetch(`${API}/admin/cms/events/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "events"] }),
  });
}

export function useCreatePartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => postJSON(`${API}/admin/cms/partners`, data, "POST"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "partners"] }),
  });
}

export function useUpdatePartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => postJSON(`${API}/admin/cms/partners/${id}`, data, "PUT"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "partners"] }),
  });
}

export function useDeletePartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => fetch(`${API}/admin/cms/partners/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "partners"] }),
  });
}

export function useCreateTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => postJSON(`${API}/admin/cms/testimonials`, data, "POST"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "testimonials"] }),
  });
}

export function useUpdateTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => postJSON(`${API}/admin/cms/testimonials/${id}`, data, "PUT"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "testimonials"] }),
  });
}

export function useDeleteTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => fetch(`${API}/admin/cms/testimonials/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "testimonials"] }),
  });
}

export function useCreateFAQ() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => postJSON(`${API}/admin/cms/faq`, data, "POST"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "faq"] }),
  });
}

export function useUpdateFAQ() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => postJSON(`${API}/admin/cms/faq/${id}`, data, "PUT"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "faq"] }),
  });
}

export function useDeleteFAQ() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => fetch(`${API}/admin/cms/faq/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "faq"] }),
  });
}

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => postJSON(`${API}/admin/cms/plans`, data, "POST"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "plans"] }),
  });
}

export function useUpdatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => postJSON(`${API}/admin/cms/plans/${id}`, data, "PUT"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "plans"] }),
  });
}

export function useDeletePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => fetch(`${API}/admin/cms/plans/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cms", "plans"] }),
  });
}
