import api from '../axios';
import { USER_ENDPOINTS } from '../endpoints';

// Types
export interface LoginCredentials {
  email?: string;
  phone_number?: string;
  password: string;
}

export interface LogoutCredentials {
  refresh: string;
}

export interface Role {
  id: string;
  name: string;
  display_name: string;
  description?: string;
}

export interface UserRolesResponse {
  requestTime: string;
  requestType: string;
  referenceId: string;
  status: boolean;
  message: string;
  data: {
    roles: Role[];
    active_role: string | null;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  roles: number[];
}

// Step-by-step registration interfaces
export interface RegisterStep1Data {
  role_id: number;
}

export interface RegisterStep2Data {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
}

export interface RegisterStep3VehicleData {
  vin?: string;
  model?: string;
  modelYear?: string;
  vehicleType?: string;
  engineType?: string;
  transmission?: string;
  bodyStyle?: string;
  color?: string;
}

export interface RegisterStep3Data {
  password: string;
  password_confirm: string;
}

export interface RegisterStep4Data {
  password: string;
  password_confirm: string;
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

export interface PrimaryUserProfileData {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  is_verified: boolean;
  active_role: string;
  car_make: string;
  car_model: string;
  car_year: number | null;
  license_plate: string;
  date_joined: string;
  location?: string;
  profile_image?: string;
}

export interface PrimaryUserProfileResponse {
  requestTime: string;
  requestType: string;
  data: PrimaryUserProfileData;
  active_role: string;
  message: string;
  referenceId: string;
  status: boolean;
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
    console.log('=== LOGIN API REQUEST ===');
    console.log('Endpoint:', USER_ENDPOINTS.LOGIN);
    console.log('Request data:', JSON.stringify(credentials, null, 2));
    console.log('=========================');
    
    const response = await api.post(USER_ENDPOINTS.LOGIN, credentials);
    
    console.log('=== LOGIN API RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    console.log('==========================');
    
    return response.data;
  },

  // User logout
  logout: async (credentials: LogoutCredentials): Promise<any> => {
    console.log('=== LOGOUT API REQUEST ===');
    console.log('Endpoint:', USER_ENDPOINTS.LOGOUT);
    console.log('Request data:', JSON.stringify(credentials, null, 2));
    console.log('==========================');
    
    const response = await api.post(USER_ENDPOINTS.LOGOUT, credentials);
    
    console.log('=== LOGOUT API RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    console.log('===========================');
    
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

  // Dynamic step-by-step registration
  registerStep: async (stepId: number, stepData: any): Promise<any> => {
    const endpoint = USER_ENDPOINTS.REGISTER_STEP(stepId);
    console.log(`=== STEP ${stepId} REGISTRATION API REQUEST ===`);
    console.log('Endpoint:', endpoint);
    console.log('Request data:', JSON.stringify(stepData, null, 2));
    console.log('===============================================');
    
    const response = await api.post(endpoint, stepData);
    
    console.log(`=== STEP ${stepId} API RESPONSE ===`);
    console.log('Status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    console.log('===================================');
    
    return response.data;
  },

  registerVehicle: async (vehicleData: RegisterStep3VehicleData): Promise<any> => {
    console.log('=== VEHICLE REGISTRATION API REQUEST ===');
    console.log('Endpoint:', USER_ENDPOINTS.REGISTER_VEHICLE);
    console.log('Request data:', JSON.stringify(vehicleData, null, 2));
    console.log('========================================');
    
    const response = await api.post(USER_ENDPOINTS.REGISTER_VEHICLE, vehicleData);
    
    console.log('=== VEHICLE API RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    console.log('============================');
    
    return response.data;
  },

  // Get user profile
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get(USER_ENDPOINTS.PROFILE);
    return response.data;
  },

  // Get primary user profile
  getPrimaryProfile: async (): Promise<PrimaryUserProfileResponse> => {
    console.log('=== PRIMARY PROFILE API REQUEST ===');
    console.log('Endpoint:', USER_ENDPOINTS.PRIMARY_PROFILE);
    console.log('===================================');
    
    try {
      const response = await api.get(USER_ENDPOINTS.PRIMARY_PROFILE);
      console.log('=== PRIMARY PROFILE API RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Response data:', JSON.stringify(response.data, null, 2));
      console.log('====================================');
      return response.data;
    } catch (error: any) {
      console.log('=== PRIMARY PROFILE API ERROR ===');
      console.log('Error status:', error.response?.status);
      console.log('Error data:', JSON.stringify(error.response?.data, null, 2));
      console.log('Error message:', error.message);
      console.log('=================================');
      throw error;
    }
  },

  // Get user roles
  getUserRoles: async (): Promise<UserRolesResponse> => {
    console.log('=== USER ROLES API REQUEST ===');
    console.log('Endpoint:', USER_ENDPOINTS.ROLES);
    console.log('===============================');
    
    try {
      const response = await api.get(USER_ENDPOINTS.ROLES);
      console.log('=== USER ROLES API RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Response data:', JSON.stringify(response.data, null, 2));
      console.log('================================');
      return response.data;
    } catch (error: any) {
      console.log('=== USER ROLES API ERROR ===');
      console.log('Error status:', error.response?.status);
      console.log('Error data:', JSON.stringify(error.response?.data, null, 2));
      console.log('Error message:', error.message);
      console.log('=============================');
      throw error;
    }
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
