import { useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authEvents } from '@/lib/authEvents';
import { routes } from '@/constants/routes';

export const AuthEventProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const unsubscribe = authEvents.onUnauthorized.subscribe(async () => {
      console.log('🔒 401 Unauthorized - Logging out user...');
      
      try {
        // Clear all auth data
        await AsyncStorage.multiRemove([
          'auth_token',
          'refresh_token',
          'user_data',
          'is_logged_in',
          'current_active_role',
        ]);
        
        console.log('✅ Auth data cleared, redirecting to login...');
        
        // Navigate to login
        router.replace(routes?.signIn as any);
      } catch (error) {
        console.error('❌ Error during 401 logout:', error);
        // Force navigation even if storage clear fails
        router.replace(routes?.signIn as any);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return <>{children}</>;
};
