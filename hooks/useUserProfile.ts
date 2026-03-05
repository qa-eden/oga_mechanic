import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI, PrimaryUserProfileResponse, UserRolesResponse, UserProfile, MerchantProfileResponse, BanksResponse, BankEnquiryRequest, BankEnquiryResponse } from '@/lib/api/user';

// Query key factory
export const userProfileKeys = {
  all: ['userProfile'] as const,
  primary: () => [...userProfileKeys.all, 'primary'] as const,
  merchant: () => [...userProfileKeys.all, 'merchant'] as const,
  merchantByUuid: (uuid: string) => [...userProfileKeys.all, 'merchant', 'uuid', uuid] as const,
  profile: () => [...userProfileKeys.all, 'profile'] as const,
  roles: () => [...userProfileKeys.all, 'roles'] as const,
  notifications: () => [...userProfileKeys.all, 'notifications'] as const,
  banks: () => [...userProfileKeys.all, 'banks'] as const,
};

// Hook to get primary user profile
export const usePrimaryUserProfile = (enabled: boolean = true) => {
  return useQuery<PrimaryUserProfileResponse>({
    queryKey: userProfileKeys.primary(),
    queryFn: userAPI.getPrimaryProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1, // Reduce retries
    refetchOnMount: false, // Don't refetch on mount if data exists
    refetchOnWindowFocus: false, // Don't refetch on window focus
    enabled: enabled, // Only fetch when enabled
  });
};

// Hook to get merchant profile (only when enabled)
export const useMerchantProfile = (enabled: boolean = true) => {
  return useQuery<MerchantProfileResponse>({
    queryKey: userProfileKeys.merchant(),
    queryFn: userAPI.getMerchantProfile,
    staleTime: 0, // Always fetch to check KYC
    retry: 2,
    enabled: enabled,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

// Hook to get mechanic profile (only when enabled)
export const useMechanicProfile = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['mechanic', 'profile'],
    queryFn: () => userAPI.getMechanicProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: enabled, // Only fetch when enabled
    refetchOnMount: false, // Don't refetch on mount if data exists
    refetchOnWindowFocus: false, // Don't refetch on window focus
    retry: 1, // Reduce retries
  });
};

// Hook to get driver profile (only when enabled)
export const useDriverProfile = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['driver', 'profile'],
    queryFn: () => userAPI.getDriverProfile(),
    staleTime: 0, // Always fetch to check KYC
    retry: 2,
    enabled: enabled,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

// Hook to get rider profile (only when enabled)
export const useRiderProfile = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['rider', 'profile'],
    queryFn: () => userAPI.getRiderProfile(),
    staleTime: 0, // Always fetch to check KYC
    retry: 2,
    enabled: enabled,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

// Hook to get merchant profile by UUID
export const useMerchantProfileByUuid = (merchantUuid: string, enabled: boolean = true) => {
  return useQuery<MerchantProfileResponse>({
    queryKey: userProfileKeys.merchantByUuid(merchantUuid),
    queryFn: () => userAPI.getMerchantProfileByUuid(merchantUuid),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    enabled: enabled && !!merchantUuid,
  });
};

// Hook to get the appropriate profile based on active role
export const useActiveRoleProfile = () => {
  // First, get primary profile to check active role
  const primaryProfile = usePrimaryUserProfile();
  const activeRole = primaryProfile.data?.data?.active_role;

  // Only fetch merchant profile if role is merchant
  const isMerchant = activeRole === 'merchant';
  const merchantProfile = useMerchantProfile(isMerchant);

  console.log('🔍 useActiveRoleProfile - Active Role:', activeRole);
  console.log('🔍 useActiveRoleProfile - Is Merchant:', isMerchant);
  console.log('🔍 useActiveRoleProfile - Merchant Profile Loading:', merchantProfile.isLoading);
  console.log('🔍 useActiveRoleProfile - Merchant Profile Data:', merchantProfile.data);

  // Return the appropriate profile based on active role
  if (isMerchant && merchantProfile.data && !merchantProfile.isLoading) {
    console.log('✅ Returning MERCHANT profile data');
    return {
      data: merchantProfile.data,
      isLoading: primaryProfile.isLoading || merchantProfile.isLoading,
      error: merchantProfile.error || primaryProfile.error,
      refetch: async () => {
        await primaryProfile.refetch();
        await merchantProfile.refetch();
      },
      activeRole: activeRole,
    };
  }

  // Default to primary profile (or while loading merchant profile)
  console.log('✅ Returning PRIMARY profile data');
  return {
    data: primaryProfile.data,
    isLoading: primaryProfile.isLoading || (isMerchant && merchantProfile.isLoading),
    error: primaryProfile.error,
    refetch: primaryProfile.refetch,
    activeRole: activeRole,
  };
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

// Hook to get role-specific user profile (now uses primary profile for all roles)
export const useRoleUserProfile = (role?: string) => {
  return useQuery<UserProfile | MerchantProfileResponse>({
    queryKey: [...userProfileKeys.profile(), 'primary'], // Use 'primary' instead of role
    queryFn: () => userAPI.getRoleProfile(role),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    // Remove enabled condition since we always want to fetch profile
  });
};

// Hook to get user roles
export const useUserRoles = () => {
  return useQuery<UserRolesResponse>({
    queryKey: userProfileKeys.roles(),
    queryFn: userAPI.getUserRoles,
    staleTime: 1 * 60 * 1000, // 1 minute - shorter stale time to get fresh role data
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnMount: true, // Always refetch on mount to get latest role
    refetchOnWindowFocus: true, // Refetch when window regains focus
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

// Hook to get notifications
export const useNotifications = () => {
  return useQuery({
    queryKey: userProfileKeys.notifications(),
    queryFn: userAPI.getNotifications,
    staleTime: 2 * 60 * 1000, // 2 minutes - notifications change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    networkMode: 'online',
  });
};

// Hook to mark a notification as read
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => userAPI.markNotificationAsRead(id),
    onSuccess: () => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: userProfileKeys.notifications() });
    },
    onError: (error) => {
      console.error('❌ Error marking notification as read:', error);
    },
  });
};

// Hook to mark all notifications as read
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userAPI.markAllNotificationsAsRead,
    onSuccess: () => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: userProfileKeys.notifications() });
    },
    onError: (error) => {
      console.error('❌ Error marking all notifications as read:', error);
    },
  });
};

// Hook to follow a merchant
export const useFollowMerchant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userAPI.followMerchant,
    onSuccess: (_, merchantId) => {
      // Invalidate and refetch specific merchant profile
      queryClient.invalidateQueries({ queryKey: userProfileKeys.merchantByUuid(merchantId) });
      // Also invalidate general merchant queries if necessary
      queryClient.invalidateQueries({ queryKey: userProfileKeys.merchant() });
      // Invalidate followed merchants list
      queryClient.invalidateQueries({ queryKey: ['followedMerchants'] });
    },
    onError: (error) => {
      console.error('❌ Error following merchant:', error);
    },
  });
};

// Hook to unfollow a merchant
export const useUnfollowMerchant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userAPI.unfollowMerchant,
    onSuccess: (_, merchantId) => {
      // Invalidate and refetch specific merchant profile
      queryClient.invalidateQueries({ queryKey: userProfileKeys.merchantByUuid(merchantId) });
      // Also invalidate general merchant queries if necessary
      queryClient.invalidateQueries({ queryKey: userProfileKeys.merchant() });
      // Invalidate followed merchants list
      queryClient.invalidateQueries({ queryKey: ['followedMerchants'] });
    },
    onError: (error) => {
      console.error('❌ Error unfollowing merchant:', error);
    },
  });
};

// Hook to get followed merchants
export const useFollowedMerchants = () => {
  return useQuery({
    queryKey: ['followedMerchants'],
    queryFn: userAPI.getFollowedMerchants,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Hook to get list of banks
export const useBanks = (enabled: boolean = true) => {
  return useQuery<BanksResponse>({
    queryKey: userProfileKeys.banks(),
    queryFn: userAPI.getBanks,
    staleTime: 24 * 60 * 60 * 1000, // Banks don't change often, keep for 24 hours
    retry: 2,
    enabled: enabled,
  });
};

// Hook to verify bank account
export const useVerifyBank = () => {
  return useMutation<BankEnquiryResponse, Error, BankEnquiryRequest>({
    mutationFn: (data: BankEnquiryRequest) => userAPI.verifyBank(data),
    onError: (error) => {
      console.error('❌ Error verifying bank account:', error);
    },
  });
};
