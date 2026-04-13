import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL, AUTH_ENDPOINTS } from './endpoints';
import { ENV_CONFIG } from '../config/env';
import { authEvents } from './authEvents';

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

      // Add requestType: "inbound" only to POST/PUT/PATCH requests (skip object-spread on FormData)
      if (['post', 'put', 'patch'].includes(config.method?.toLowerCase() || '')) {
        if (config.data instanceof FormData) {
          config.data.append('requestType', 'inbound');
        } else if (
          config.data !== undefined &&
          config.data !== null &&
          typeof config.data === 'object' &&
          !Array.isArray(config.data)
        ) {
          config.data = {
            ...config.data,
            requestType: 'inbound',
          };
        } else {
          config.data = { requestType: 'inbound' };
        }
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

    // Handle 429 Too Many Requests (Throttling)
    if (error.response?.status === 429) {
      console.warn('⚠️ API throttling detected:', error.response?.data);
      
      // Extract wait time from error message if available
      const detail = error.response?.data?.detail;
      const waitTimeMatch = detail?.match(/(\d+)\s*seconds?/i);
      const waitTime = waitTimeMatch ? parseInt(waitTimeMatch[1]) : 60;
      
      // Add user-friendly error message
      error.userMessage = `Too many requests. Please wait ${waitTime} seconds before trying again.`;
      
      // Don't retry throttled requests automatically
      return Promise.reject(error);
    }

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
        } else {
          // No refresh token available, trigger logout
          authEvents.onUnauthorized.emit();
        }
      } catch (refreshError) {
        // Token refresh failed, clear storage and trigger logout
        await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'user_data']);
        authEvents.onUnauthorized.emit();
      }
    }
    return Promise.reject(error);
  }
);

export default api;