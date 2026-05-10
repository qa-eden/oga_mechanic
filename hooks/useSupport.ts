import { useQuery } from "@tanstack/react-query";
import { supportAPI, ConversationsResponse } from "@/lib/api/support";

/**
 * Hook to fetch and manage support conversations (tickets).
 * Uses React Query for caching and automatic background updates.
 */
export const useSupportConversations = () => {
  return useQuery<ConversationsResponse>({
    queryKey: ["support-conversations"],
    queryFn: () => supportAPI.getConversations(),
    staleTime: 30 * 1000,
    retry: 2,
  });
};

/**
 * Hook to get the count of active support notifications.
 * Sums up unread_count across all active support conversations.
 */
export const useSupportCount = () => {
  const { data } = useSupportConversations();
  
  // Extract results array based on API structure
  const conversations = data?.results?.data || [];
  
  if (!Array.isArray(conversations)) return 0;

  // Sum up all unread messages in open or in-progress conversations
  const unreadCount = conversations
    .filter((chat: any) => chat.status === "open" || chat.status === "in_progress")
    .reduce((sum: number, chat: any) => sum + (chat.unread_count || 0), 0);

  return unreadCount;
};
