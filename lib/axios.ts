import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL, AUTH_ENDPOINTS } from './endpoints';
import { ENV_CONFIG } from '../config/env';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // Increased timeout for file uploads
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Api-Key': ENV_CONFIG.API_KEY,
    'ngrok-skip-browser-warning': 'true', // Bypass ngrok browser warning
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('auth_token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
      }

      // Add requestType: "inbound" only to POST/PUT/PATCH requests
      if (config.method === 'post' || config.method === 'put' || config.method === 'patch') {
        // Skip ALL processing for registration step 4 - using fetch API directly
        if (config.url?.includes('/register/step/4/')) {
          return config; // Return config unchanged
        } else if (config.data instanceof FormData) {

          // Create a new FormData with the proper nested structure
          const wrappedData = new FormData();
          
          // Copy all FormData parts with 'data.' prefix to create nested structure
          for (const [key, value] of (config.data as any)._parts) {
            wrappedData.append(`data.${key}`, value);
          }
          
          // Add requestType at the top level
          wrappedData.append('requestType', 'inbound');
          
          config.data = wrappedData;

          // Let axios set Content-Type for FormData to include boundary
          delete config.headers['Content-Type'];
        } else {
          // Skip wrapping for checkout endpoint (it handles its own structure)
          if (config.url?.includes('/checkout/')) {
          } else {
            // For non-FormData, wrap in { data, requestType }
            const originalData = config.data || {};
            config.data = {
              requestType: 'inbound',
              data: originalData,
            };
          }
        }
      }
    } catch (error) {
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(AUTH_ENDPOINTS.REFRESH_TOKEN, { refresh_token: refreshToken });
          const newToken = response.data.access_token;
          
          await AsyncStorage.setItem('auth_token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'user_data']);
        // Add navigation to login screen if needed
      }
    }
    return Promise.reject(error);
  }
);

export default api;