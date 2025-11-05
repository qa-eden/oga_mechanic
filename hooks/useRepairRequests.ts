import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mechanicAPI } from '@/lib/api/mechanic';

// Hook to fetch repair requests
export const useRepairRequests = () => {
  return useQuery({
    queryKey: ['mechanic', 'repair-requests'],
    queryFn: () => mechanicAPI.getRepairRequests(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute for real-time updates
  });
};

// Hook to fetch mechanic analytics
export const useMechanicAnalytics = () => {
  return useQuery({
    queryKey: ['mechanic', 'analytics'],
    queryFn: () => mechanicAPI.getMechanicAnalytics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
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
