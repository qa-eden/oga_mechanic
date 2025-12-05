import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mechanicAPI } from '@/lib/api/mechanic';

// Hook to fetch repair requests
export const useRepairRequests = (status?: string) => {
  return useQuery({
    queryKey: ['mechanic', 'repair-requests', status || 'all'],
    queryFn: () => mechanicAPI.getRepairRequests(status),
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
    onSuccess: (_, requestId) => {
      // Invalidate and refetch repair requests list
      queryClient.invalidateQueries({ queryKey: ['mechanic', 'repair-requests'] });
      // Invalidate and refetch repair request detail
      queryClient.invalidateQueries({ queryKey: ['repair-request', requestId] });
    },
  });
};

// Hook to decline repair request
export const useDeclineRepairRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (requestId: string) => mechanicAPI.declineRepairRequest(requestId),
    onSuccess: (_, requestId) => {
      // Invalidate and refetch repair requests list
      queryClient.invalidateQueries({ queryKey: ['mechanic', 'repair-requests'] });
      // Invalidate and refetch repair request detail
      queryClient.invalidateQueries({ queryKey: ['repair-request', requestId] });
    },
  });
};

// Hook to fetch user's repair requests
export const useUserRepairRequests = (status?: string) => {
  return useQuery({
    queryKey: ['user', 'repair-requests', status || 'all'],
    queryFn: () => mechanicAPI.getUserRepairRequests(status),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    networkMode: 'online',
  });
};

// Hook to fetch repair request detail by ID
export const useRepairRequestDetail = (requestId: string | undefined) => {
  return useQuery({
    queryKey: ['repair-request', requestId],
    queryFn: () => mechanicAPI.getRepairRequestDetail(requestId!),
    enabled: !!requestId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    networkMode: 'online',
  });
};

// Hook to update repair request
export const useUpdateRepairRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ requestId, payload }: { requestId: string; payload: any }) =>
      mechanicAPI.updateRepairRequest(requestId, payload),
    onSuccess: (_, variables) => {
      // Invalidate and refetch repair request detail
      queryClient.invalidateQueries({ queryKey: ['repair-request', variables.requestId] });
      // Invalidate user repair requests list
      queryClient.invalidateQueries({ queryKey: ['user', 'repair-requests'] });
    },
  });
};

// Hook to update repair request status (e.g., in_transit, in_progress)
export const useUpdateRepairRequestStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ requestId, status }: { requestId: string; status: string }) =>
      mechanicAPI.updateRepairRequestStatus(requestId, status),
    onSuccess: (_, variables) => {
      // Invalidate and refetch repair requests list
      queryClient.invalidateQueries({ queryKey: ['mechanic', 'repair-requests'] });
      // Invalidate and refetch repair request detail
      queryClient.invalidateQueries({ queryKey: ['repair-request', variables.requestId] });
    },
  });
};

// Hook to cancel repair request (for mechanics after accepting)
export const useCancelRepairRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason: string }) =>
      mechanicAPI.cancelRepairRequest(requestId, reason),
    onSuccess: (_, variables) => {
      // Invalidate and refetch repair requests list
      queryClient.invalidateQueries({ queryKey: ['mechanic', 'repair-requests'] });
      // Invalidate and refetch repair request detail
      queryClient.invalidateQueries({ queryKey: ['repair-request', variables.requestId] });
    },
  });
};
