import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI, LoginCredentials } from '@/lib/api/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { routes } from '@/constants/routes';
import { getErrorMessage } from '@/utils/errorMessages';

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userAPI.login,
    onSuccess: async (response) => {
      console.log('✅ Login successful:', response);
      console.log('🔍 Login response structure check:');
      console.log('- response.access:', response.access ? 'exists' : 'missing');
      console.log('- response.refresh:', response.refresh ? 'exists' : 'missing');
      console.log('- response.user:', response.user ? 'exists' : 'missing');
      console.log('- response.data:', response.data ? 'exists' : 'missing');
      
      try {
        // Handle login response structure
        console.log('🔍 useLogin hook - checking response structure:');
        console.log('- response.access:', response.access ? 'exists' : 'missing');
        console.log('- response.refresh:', response.refresh ? 'exists' : 'missing');
        console.log('- response.user:', response.user ? 'exists' : 'missing');
        console.log('- response.data:', response.data ? 'exists' : 'missing');
        console.log('- Full response keys:', Object.keys(response));
        
        if (response.access && response.refresh) {
          console.log('✅ Response structure matches expected format');
          const { access, refresh, user, active_role } = response;
          
          // Handle user data - use user if available, otherwise create a basic user object
          const userData = user || {
            id: 'unknown',
            email: 'unknown@example.com',
            first_name: 'User',
            last_name: 'Name',
            role: active_role || 'primary_user'
          };
          
          await AsyncStorage.multiSet([
            ['auth_token', access],
            ['refresh_token', refresh],
            ['user_data', JSON.stringify(userData)],
            ['is_logged_in', 'true']
          ]);
          
          console.log('✅ Auth data stored successfully');
          console.log('🔍 Stored tokens:', { access: access.substring(0, 20) + '...', refresh: refresh.substring(0, 20) + '...' });
          
          // Navigate based on user role (use active_role from login response)
          const role = active_role || user?.role || 'primary_user';
          let targetRoute = routes?.userHome;
          
          switch (role) {
            case 'primary_user':
              targetRoute = routes?.userHome;
              break;
            case 'driver':
              targetRoute = routes?.driverHome;
              break;
            case 'mechanic':
              targetRoute = routes?.mechanicHome;
              break;
            case 'rider':
              targetRoute = routes?.riderHome;
              break;
            default:
              targetRoute = routes?.userHome;
          }
          
          console.log('🚀 Navigating to:', targetRoute);
          router.replace(targetRoute);
        } else {
          console.log('❌ Response structure does not match expected format');
          console.log('🔍 Expected: response.access, response.refresh, response.user');
          console.log('🔍 Got:', Object.keys(response));
          
          // Try alternative response structures
          console.log('🔄 Trying alternative response structures...');
          
          // Check if tokens are in response.data
          if (response.data && response.data.access && response.data.refresh) {
            console.log('✅ Found tokens in response.data');
            const { access, refresh, user_data } = response.data;
            
            // Handle user data - use user_data if available, otherwise create a basic user object
            const userData = user_data || {
              id: 'unknown',
              email: 'unknown@example.com',
              first_name: 'User',
              last_name: 'Name',
              role: 'primary_user'
            };
            
            await AsyncStorage.multiSet([
              ['auth_token', access],
              ['refresh_token', refresh],
              ['user_data', JSON.stringify(userData)],
              ['is_logged_in', 'true']
            ]);
            
            console.log('✅ Auth data stored successfully (from response.data)');
            router.replace(routes?.userHome);
            return;
          }
          
          // Check if tokens are at root level with different names
          if (response.access_token && response.refresh_token) {
            console.log('✅ Found tokens as access_token/refresh_token');
            const { access_token, refresh_token, user } = response;
            
            // Handle user data - use user if available, otherwise create a basic user object
            const userData = user || {
              id: 'unknown',
              email: 'unknown@example.com',
              first_name: 'User',
              last_name: 'Name',
              role: 'primary_user'
            };
            
            await AsyncStorage.multiSet([
              ['auth_token', access_token],
              ['refresh_token', refresh_token],
              ['user_data', JSON.stringify(userData)],
              ['is_logged_in', 'true']
            ]);
            
            console.log('✅ Auth data stored successfully (as access_token/refresh_token)');
            router.replace(routes?.userHome);
            return;
          }
          
          console.log('❌ Could not find tokens in any expected location');
        }
      } catch (storageError) {
        console.error('❌ Error storing auth data:', storageError);
        // Still navigate even if storage fails
        router.replace(routes?.userHome);
      }
    },
    onError: (error: any) => {
      console.error('❌ Login failed:', error);
      const errorMessage = getErrorMessage(error, 'login');
      console.error('User-friendly error:', errorMessage);
    },
  });
};
