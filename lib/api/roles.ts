import { BASE_URL, AUTH_ENDPOINTS } from '../endpoints';
import { mockRolesAPI } from './mockRoles';

// Role interface
export interface Role {
  id: number;
  name: string;
  title?: string;
  description?: string;
  route?: string;
  backgroundColor?: string;
  border?: string;
  image?: any;
}

// API response interface
export interface RolesResponse {
  success?: boolean;
  data?: Role[];
  roles?: Role[];
  message?: string;
  status?: number;
}

// Roles API service
export const rolesAPI = {
  // Fetch all roles
  getRoles: async (): Promise<Role[]> => {
    try {

      
      const response = await fetch(`${BASE_URL}${AUTH_ENDPOINTS.ALL_ROLES}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });



      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: RolesResponse = await response.json();

      
      // Handle different response formats
      let roles: Role[] = [];
      
      if (Array.isArray(data)) {

        roles = data;
      } else if (data && typeof data === 'object') {

        
        if (data.roles && Array.isArray(data.roles)) {

          roles = data.roles;
        } else if (data.data && Array.isArray(data.data)) {

          roles = data.data;
        } else {

          roles = [];
        }
      } else {

        roles = [];
      }



      return roles;

    } catch (error: any) {
      console.error('❌ Error fetching roles:', error);
      console.error('❌ Error details:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack || 'No stack trace',
        name: error?.name || 'Unknown error type'
      });
      
      // Fallback to mock data for development
      try {
        const mockRoles = await mockRolesAPI.getRoles();
        return mockRoles;
      } catch (mockError) {
        console.error('❌ Mock data also failed:', mockError);
        throw error; // Throw original error if mock also fails
      }
    }
  },
};
