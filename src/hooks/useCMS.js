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
