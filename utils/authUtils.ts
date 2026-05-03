import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { routes } from '@/constants/routes';

interface MockUserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

// Mock user data for different roles
const mockUsers: Record<string, MockUserData> = {
  user: {
    id: 'user-123',
    email: 'user@example.com',
    first_name: 'John',
    last_name: 'Doe',
    role: 'primary_user'
  },
  mechanic: {
    id: 'mechanic-123',
    email: 'mechanic@example.com',
    first_name: 'Mike',
    last_name: 'Johnson',
    role: 'mechanic'
  },
};

// Direct login to specific role (for testing/development)
export const loginAsRole = async (role: 'user' | 'mechanic') => {
  try {
    const userData = mockUsers[role];
    const mockTokens = {
      access: `mock_access_token_${role}_${Date.now()}`,
      refresh: `mock_refresh_token_${role}_${Date.now()}`
    };

    // Store auth data
    await AsyncStorage.multiSet([
      ['auth_token', mockTokens.access],
      ['refresh_token', mockTokens.refresh],
      ['user_data', JSON.stringify(userData)],
      ['is_logged_in', 'true']
    ]);

    // Navigate to role-specific home
    const targetRoute = getRoleHomeRoute(role);
    router.replace(targetRoute as any);
    
    return { success: true, userData };
  } catch (error) {
    return { success: false, error };
  }
};

// Get role-specific home route
export const getRoleHomeRoute = (role: string): string => {
  switch (role) {
    case 'primary_user':
    case 'user':
      return routes?.userHome || '/(root)/(tabs)/(user)/home';
    case 'mechanic':
      return routes?.mechanicHome || '/(root)/(tabs)/(mechanic)/home';
    case 'merchant':
    case 'seller':
      return '/(root)/(tabs)/(sellers)/home';
    default:
      return routes?.userHome || '/(root)/(tabs)/(user)/home';
  }
};

// Check if user is logged in
export const isLoggedIn = async (): Promise<boolean> => {
  try {
    const isLoggedIn = await AsyncStorage.getItem('is_logged_in');
    const accessToken = await AsyncStorage.getItem('auth_token');
    return isLoggedIn === 'true' && !!accessToken;
  } catch (error) {
    console.error('❌ Error checking login status:', error);
    return false;
  }
};

// Get current user data
export const getCurrentUser = async (): Promise<MockUserData | null> => {
  try {
    const userDataString = await AsyncStorage.getItem('user_data');
    if (userDataString) {
      return JSON.parse(userDataString);
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting current user:', error);
    return null;
  }
};

// Clear all auth data
export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      'auth_token',
      'refresh_token',
      'user_data',
      'is_logged_in'
    ]);
    console.log('✅ Auth data cleared');
  } catch (error) {
    console.error('❌ Error clearing auth data:', error);
  }
};