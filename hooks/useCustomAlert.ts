import { useState, useCallback } from 'react';

interface AlertConfig {
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  showIcon?: boolean;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
  onButtonPress?: () => void;
  buttonText?: string;
}

export const useCustomAlert = () => {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const [visible, setVisible] = useState(false);

  const showAlert = useCallback((config: AlertConfig) => {
    setAlertConfig(config);
    setVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setVisible(false);
    // Clear config after animation completes
    setTimeout(() => {
      setAlertConfig(null);
    }, 300);
  }, []);

  const showSuccess = useCallback((title: string, message: string, options?: Partial<AlertConfig>) => {
    showAlert({ 
      title, 
      message, 
      type: 'success',
      autoDismiss: true,
      autoDismissDelay: 2000,
      ...options 
    });
  }, [showAlert]);

  const showError = useCallback((title: string, message: string, options?: Partial<AlertConfig>) => {
    showAlert({ 
      title, 
      message, 
      type: 'error',
      autoDismiss: false, // Errors should be manually dismissed
      ...options 
    });
  }, [showAlert]);

  const showWarning = useCallback((title: string, message: string, options?: Partial<AlertConfig>) => {
    showAlert({ 
      title, 
      message, 
      type: 'warning',
      autoDismiss: true,
      autoDismissDelay: 3000,
      ...options 
    });
  }, [showAlert]);

  const showInfo = useCallback((title: string, message: string, options?: Partial<AlertConfig>) => {
    showAlert({ 
      title, 
      message, 
      type: 'info',
      autoDismiss: true,
      autoDismissDelay: 2500,
      ...options 
    });
  }, [showAlert]);

  return {
    visible,
    alertConfig,
    hideAlert,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
