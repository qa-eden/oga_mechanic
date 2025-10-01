import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI, LoginCredentials } from '@/lib/api/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { driverRoutes, mechanicRoutes, riderRoutes, routes, sellerRoutes } from '@/constants/routes';
import { getErrorMessage } from '@/utils/errorMessages';

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userAPI.login,
      onSuccess: async (response) => {
        try {
          // Handle login response structure - data is nested under 'data' property
          const responseData = response.data || response;
          
          if (responseData.access && responseData.refresh) {
            const { access, refresh, user } = responseData;
            const active_role = user?.active_role || (responseData as any).active_role;
            
            // Use actual user data from response
            const userData = user || {
              id: responseData.id || 'unknown',
              email: responseData.email || 'unknown@example.com',
              first_name: responseData.first_name || 'User',
              last_name: responseData.last_name || 'Name',
              role: active_role || 'primary_user'
            };
            
            await AsyncStorage.multiSet([
              ['auth_token', access],
              ['refresh_token', refresh],
              ['user_data', JSON.stringify(userData)],
              ['is_logged_in', 'true']
            ]);
            
            // Call /users/roles/ endpoint after successful login
            try {
              const rolesResponse = await userAPI.getUserRoles();
              await AsyncStorage.setItem('user_roles_data', JSON.stringify(rolesResponse));
            } catch (rolesError) {
              console.error('Failed to fetch roles after login:', rolesError);
            }
            
            // Navigate based on user role (use active_role from login response)
            const role = active_role || 'primary_user';
            let targetRoute: string = routes?.userHome || '/(root)/(tabs)/(user)/home';
            
            switch (role) {
              case 'primary_user':
                targetRoute = routes?.userHome || '/(root)/(tabs)/(user)/home';
                break;
              case 'driver':
                targetRoute = driverRoutes?.home || '/(root)/(tabs)/(driver)/home';
                break;
              case 'mechanic':
                targetRoute = mechanicRoutes?.home || '/(root)/(tabs)/(mechanic)/home';
                break;
              case 'rider':
                targetRoute = riderRoutes?.home || '/(root)/(tabs)/(rider)/home';
                break;
              case 'merchant':
                targetRoute = sellerRoutes?.home || '/(root)/(tabs)/(sellers)/home';
                break;
              case 'seller':
                targetRoute = sellerRoutes?.home || '/(root)/(tabs)/(sellers)/home';
                break;
              default:
                targetRoute = routes?.userHome || '/(root)/(tabs)/(user)/home';
            }
          
            router.replace(targetRoute as any);
          } else {
            // Fallback: try direct response structure
            if (response.access && response.refresh) {
              const { access, refresh, user } = response;
              const active_role = user?.active_role || (response as any).active_role;
              
              const userData = user || {
                id: response.id || 'unknown',
                email: response.email || 'unknown@example.com',
                first_name: response.first_name || 'User',
                last_name: response.last_name || 'Name',
                role: active_role || 'primary_user'
              };
              
              await AsyncStorage.multiSet([
                ['auth_token', access],
                ['refresh_token', refresh],
                ['user_data', JSON.stringify(userData)],
                ['is_logged_in', 'true']
              ]);
              
              // Navigate based on role
              const role = active_role || 'primary_user';
              let targetRoute: string = routes?.userHome || '/(root)/(tabs)/(user)/home';
              
              switch (role) {
                case 'primary_user':
                  targetRoute = routes?.userHome || '/(root)/(tabs)/(user)/home';
                  break;
                case 'driver':
                  targetRoute = driverRoutes?.home || '/(root)/(tabs)/(driver)/home';
                  break;
                case 'mechanic':
                  targetRoute = mechanicRoutes?.home || '/(root)/(tabs)/(mechanic)/home';
                  break;
                case 'rider':
                  targetRoute = riderRoutes?.home || '/(root)/(tabs)/(rider)/home';
                  break;
                case 'merchant':
                case 'seller':
                  targetRoute = sellerRoutes?.home || '/(root)/(tabs)/(sellers)/home';
                  break;
                default:
                  targetRoute = routes?.userHome || '/(root)/(tabs)/(user)/home';
              }
              
              router.replace(targetRoute as any);
            } else {
              // No valid tokens found
              console.error('No valid tokens found in login response');
              router.replace(routes?.userHome as any);
            }
          }
        } catch (storageError) {
          console.error('Error during login process:', storageError);
          router.replace(routes?.userHome as any);
        }
      },
    onError: (error: any) => {
      const errorMessage = getErrorMessage(error, 'login');
    },
  });
};
