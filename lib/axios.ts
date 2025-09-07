import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL, AUTH_ENDPOINTS } from './endpoints';
import { ENV_CONFIG } from '../config/env';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Api-Key': ENV_CONFIG.API_KEY,
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('auth_token');
      console.log(`🔑 Token check for ${config.method?.toUpperCase()} ${config.url}:`, token ? 'Found' : 'Not found');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`✅ Authorization header added: Bearer ${token.substring(0, 20)}...`);
      } else {
        console.log(`❌ No token found for ${config.method?.toUpperCase()} ${config.url}`);
      }
      
      // Add requestType: "inbound" only to POST/PUT/PATCH requests
      if (config.method === 'post' || config.method === 'put' || config.method === 'patch') {
        // For POST, PUT, PATCH requests, wrap data in the new format
        const originalData = config.data || {};
        config.data = {
          requestType: "inbound",
          data: originalData
        };
        console.log(`📤 ${config.method?.toUpperCase()} ${config.url} - Wrapped data with requestType: "inbound"`);
      }
      // Note: GET/DELETE requests don't need requestType parameter
    } catch (error) {
      console.error('Error getting auth token:', error);
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
        // Try to refresh token
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(AUTH_ENDPOINTS.REFRESH_TOKEN, { refresh_token: refreshToken });
          const newToken = response.data.access_token;
          
          await AsyncStorage.setItem('auth_token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'user_data']);
        // You can add navigation logic here
      }
    }

    return Promise.reject(error);
  }
);

export default api;
