import api from '../axios';
import { USER_ENDPOINTS, AUTH_ENDPOINTS, BASE_URL, MERCHANT_ENDPOINTS, SERVICE_ENDPOINTS } from '../endpoints';

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
    active_role: Role | null;
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

// Direct registration (simplified flow)
export interface DirectRegisterRequest {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: string;
}

export interface DirectRegisterResponse {
  status: boolean;
  message: string;
  data?: {
    user_id?: string;
    email?: string;
    access?: string;
    refresh?: string;
    user?: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      phone_number: string;
      role: string;
      is_verified: boolean;
    };
    verification_required?: boolean;
    verification_info?: {
      message: string;
      verify_endpoint: string;
      resend_endpoint: string;
    };
  };
  requestTime?: string;
  requestType?: string;
  referenceId?: string;
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
  active_role?: string;
  car_make?: string | null;
  car_model?: string | null;
  car_year?: string | null;
  license_plate?: string | null;
  date_joined?: string;
  last_login?: string | null;
  phone_number?: string;
  dob?: string | null;
  gender?: string | null;
  selfie?: string | null;
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
  dob?: string | null;
  gender?: string | null;
  selfie?: string | null;
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
  data?: {
    access: string;
    refresh: string;
    user: UserProfile & {
      active_role: string;
    };
    id?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
  };
  access?: string;
  refresh?: string;
  user?: UserProfile & {
    active_role: string;
  };
  id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  message: string;
  requestTime: string;
  requestType: string;
  status: boolean;
  referenceId: string;
}

// Merchant Profile specific interfaces
export interface MerchantProfile {
  id: number;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    active_role: string;
    date_joined: string;
    last_login: string | null;
    phone_number: string;
    created_at: string;
    updated_at: string;
    car_make: string | null;
    car_model: string | null;
    car_year: string | null;
    license_plate: string | null;
  };
  location: string | null;
  lga: string | null;
  cac_number: string;
  cac_document: string | null;
  selfie: string | null;
  business_address: string;
  profile_picture: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  is_following?: boolean;
  followers_count?: number;
}

// Merchant Profile API Response
export interface MerchantProfileResponse {
  requestTime: string;
  requestType: string;
  message: string;
  referenceId: string;
  status: boolean;
  data: MerchantProfile;
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

// Change Password Payload
export interface ChangePasswordData {
  requestType: string;
  data: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  };
}

export interface ChangePasswordResponse {
  status: boolean;
  message: string;
  data?: any;
}

// API Functions
export const userAPI = {
  // Change Password
  changePassword: async (passwordData: ChangePasswordData): Promise<ChangePasswordResponse> => {
    const response = await api.post('/users/password/change/', passwordData);
    return response.data;
  },

  // User login
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {


    const response = await api.post(USER_ENDPOINTS.LOGIN, credentials);

    return response.data;
  },

  // User logout
  logout: async (credentials: LogoutCredentials): Promise<any> => {

    const response = await api.post(USER_ENDPOINTS.LOGOUT, credentials);


    return response.data;
  },

  // User registration
  register: async (userData: RegisterData): Promise<RegisterResponse> => {


    const response = await api.post(USER_ENDPOINTS.REGISTER, userData);



    return response.data;
  },

  // Direct registration (simplified flow)
  directRegister: async (userData: DirectRegisterRequest): Promise<DirectRegisterResponse> => {
    const response = await api.post('/users/register/', userData);
    return response.data;
  },

  // Resend verification code
  resendVerificationCode: async (email: string): Promise<{ status: boolean; message: string }> => {
    const response = await api.post('/users/resend-verification-code/', { email });
    return response.data;
  },

  // Verify email code
  verifyEmailCode: async (email: string, code: string): Promise<{ status: boolean; message: string; data?: any }> => {
    const response = await api.post('/users/verify-email-code/', { email, code });
    return response.data;
  },

  // Dynamic step-by-step registration
  registerStep: async (stepId: number, stepData: any, config?: any): Promise<any> => {
    const endpoint = USER_ENDPOINTS.REGISTER_STEP(stepId);


    try {
      const response = await api.post(endpoint, stepData, config);



      return response.data;
    } catch (error: any) {

      throw error;
    }
  },

  registerVehicle: async (vehicleData: RegisterStep3VehicleData): Promise<any> => {


    const response = await api.post(USER_ENDPOINTS.REGISTER_VEHICLE, vehicleData);



    return response.data;
  },

  // Get user profile
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get(USER_ENDPOINTS.PROFILE);
    return response.data;
  },

  // Get role-specific profile (now uses primary profile for all roles)
  getRoleProfile: async (role?: string): Promise<UserProfile | MerchantProfileResponse> => {
    // Use primary profile endpoint for all roles
    const response = await api.get<UserProfile | MerchantProfileResponse>(USER_ENDPOINTS.PROFILE);
    return response.data;
  },

  // Get primary user profile
  getPrimaryProfile: async (): Promise<PrimaryUserProfileResponse> => {


    try {
      const response = await api.get(USER_ENDPOINTS.PRIMARY_PROFILE);

      return response.data;
    } catch (error: any) {

      throw error;
    }
  },

  // Get merchant profile
  getMerchantProfile: async (): Promise<MerchantProfileResponse> => {


    try {
      const response = await api.get(MERCHANT_ENDPOINTS.PROFILE);

      return response.data;
    } catch (error: any) {

      throw error;
    }
  },

  // Get mechanic profile
  getMechanicProfile: async (): Promise<any> => {
    try {
      const response = await api.get('/users/profile/mechanic/');
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Get merchant profile by UUID
  getMerchantProfileByUuid: async (merchantUuid: string): Promise<MerchantProfileResponse> => {
    const endpoint = `users/profile/merchant/?merchant_user_uuid=${merchantUuid}`;

    try {
      const response = await api.get(endpoint);

      return response.data;
    } catch (error: any) {

      throw error;
    }
  },

  // Follow merchant
  followMerchant: async (merchantId: string): Promise<any> => {
    const payload = {
      requestType: "inbound",
      data: {
        merchant_id: merchantId
      }
    };
    const response = await api.post(SERVICE_ENDPOINTS.FOLLOW_MERCHANT, payload);
    return response.data;
  },

  // Unfollow merchant
  unfollowMerchant: async (merchantId: string): Promise<any> => {
    const response = await api.delete(`${SERVICE_ENDPOINTS.FOLLOW_MERCHANT}?merchant_id=${merchantId}`);
    return response.data;
  },

  // Get followed merchants
  getFollowedMerchants: async (): Promise<any> => {
    const response = await api.get(SERVICE_ENDPOINTS.FOLLOWED_MERCHANTS);
    return response.data;
  },

  // Get user roles
  getUserRoles: async (): Promise<UserRolesResponse> => {

    
    try {
      const response = await api.get(USER_ENDPOINTS.ROLES);

      return response.data;
    } catch (error: any) {

      throw error;
    }
  },

  // Switch active role or add new role
  switchRole: async (activeRoleId: number | null, addRoles?: number[]): Promise<any> => {
    
    try {
      const payload: any = {};

      if (activeRoleId) {
        payload.active_role_id = activeRoleId;
      }

      if (addRoles && addRoles.length > 0) {
        payload.add_roles = addRoles;
      }

      const response = await api.put(USER_ENDPOINTS.ROLES, payload);

      return response.data;
    } catch (error: any) {

      throw error;
    }
  },

  // Get all available roles
  getAllRoles: async (): Promise<any> => {

    
    try {
      const response = await api.get(AUTH_ENDPOINTS.ALL_ROLES);

      return response.data;
    } catch (error: any) {

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

  // Get single car by ID
  getCarById: async (carId: string): Promise<any> => {
    const response = await api.get(`${USER_ENDPOINTS.CARS}/${carId}`);
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

  // Rent car
  rentCar: async (rentalData: any): Promise<any> => {


    try {
      const response = await api.post(USER_ENDPOINTS.RENT_CAR, rentalData);

      return response.data;
    } catch (error: any) {

      throw error;
    }
  },

  // Get notifications
  getNotifications: async (): Promise<any> => {
    try {
      const response = await api.get(USER_ENDPOINTS.NOTIFICATIONS);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Get a specific notification
  getNotification: async (id: number | string): Promise<any> => {
    try {
      const response = await api.get(USER_ENDPOINTS.NOTIFICATION_DETAIL(id));
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Mark notification as read
  markNotificationAsRead: async (id: number | string): Promise<any> => {
    try {
      const response = await api.patch(USER_ENDPOINTS.NOTIFICATION_DETAIL(id), {
        is_read: true,
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Mark all notifications as read
  markAllNotificationsAsRead: async (): Promise<any> => {
    try {
      const response = await api.patch(USER_ENDPOINTS.NOTIFICATION_MARK_ALL_READ);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
};
