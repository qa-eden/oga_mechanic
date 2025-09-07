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
      console.log('🔍 Fetching roles from API...');
      console.log('🌐 API URL:', `${BASE_URL}${AUTH_ENDPOINTS.ALL_ROLES}`);
      
      const response = await fetch(`${BASE_URL}${AUTH_ENDPOINTS.ALL_ROLES}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: RolesResponse = await response.json();
      console.log('✅ API Response received:');
      console.log('📊 Raw data:', JSON.stringify(data, null, 2));
      console.log('📊 Data type:', typeof data);
      console.log('📊 Data keys:', Object.keys(data || {}));
      
      // Handle different response formats
      let roles: Role[] = [];
      
      if (Array.isArray(data)) {
        console.log('📊 Direct array response, length:', data.length);
        roles = data;
      } else if (data && typeof data === 'object') {
        console.log('📊 Object response structure:', JSON.stringify(data, null, 2));
        
        if (data.roles && Array.isArray(data.roles)) {
          console.log('📊 Found roles array:', data.roles.length);
          roles = data.roles;
        } else if (data.data && Array.isArray(data.data)) {
          console.log('📊 Found data array:', data.data.length);
          roles = data.data;
        } else {
          console.log('📊 No roles array found in response');
          roles = [];
        }
      } else {
        console.log('📊 Unexpected data format');
        roles = [];
      }

      // Log individual roles
      roles.forEach((role, index) => {
        console.log(`📊 Role ${index + 1}:`, JSON.stringify(role, null, 2));
      });

      return roles;

    } catch (error: any) {
      console.error('❌ Error fetching roles:', error);
      console.error('❌ Error details:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack || 'No stack trace',
        name: error?.name || 'Unknown error type'
      });
      
      // Fallback to mock data for development
      console.log('🔄 Falling back to mock roles data...');
      try {
        const mockRoles = await mockRolesAPI.getRoles();
        console.log('✅ Mock roles loaded successfully:', mockRoles.length, 'roles');
        return mockRoles;
      } catch (mockError) {
        console.error('❌ Mock data also failed:', mockError);
        throw error; // Throw original error if mock also fails
      }
    }
  },
};
