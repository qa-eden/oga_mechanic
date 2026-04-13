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
    staleTime: 60 * 1000, // 1 minute
    retry: 2,
  });
};

/**
 * Hook to get the count of active support conversations.
 * Filters for 'open' or 'in_progress' tickets.
 */
export const useSupportCount = () => {
  const { data } = useSupportConversations();
  
  // Extract results array based on API structure
  const conversations = data?.results?.data || [];
  
  // Count active tickets (open or in_progress)
  // According to our plan, this is what defines the "support count"
  const activeCount = conversations.filter(
    (chat) => chat.status === "open" || chat.status === "in_progress"
  ).length;

  return activeCount;
};
