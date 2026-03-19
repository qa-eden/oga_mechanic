import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { routes } from '@/constants/routes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userAPI } from '@/lib/api/user';
import { useMechanicStore } from '@/stores/mechanicStore';
import { useRegistrationStore } from '@/stores/registrationStore';

export const useCentralizedLogout = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const queryClient = useQueryClient();

  const logout = async () => {
    if (isLoggingOut) return; // Prevent multiple simultaneous logouts
    
    setIsLoggingOut(true);
    
    try {
      console.log('🔄 Starting centralized logout process...');
      
      // Get refresh token for API logout
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      
      if (refreshToken) {
        try {
          // Call logout API
          await userAPI.logout({ refresh: refreshToken });
          console.log('✅ Logout API called successfully');
        } catch (apiError) {
          console.error('❌ Logout API failed, but continuing with local logout:', apiError);
        }
      }
      
      // Call /users/roles/ endpoint before clearing auth data
      try {
        console.log('🔄 Fetching user roles before logout...');
        const rolesResponse = await userAPI.getUserRoles();
        console.log('✅ User roles fetched:', rolesResponse);
        
        // Store roles data in local storage
        await AsyncStorage.setItem('user_roles_data', JSON.stringify(rolesResponse));
        console.log('✅ User roles data stored in AsyncStorage');
      } catch (rolesError) {
        console.error('❌ Failed to fetch roles during logout:', rolesError);
      }
      
      // Clear TanStack Query cache
      queryClient.clear();
      
      // Clear global stores
      useMechanicStore.getState().reset();
      useRegistrationStore.getState().clearStepByStepData();

      // Clear all stored auth data (but keep roles data)
      await AsyncStorage.multiRemove([
        'auth_token',
        'refresh_token',
        'user_data',
        'is_logged_in',
        'current_active_role', // Clear the stored active role on logout
        'user_roles_data'      // Added for complete wipe
      ]);
      
      console.log('✅ All auth data cleared from AsyncStorage (roles data preserved)');
      
      // Navigate to login page
      router.replace(routes?.signIn as any);
      
      console.log('✅ Centralized logout successful');
      
    } catch (error) {
      console.error('❌ Error during centralized logout:', error);
      
      // Fallback: clear storage and navigate even if everything fails
      queryClient.clear();
      useMechanicStore.getState().reset();
      useRegistrationStore.getState().clearStepByStepData();
      
      try {
        await AsyncStorage.multiRemove([
          'auth_token',
          'refresh_token',
          'user_data',
          'is_logged_in',
          'current_active_role',
          'user_roles_data'
        ]);
        router.replace(routes?.signIn as any);
      } catch (fallbackError) {
        console.error('❌ Fallback logout failed:', fallbackError);
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  return {
    logout,
    isLoggingOut,
  };
};
