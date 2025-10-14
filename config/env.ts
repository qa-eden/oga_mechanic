// Environment Configuration
// Copy this file to .env and update the values as needed

export const ENV_CONFIG = {
  // API Configuration
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://YOUR_LOCAL_IP:8000/api/v1',
  API_KEY: process.env.EXPO_PUBLIC_API_KEY || 'DNTc5u8uGCibny1U5LSz6Su7qYnWHfRFTX1yTSBSU3NwJ8w8iYwBZP0pdg46zqoq',
  
  // Environment
  ENV: process.env.EXPO_PUBLIC_ENV || 'development',
  
  // App Configuration
  APP_NAME: process.env.EXPO_PUBLIC_APP_NAME || 'Oga Mechanic',
  APP_VERSION: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
  
  // Feature Flags
  ENABLE_ANALYTICS: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true',
  ENABLE_CRASH_REPORTING: process.env.EXPO_PUBLIC_ENABLE_CRASH_REPORTING === 'true',
  
  // Third-party Services
  GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  STRIPE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  
  // WebSocket Configuration
  WEBSOCKET_URL: process.env.EXPO_PUBLIC_WEBSOCKET_URL || 'wss://api.ogamechanic.com/ws',
  
  // File Upload Configuration
  MAX_FILE_SIZE: parseInt(process.env.EXPO_PUBLIC_MAX_FILE_SIZE || '10485760'),
  ALLOWED_FILE_TYPES: process.env.EXPO_PUBLIC_ALLOWED_FILE_TYPES?.split(',') || ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
} as const;

// Validation
export const validateEnvConfig = () => {
  const required = ['API_URL'];
  const missing = required.filter(key => !ENV_CONFIG[key as keyof typeof ENV_CONFIG]);
  
  if (missing.length > 0) {
    console.warn(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  return missing.length === 0;
};

// Initialize validation
validateEnvConfig();
