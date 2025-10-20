import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { routes } from '@/constants/routes';
import { userAPI } from '@/lib/api/user';

interface UserData {
  access_token: string;
  refresh_token: string;
  user_id: string;
  email: string;
  role: string;
  message: string;
  referenceId: string;
}

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [shouldNavigate, setShouldNavigate] = useState(false);
  const [navigationTarget, setNavigationTarget] = useState<string | null>(null);
  const router = useRouter();

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Handle navigation after auth check is complete
  useEffect(() => {
    if (shouldNavigate && navigationTarget && !isLoading) {
      
      // Small delay to prevent navigation conflicts
      const timer = setTimeout(() => {
        router.replace(navigationTarget as any);
        setShouldNavigate(false);
        setNavigationTarget(null);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [shouldNavigate, navigationTarget, isLoading, router]);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);

      // Check if this is the first time opening the app
      const hasSeenWelcome = await AsyncStorage.getItem('has_seen_welcome');

      // If first time user, show welcome screen
      if (!hasSeenWelcome) {
        setIsAuthenticated(false);
        setUserData(null);
        setNavigationTarget(routes?.welcome as any);
        setShouldNavigate(true);
        return;
      }

      // Check if user is logged in
      const isLoggedIn = await AsyncStorage.getItem('is_logged_in');
      const accessToken = await AsyncStorage.getItem('auth_token');
      const storedUserData = await AsyncStorage.getItem('user_data');

      if (isLoggedIn === 'true' && accessToken && storedUserData) {
        const userData: UserData = JSON.parse(storedUserData);
        setUserData(userData);
        setIsAuthenticated(true);
        
        // Get current active role from server
        try {
          const rolesResponse = await userAPI.getUserRoles();
          const activeRole = rolesResponse.data.active_role;
          
          
          // Set navigation target for role-specific home page using server role
          if (activeRole && activeRole.name) {
            // Store the current active role for future fallback
            await AsyncStorage.setItem('current_active_role', activeRole.name);
            
            const targetRoute = getRoleHomeRoute(activeRole.name);
            setNavigationTarget(targetRoute as any);
            setShouldNavigate(true);
          } else {
            // Fallback to stored role if active role is not available
            const targetRoute = getRoleHomeRoute(userData.role);
            setNavigationTarget(targetRoute as any);
            setShouldNavigate(true);
          }
        } catch (rolesError) {
          
          // Try to get the last known active role from AsyncStorage
          const storedActiveRole = await AsyncStorage.getItem('current_active_role');
          
          if (storedActiveRole) {
            const targetRoute = getRoleHomeRoute(storedActiveRole);
            setNavigationTarget(targetRoute as any);
            setShouldNavigate(true);
          } else {
            // Final fallback to userData.role
            const targetRoute = getRoleHomeRoute(userData.role);
            setNavigationTarget(targetRoute as any);
            setShouldNavigate(true);
          }
        }
      } else {
        setIsAuthenticated(false);
        setUserData(null);
        // Set navigation target for login/register flow
        setNavigationTarget(routes?.signIn as any || '/sign-in');
        setShouldNavigate(true);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUserData(null);
      setNavigationTarget(routes?.signIn as any || '/sign-in');
      setShouldNavigate(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleHomeRoute = (role: string): string => {
    
    switch (role) {
      case 'primary_user':
        return routes?.userHome || '/(root)/(tabs)/(user)/home';
      case 'driver':
        return routes?.driverHome || '/(root)/(tabs)/(driver)/home';
      case 'mechanic':
        return routes?.mechanicHome || '/(root)/(tabs)/(mechanic)/home';
      case 'rider':
        return routes?.riderHome || '/(root)/(tabs)/(rider)/home';
      case 'merchant':
      case 'seller':
        return '/(root)/(tabs)/(sellers)/home';
      default:
        console.warn('⚠️ Unknown role:', role);
        return routes?.userHome || '/(root)/(tabs)/(user)/home';
    }
  };

  const logout = async () => {
    try {
      // Get refresh token for API logout
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      
      if (refreshToken) {
        // Call logout API (we'll import the userAPI here)
        try {
          const { userAPI } = await import('@/lib/api/user');
          await userAPI.logout({ refresh: refreshToken });
        } catch (apiError) {
        }
      }
      
      // Call /users/roles/ endpoint before clearing auth data
      try {
        const { userAPI } = await import('@/lib/api/user');
        const rolesResponse = await userAPI.getUserRoles();
        
        // Store roles data in local storage
        await AsyncStorage.setItem('user_roles_data', JSON.stringify(rolesResponse));
      } catch (rolesError) {
      }
      
      // Clear all stored auth data (but keep roles data)
      await AsyncStorage.multiRemove([
        'auth_token',
        'refresh_token',
        'user_data',
        'is_logged_in'
      ]);
      
      setIsAuthenticated(false);
      setUserData(null);
      
      // Navigate to login
      setNavigationTarget(routes?.signIn as any);
      setShouldNavigate(true);
      
    } catch (error) {
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // TODO: Implement token refresh API call
      // const response = await authAPI.refreshToken(refreshToken);
      // await AsyncStorage.setItem('auth_token', response.access_token);
      
      return true;
    } catch (error) {
      await logout();
      return false;
    }
  };

  // Utility function to reset welcome screen flag (for testing)
  const resetWelcomeFlag = async () => {
    try {
      await AsyncStorage.removeItem('has_seen_welcome');
      console.log('✅ Welcome screen flag reset - user will see welcome screen on next app start');
    } catch (error) {
      console.error('❌ Error resetting welcome flag:', error);
    }
  };

  return {
    isLoading,
    isAuthenticated,
    userData,
    logout,
    refreshToken,
    checkAuthStatus,
    shouldNavigate,
    navigationTarget,
    resetWelcomeFlag, // For testing purposes
  };
};
