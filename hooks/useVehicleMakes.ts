import { useQuery } from '@tanstack/react-query';
import { productsAPI, VehicleMake } from '@/lib/api/products';

export const useVehicleMakes = () => {
  const query = useQuery<VehicleMake[], Error>({
    queryKey: ['vehicle-makes'],
    queryFn: () => productsAPI.getVehicleMakes(),
    staleTime: 10 * 60 * 1000, // 10 minutes - vehicle makes don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer
    retry: 1,
    refetchOnMount: false, // Don't refetch on mount if data exists and is fresh
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnReconnect: false, // Don't auto-refetch on reconnect
    refetchInterval: false, // Disable automatic polling
    networkMode: 'online', // Only fetch when online
  });

  // Return with backward compatibility for 'loading' property
  return {
    ...query,
    loading: query.isLoading,
    data: query.data || [],
  };
};
