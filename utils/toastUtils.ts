import { Toast } from 'toastify-react-native';

// Custom toast utility with proper icon handling
export const showToast = {
  success: (message: string) => {
    Toast.success(message);
  },

  error: (message: string) => {
    Toast.error(message);
  },

  info: (message: string) => {
    Toast.info(message);
  },

  warn: (message: string) => {
    Toast.warn(message);
  },
};
