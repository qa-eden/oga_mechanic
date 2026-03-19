import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI, LogoutCredentials } from '@/lib/api/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { routes } from '@/constants/routes';
import { useMechanicStore } from '@/stores/mechanicStore';
import { useRegistrationStore } from '@/stores/registrationStore';

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userAPI.logout,
    onSuccess: async (response) => {
      // Clear TanStack Query cache
      queryClient.clear();
      
      try {
        // Clear global stores
        useMechanicStore.getState().reset();
        useRegistrationStore.getState().clearStepByStepData();

        // Clear all stored auth data
        await AsyncStorage.multiRemove([
          'auth_token',
          'refresh_token',
          'user_data',
          'is_logged_in',
          'user_roles_data',
          'current_active_role'
        ]);
        
        // Navigate to login page
        router.replace(routes?.signIn);
        
      } catch (storageError) {
        // Still clear auth data and navigate even if storage fails
        try {
          await AsyncStorage.multiRemove([
            'auth_token',
            'refresh_token',
            'user_data',
            'is_logged_in'
          ]);
        } catch (clearError) {
        }
        router.replace(routes?.signIn);
      }
    },
    onError: async (error: any) => {
      // Clear TanStack Query cache even on error
      queryClient.clear();
      
      try {
        // Clear global stores
        useMechanicStore.getState().reset();
        useRegistrationStore.getState().clearStepByStepData();

        // Clear auth data and navigate
        await AsyncStorage.multiRemove([
          'auth_token',
          'refresh_token',
          'user_data',
          'is_logged_in',
          'user_roles_data',
          'current_active_role'
        ]);
        router.replace(routes?.signIn);
      } catch (storageError) {
        router.replace(routes?.signIn);
      }
    },
  });
};
