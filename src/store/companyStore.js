import { create } from "zustand";
import { getSocket } from "../lib/socket";

const useCompanyStore = create((set, get) => ({
  companies: [],
  loading: true,
  error: null,

  fetchCompanies: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/companies?franchisor=true", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load companies");
      const data = await res.json();
      const companies = (data.companies || []).map(normalizeCompany);
      set({ companies, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  initSocketListeners: () => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("company-created", (company) => {
      if (company.status !== "active") return;
      set((state) => ({
        companies: addSorted([...state.companies, normalizeCompany(company)]),
      }));
    });

    socket.on("company-updated", (company) => {
      const n = normalizeCompany(company);
      set((state) => {
        const exists = state.companies.some((c) => c.id === n.id);
        if (company.status !== "active") {
          return { companies: state.companies.filter((c) => c.id !== n.id) };
        }
        if (exists) {
          return { companies: addSorted(state.companies.map((c) => (c.id === n.id ? { ...c, ...n } : c))) };
        }
        return { companies: addSorted([...state.companies, n]) };
      });
    });

    socket.on("company-deleted", ({ id }) => {
      set((state) => ({
        companies: state.companies.filter((c) => c.id !== id),
      }));
    });

    socket.on("company-verified", (company) => {
      if (company.status !== "active") return;
      const n = normalizeCompany(company);
      set((state) => ({
        companies: addSorted(state.companies.map((c) => (c.id === n.id ? { ...c, ...n } : c))),
      }));
    });
  },

  removeSocketListeners: () => {
    const socket = getSocket();
    if (!socket) return;
    socket.off("company-created");
    socket.off("company-updated");
    socket.off("company-deleted");
    socket.off("company-verified");
  },
}));

function normalizeCompany(c) {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    logoUrl: c.logoUrl,
    industry: c.industry,
    city: c.city,
    country: c.country,
    followerCount: c.followerCount ?? c._count?.followers ?? 0,
    listingCount: c.listingCount ?? c._count?.listings ?? 0,
    isVerified: c.isVerified ?? false,
    createdAt: c.createdAt,
  };
}

function addSorted(companies) {
  return [...companies].sort((a, b) => {
    if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

export default useCompanyStore;
