import { useQuery } from '@tanstack/react-query';
import { rolesAPI, Role } from '@/lib/api/roles';

// Query keys for roles
export const rolesQueryKeys = {
  all: ['roles'] as const,
  lists: () => [...rolesQueryKeys.all, 'list'] as const,
  list: (filters: string) => [...rolesQueryKeys.lists(), { filters }] as const,
};

// useRoles hook
export const useRoles = () => {
  return useQuery({
    queryKey: rolesQueryKeys.lists(),
    queryFn: rolesAPI.getRoles,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
};

// useRoleById hook (for future use)
export const useRoleById = (id: number) => {
  return useQuery({
    queryKey: [...rolesQueryKeys.all, 'detail', id],
    queryFn: () => rolesAPI.getRoles().then(roles => roles.find(role => role.id === id)),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Export types
export type { Role };
