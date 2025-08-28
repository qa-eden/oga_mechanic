import api from '../axios';
import { USER_ENDPOINTS } from '../endpoints';

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  roles: number[];
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: number[];
  profileImage?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
  message: string;
}

export interface RegisterResponse {
  success: boolean;
  data: {
    user: UserProfile;
    access_token: string;
    refresh_token: string;
  };
  message: string;
}

// API Functions
export const userAPI = {
  // User login
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post(USER_ENDPOINTS.LOGIN, credentials);
    return response.data;
  },

  // User registration
  register: async (userData: RegisterData): Promise<RegisterResponse> => {
    console.log('=== REGISTRATION API REQUEST ===');
    console.log('Endpoint:', USER_ENDPOINTS.REGISTER);
    console.log('Request data:', JSON.stringify(userData, null, 2));
    console.log('================================');
    
    const response = await api.post(USER_ENDPOINTS.REGISTER, userData);
    
    console.log('=== RAW API RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Status text:', response.statusText);
    console.log('Headers:', response.headers);
    console.log('Full response object:', response);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    console.log('========================');
    
    return response.data;
  },

  // Get user profile
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get(USER_ENDPOINTS.PROFILE);
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await api.put(USER_ENDPOINTS.UPDATE_PROFILE, profileData);
    return response.data;
  },

  // Get user cars
  getCars: async (): Promise<any[]> => {
    const response = await api.get(USER_ENDPOINTS.CARS);
    return response.data;
  },

  // Add new car
  addCar: async (carData: any): Promise<any> => {
    const response = await api.post(USER_ENDPOINTS.ADD_CAR, carData);
    return response.data;
  },

  // Update car
  updateCar: async (carId: string, carData: any): Promise<any> => {
    const response = await api.put(USER_ENDPOINTS.UPDATE_CAR(carId), carData);
    return response.data;
  },

  // Delete car
  deleteCar: async (carId: string): Promise<any> => {
    const response = await api.delete(USER_ENDPOINTS.DELETE_CAR(carId));
    return response.data;
  },
};
