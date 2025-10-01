import { useMutation } from '@tanstack/react-query';
import { userAPI, LogoutCredentials } from '@/lib/api/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { routes } from '@/constants/routes';

export const useLogout = () => {
  return useMutation({
    mutationFn: userAPI.logout,
    onSuccess: async (response) => {
      
      try {
        // Clear all stored auth data
        await AsyncStorage.multiRemove([
          'auth_token',
          'refresh_token',
          'user_data',
          'is_logged_in'
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
      
      try {
        // Clear auth data and navigate
        await AsyncStorage.multiRemove([
          'auth_token',
          'refresh_token',
          'user_data',
          'is_logged_in'
        ]);
        router.replace(routes?.signIn);
      } catch (storageError) {
        router.replace(routes?.signIn);
      }
    },
  });
};
