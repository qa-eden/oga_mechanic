import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI, PrimaryUserProfileResponse, UserRolesResponse } from '@/lib/api/user';

// Query key factory
export const userProfileKeys = {
  all: ['userProfile'] as const,
  primary: () => [...userProfileKeys.all, 'primary'] as const,
  profile: () => [...userProfileKeys.all, 'profile'] as const,
  roles: () => [...userProfileKeys.all, 'roles'] as const,
};

// Hook to get primary user profile
export const usePrimaryUserProfile = () => {
  return useQuery<PrimaryUserProfileResponse>({
    queryKey: userProfileKeys.primary(),
    queryFn: userAPI.getPrimaryProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Hook to get user profile
export const useUserProfile = () => {
  return useQuery({
    queryKey: userProfileKeys.profile(),
    queryFn: userAPI.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Hook to get user roles
export const useUserRoles = () => {
  return useQuery<UserRolesResponse>({
    queryKey: userProfileKeys.roles(),
    queryFn: userAPI.getUserRoles,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Hook to update user profile
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userAPI.updateProfile,
    onSuccess: (data) => {
      // Invalidate and refetch profile queries
      queryClient.invalidateQueries({ queryKey: userProfileKeys.all });
      console.log('✅ Profile updated successfully:', data);
    },
    onError: (error) => {
      console.error('❌ Error updating profile:', error);
    },
  });
};
