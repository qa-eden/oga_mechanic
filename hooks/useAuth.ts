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
  // router is intentionally excluded from deps — it's a stable singleton in Expo Router
  // and including it caused the effect to re-fire on re-renders.
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldNavigate, navigationTarget, isLoading]);

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
        // Bug 14 fix: Check JWT expiry before trusting the stored token.
        // A stored token that has expired would pass the above check but cause
        // 401 errors on every subsequent API call.
        const isTokenExpired = (() => {
          try {
            const [, payload] = accessToken.split('.');
            const decoded = JSON.parse(atob(payload));
            // exp is in seconds; Date.now() is in milliseconds
            return decoded.exp * 1000 < Date.now();
          } catch {
            // If decoding fails, treat token as expired to be safe
            return true;
          }
        })();

        if (isTokenExpired) {
          // Attempt a token refresh before giving up
          const refreshed = await refreshToken();
          if (!refreshed) {
            // Refresh failed — send user to login
            setIsAuthenticated(false);
            setUserData(null);
            setNavigationTarget(routes?.signIn as any || '/sign-in');
            setShouldNavigate(true);
            return;
          }
        }

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
      case 'mechanic':
        return routes?.mechanicHome || '/(root)/(tabs)/(mechanic)/home';
      case 'merchant':
      case 'seller':
      case 'vehicle_rental':
        return '/(root)/(tabs)/(sellers)/home';
      default:
        console.warn('⚠️ Unknown or inactive role:', role);
        return routes?.userHome || '/(root)/(tabs)/(user)/home';
    }
  };

  const logout = async () => {
    try {
      // Get refresh token for API logout
      const storedRefreshToken = await AsyncStorage.getItem('refresh_token');
      
      if (storedRefreshToken) {
        try {
          const { userAPI } = await import('@/lib/api/user');
          await userAPI.logout({ refresh: storedRefreshToken });
        } catch (apiError) {
          // Best-effort: server-side logout failure should not block local cleanup
        }
      }
      
      // Bug 1 & 15 fix: Do NOT call getUserRoles() after logout — the token is
      // about to be cleared, so the call may use an invalidated token. Persisting
      // role data also leaks information to any future session on the same device.
      // Instead, clear role data as part of the multiRemove below.
      await AsyncStorage.multiRemove([
        'auth_token',
        'refresh_token',
        'user_data',
        'is_logged_in',
        'user_roles_data',   // Bug 15: remove stale role data instead of writing it
        'current_active_role',
      ]);
      
      setIsAuthenticated(false);
      setUserData(null);
      
      // Navigate to login
      setNavigationTarget(routes?.signIn as any);
      setShouldNavigate(true);
      
    } catch (error) {
      // Ensure UI reflects logged-out state even if cleanup partially fails
      setIsAuthenticated(false);
      setUserData(null);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const { BASE_URL } = await import('@/lib/endpoints'); // Accessing endpoints
      const response = await fetch(`${BASE_URL}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      const data = await response.json();
      if (data.access) {
        await AsyncStorage.setItem('auth_token', data.access);
        return true;
      }
      return false;
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
