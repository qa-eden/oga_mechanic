import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mechanicAPI } from '@/lib/api/mechanic';

// Hook to fetch repair requests
export const useRepairRequests = () => {
  return useQuery({
    queryKey: ['mechanic', 'repair-requests'],
    queryFn: () => mechanicAPI.getRepairRequests(),
    staleTime: 2 * 60 * 1000, // 2 minutes - data is fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Reduce retries to prevent excessive calls
    refetchOnMount: false, // Don't refetch on mount if data exists and is fresh
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnReconnect: false, // Don't auto-refetch on reconnect
    refetchInterval: false, // Disable automatic polling - user can pull to refresh
    networkMode: 'online', // Only fetch when online
  });
};

// Hook to fetch mechanic analytics
export const useMechanicAnalytics = () => {
  return useQuery({
    queryKey: ['mechanic', 'analytics'],
    queryFn: () => mechanicAPI.getMechanicAnalytics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1, // Reduce retries
    refetchOnMount: false, // Don't refetch on mount if data exists
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnReconnect: false, // Don't auto-refetch on reconnect
    networkMode: 'online', // Only fetch when online
  });
};

// Hook to accept repair request
export const useAcceptRepairRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (requestId: string) => mechanicAPI.acceptRepairRequest(requestId),
    onSuccess: () => {
      // Invalidate and refetch repair requests
      queryClient.invalidateQueries({ queryKey: ['mechanic', 'repair-requests'] });
    },
  });
};

// Hook to decline repair request
export const useDeclineRepairRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (requestId: string) => mechanicAPI.declineRepairRequest(requestId),
    onSuccess: () => {
      // Invalidate and refetch repair requests
      queryClient.invalidateQueries({ queryKey: ['mechanic', 'repair-requests'] });
    },
  });
};
