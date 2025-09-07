import { useMutation } from '@tanstack/react-query';
import { userAPI, LogoutCredentials } from '@/lib/api/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { routes } from '@/constants/routes';

export const useLogout = () => {
  return useMutation({
    mutationFn: userAPI.logout,
    onSuccess: async (response) => {
      console.log('✅ Logout successful:', response);
      
      try {
        // Clear all stored data
        await AsyncStorage.multiRemove([
          'auth_token',
          'refresh_token',
          'user_data',
          'is_logged_in'
        ]);
        
        console.log('✅ All auth data cleared from AsyncStorage');
        
        // Navigate to login page
        router.replace(routes?.signIn);
        
      } catch (storageError) {
        console.error('❌ Error clearing storage during logout:', storageError);
        // Still navigate even if storage clearing fails
        router.replace(routes?.signIn);
      }
    },
    onError: (error: any) => {
      console.error('❌ Logout failed:', error);
      
      // Even if logout API fails, clear local storage and navigate
      AsyncStorage.multiRemove([
        'auth_token',
        'refresh_token',
        'user_data',
        'is_logged_in'
      ]).then(() => {
        console.log('✅ Local storage cleared despite API error');
        router.replace(routes?.signIn);
      }).catch((storageError) => {
        console.error('❌ Error clearing storage:', storageError);
        router.replace(routes?.signIn);
      });
    },
  });
};
