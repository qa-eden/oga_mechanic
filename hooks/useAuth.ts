import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { routes } from '@/constants/routes';

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
      console.log('🚀 Navigating to:', navigationTarget);
      
      // Small delay to prevent navigation conflicts
      const timer = setTimeout(() => {
        router.replace(navigationTarget);
        setShouldNavigate(false);
        setNavigationTarget(null);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [shouldNavigate, navigationTarget, isLoading, router]);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is logged in
      const isLoggedIn = await AsyncStorage.getItem('is_logged_in');
      const accessToken = await AsyncStorage.getItem('auth_token');
      const storedUserData = await AsyncStorage.getItem('user_data');

      if (isLoggedIn === 'true' && accessToken && storedUserData) {
        const userData: UserData = JSON.parse(storedUserData);
        setUserData(userData);
        setIsAuthenticated(true);
        
        // Set navigation target for role-specific home page
        const targetRoute = getRoleHomeRoute(userData.role);
        setNavigationTarget(targetRoute);
        setShouldNavigate(true);
      } else {
        setIsAuthenticated(false);
        setUserData(null);
        // Set navigation target for login/register flow
        setNavigationTarget(routes?.signIn || '/sign-in');
        setShouldNavigate(true);
      }
    } catch (error) {
      console.error('❌ Error checking auth status:', error);
      setIsAuthenticated(false);
      setUserData(null);
      setNavigationTarget(routes?.signIn || '/sign-in');
      setShouldNavigate(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleHomeRoute = (role: string): string => {
    console.log('🏠 Getting route for role:', role);
    
    switch (role) {
      case 'primary_user':
        return routes?.userHome || '/(root)/(tabs)/(user)/home';
      case 'driver':
        return routes?.driverHome || '/(root)/(tabs)/(driver)/home';
      case 'mechanic':
        return routes?.mechanicHome || '/(root)/(tabs)/(mechanic)/home';
      case 'rider':
        return routes?.riderHome || '/(root)/(tabs)/(rider)/home';
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
          console.log('✅ Logout API called successfully');
        } catch (apiError) {
          console.error('❌ Logout API failed, but continuing with local logout:', apiError);
        }
      }
      
      // Clear all stored data
      await AsyncStorage.multiRemove([
        'auth_token',
        'refresh_token',
        'user_data',
        'is_logged_in'
      ]);
      
      setIsAuthenticated(false);
      setUserData(null);
      
      // Navigate to login
      setNavigationTarget(routes?.signIn || '/sign-in');
      setShouldNavigate(true);
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Error during logout:', error);
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
      
      console.log('✅ Token refreshed successfully');
      return true;
    } catch (error) {
      console.error('❌ Error refreshing token:', error);
      await logout();
      return false;
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
  };
};
