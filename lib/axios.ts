import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL, AUTH_ENDPOINTS } from './endpoints';
import { ENV_CONFIG } from '../config/env';

// Create axios instance with enhanced security
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // Increased timeout for file uploads
  maxRedirects: 1, // Follow redirects only once to prevent loops
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
      }

      // Add requestType: "inbound" only to POST/PUT/PATCH requests
      if (['post', 'put', 'patch'].includes(config.method?.toLowerCase() || '')) {
        config.data = {
          ...config.data,
          requestType: 'inbound',
        };
      }

      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return config;
    }
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
          const response = await axios.post(AUTH_ENDPOINTS.REFRESH_TOKEN, { 
            refresh_token: refreshToken 
          });
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