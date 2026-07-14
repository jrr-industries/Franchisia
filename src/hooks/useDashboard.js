import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API = "/api";

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, { credentials: "include", ...options });
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
}

export function useStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => fetchJSON(`${API}/dashboard/stats`),
    staleTime: 60 * 1000,
  });
}

export function useAnalytics(period = "monthly") {
  return useQuery({
    queryKey: ["dashboard", "analytics", period],
    queryFn: () => fetchJSON(`${API}/dashboard/analytics?period=${period}`),
    staleTime: 2 * 60 * 1000,
  });
}

export function useActivities() {
  return useQuery({
    queryKey: ["dashboard", "activity"],
    queryFn: async () => {
      const d = await fetchJSON(`${API}/dashboard/activity`);
      return d.activities || [];
    },
    staleTime: 60 * 1000,
  });
}

export function useMeetings() {
  return useQuery({
    queryKey: ["dashboard", "meetings"],
    queryFn: async () => {
      const d = await fetchJSON(`${API}/dashboard/meetings?limit=5`);
      return d.meetings || [];
    },
    staleTime: 30 * 1000,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["dashboard", "notifications"],
    queryFn: async () => {
      const d = await fetchJSON(`${API}/notifications?limit=5`);
      return { notifications: d.notifications || [], unreadCount: d.unreadCount || 0 };
    },
    staleTime: 30 * 1000,
  });
}

export function useRecommendedCompanies() {
  return useQuery({
    queryKey: ["dashboard", "recommended-companies"],
    queryFn: async () => {
      const d = await fetchJSON(`${API}/dashboard/recommended-companies`);
      return d.companies || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecommendedOpportunities() {
  return useQuery({
    queryKey: ["dashboard", "recommended-opportunities"],
    queryFn: async () => {
      const d = await fetchJSON(`${API}/dashboard/recommended-opportunities`);
      return d.opportunities || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePeopleYouMayKnow() {
  return useQuery({
    queryKey: ["dashboard", "people"],
    queryFn: async () => {
      const d = await fetchJSON(`${API}/dashboard/people-you-may-know`);
      return d.users || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecentMessages() {
  return useQuery({
    queryKey: ["dashboard", "recent-messages"],
    queryFn: async () => {
      const d = await fetchJSON(`${API}/dashboard/recent-messages`);
      return d.conversations || [];
    },
    staleTime: 30 * 1000,
  });
}

export function useSavedListings() {
  return useQuery({
    queryKey: ["dashboard", "saved-listings"],
    queryFn: () => fetchJSON(`${API}/dashboard/saved-listings?limit=3`),
    staleTime: 60 * 1000,
  });
}

export function useTasks() {
  return useQuery({
    queryKey: ["dashboard", "tasks"],
    queryFn: async () => {
      const d = await fetchJSON(`${API}/dashboard/tasks`);
      return d.tasks || [];
    },
    staleTime: 60 * 1000,
  });
}

export function useUnreadMessageCount() {
  return useQuery({
    queryKey: ["messages", "unread-count"],
    queryFn: async () => {
      const d = await fetchJSON(`${API}/messages/unread-count`);
      return d.unreadCount || 0;
    },
    staleTime: 30 * 1000,
  });
}

export function useConversations() {
  return useQuery({
    queryKey: ["messages", "conversations"],
    queryFn: async () => {
      const d = await fetchJSON(`${API}/messages/conversations`);
      return d.conversations || [];
    },
    staleTime: 30 * 1000,
  });
}

export function useConversationMessages(convId, enabled = true) {
  return useQuery({
    queryKey: ["messages", "messages", convId],
    queryFn: async () => {
      const d = await fetchJSON(`${API}/messages/conversations/${convId}/messages?page=1&limit=50`);
      return d.messages || [];
    },
    enabled: !!convId && enabled,
    staleTime: 10 * 1000,
  });
}

export function useMessageRequests() {
  return useQuery({
    queryKey: ["messages", "requests"],
    queryFn: async () => {
      const d = await fetchJSON(`${API}/messages/requests/pending`);
      return d.requests || d.pendingRequests || [];
    },
    staleTime: 30 * 1000,
  });
}

export function useDashboardPrefetch() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.prefetchQuery({ queryKey: ["dashboard", "stats"], queryFn: () => fetchJSON(`${API}/dashboard/stats`), staleTime: 60 * 1000 });
    queryClient.prefetchQuery({ queryKey: ["dashboard", "activity"], queryFn: async () => { const d = await fetchJSON(`${API}/dashboard/activity`); return d.activities || []; }, staleTime: 60 * 1000 });
    queryClient.prefetchQuery({ queryKey: ["dashboard", "analytics", "monthly"], queryFn: () => fetchJSON(`${API}/dashboard/analytics?period=monthly`), staleTime: 2 * 60 * 1000 });
    queryClient.prefetchQuery({ queryKey: ["dashboard", "meetings"], queryFn: async () => { const d = await fetchJSON(`${API}/dashboard/meetings?limit=5`); return d.meetings || []; }, staleTime: 30 * 1000 });
  };
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await fetch(`${API}/notifications/${id}/read`, { method: "PATCH", credentials: "include" });
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["dashboard", "notifications"] });
      const prev = queryClient.getQueryData(["dashboard", "notifications"]);
      if (prev) {
        queryClient.setQueryData(["dashboard", "notifications"], {
          ...prev,
          notifications: prev.notifications.map((n) => n.id === id ? { ...n, isRead: true } : n),
          unreadCount: Math.max(0, prev.unreadCount - 1),
        });
      }
      return { prev };
    },
    onError: (_, __, context) => {
      if (context?.prev) queryClient.setQueryData(["dashboard", "notifications"], context.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "notifications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await fetch(`${API}/notifications/read-all`, { method: "POST", credentials: "include" });
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["dashboard", "notifications"] });
      const prev = queryClient.getQueryData(["dashboard", "notifications"]);
      if (prev) {
        queryClient.setQueryData(["dashboard", "notifications"], {
          ...prev,
          notifications: prev.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        });
      }
      return { prev };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "notifications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    },
  });
}
