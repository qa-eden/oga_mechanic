import { Platform } from 'react-native';
import { ENV_CONFIG } from '../config/env';
import { secureStorage } from './secureStorage';

// Biometric authentication types
export enum BiometricType {
  FINGERPRINT = 'fingerprint',
  FACIAL = 'facial',
  IRIS = 'iris',
  VOICE = 'voice',
}

export enum BiometricAvailability {
  AVAILABLE = 'available',
  NOT_AVAILABLE = 'not_available',
  NOT_ENROLLED = 'not_enrolled',
  NOT_SUPPORTED = 'not_supported',
  PERMISSION_DENIED = 'permission_denied',
}

interface BiometricResult {
  success: boolean;
  error?: string;
  biometricType?: BiometricType;
}

interface BiometricConfig {
  title: string;
  subtitle?: string;
  description?: string;
  fallbackLabel?: string;
  cancelLabel?: string;
  promptMessage?: string;
}

class BiometricAuthManager {
  private isEnabled: boolean;
  private isAvailable: BiometricAvailability | null = null;
  private supportedTypes: BiometricType[] = [];

  constructor() {
    this.isEnabled = ENV_CONFIG.ENABLE_BIOMETRIC_AUTH;
    this.initializeBiometricAuth();
  }

  /**
   * Initialize biometric authentication
   */
  private async initializeBiometricAuth(): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await this.checkAvailability();
    } catch (error) {
      console.error('Failed to initialize biometric auth:', error);
      this.isAvailable = BiometricAvailability.NOT_AVAILABLE;
    }
  }

  /**
   * Check if biometric authentication is available on the device
   */
  async checkAvailability(): Promise<BiometricAvailability> {
    if (!this.isEnabled) {
      this.isAvailable = BiometricAvailability.NOT_AVAILABLE;
      return this.isAvailable;
    }

    try {
      // Simulate biometric availability check
      // In production, use libraries like expo-local-authentication
      
      if (Platform.OS === 'ios') {
        // Check Touch ID / Face ID availability
        this.isAvailable = BiometricAvailability.AVAILABLE;
        this.supportedTypes = [BiometricType.FINGERPRINT, BiometricType.FACIAL];
      } else if (Platform.OS === 'android') {
        // Check fingerprint availability
        this.isAvailable = BiometricAvailability.AVAILABLE;
        this.supportedTypes = [BiometricType.FINGERPRINT];
      } else {
        this.isAvailable = BiometricAvailability.NOT_SUPPORTED;
        this.supportedTypes = [];
      }

      return this.isAvailable;
    } catch (error) {
      console.error('Biometric availability check failed:', error);
      this.isAvailable = BiometricAvailability.NOT_AVAILABLE;
      return this.isAvailable;
    }
  }

  /**
   * Authenticate using biometrics
   */
  async authenticate(config?: BiometricConfig): Promise<BiometricResult> {
    if (!this.isEnabled) {
      return { success: false, error: 'Biometric authentication is disabled' };
    }

    if (this.isAvailable !== BiometricAvailability.AVAILABLE) {
      return { success: false, error: 'Biometric authentication is not available' };
    }

    try {
      const defaultConfig: BiometricConfig = {
        title: 'Authenticate',
        subtitle: 'Use your biometric to continue',
        description: 'Please authenticate to access this feature',
        fallbackLabel: 'Use Password',
        cancelLabel: 'Cancel',
        promptMessage: 'Please authenticate',
        ...config,
      };

      // Simulate biometric authentication
      // In production, use expo-local-authentication
      const result = await this.performBiometricAuth(defaultConfig);
      
      if (result.success) {
        // Store successful authentication timestamp
        await this.recordSuccessfulAuth();
      }

      return result;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      };
    }
  }

  /**
   * Perform the actual biometric authentication
   */
  private async performBiometricAuth(config: BiometricConfig): Promise<BiometricResult> {
    // This is a simulated implementation
    // In production, use expo-local-authentication or similar library
    
    return new Promise((resolve) => {
      // Simulate authentication process
      setTimeout(() => {
        // Simulate 90% success rate
        const success = Math.random() > 0.1;
        
        if (success) {
          resolve({
            success: true,
            biometricType: this.supportedTypes[0],
          });
        } else {
          resolve({
            success: false,
            error: 'Authentication failed. Please try again.',
          });
        }
      }, 1000);
    });
  }

  /**
   * Check if biometric authentication is required for an operation
   */
  async isRequiredForOperation(operation: string): Promise<boolean> {
    try {
      const isEnabled = await secureStorage.getSecureItem('biometric_enabled');
      if (isEnabled !== 'true') return false;

      // Define operations that require biometric authentication
      const sensitiveOperations = [
        'payment',
        'withdraw',
        'delete_account',
        'change_password',
        'transfer_funds',
        'update_payment_method',
      ];

      return sensitiveOperations.some(op => operation.toLowerCase().includes(op));
    } catch (error) {
      console.error('Failed to check biometric requirement:', error);
      return false;
    }
  }

  /**
   * Enable biometric authentication
   */
  async enableBiometric(): Promise<boolean> {
    try {
      const availability = await this.checkAvailability();
      if (availability !== BiometricAvailability.AVAILABLE) {
        return false;
      }

      // Test authentication before enabling
      const testResult = await this.authenticate({
        title: 'Enable Biometric Authentication',
        subtitle: 'Test your biometric to enable this feature',
      });

      if (testResult.success) {
        await secureStorage.setSecureItem('biometric_enabled', 'true');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to enable biometric authentication:', error);
      return false;
    }
  }

  /**
   * Disable biometric authentication
   */
  async disableBiometric(): Promise<void> {
    try {
      await secureStorage.removeSecureItem('biometric_enabled');
    } catch (error) {
      console.error('Failed to disable biometric authentication:', error);
    }
  }

  /**
   * Check if biometric authentication is enabled
   */
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await secureStorage.getSecureItem('biometric_enabled');
      return enabled === 'true';
    } catch (error) {
      console.error('Failed to check biometric status:', error);
      return false;
    }
  }

  /**
   * Record successful authentication for analytics
   */
  private async recordSuccessfulAuth(): Promise<void> {
    try {
      const timestamp = Date.now().toString();
      await secureStorage.setSecureItem('last_biometric_auth', timestamp);
    } catch (error) {
      console.error('Failed to record successful auth:', error);
    }
  }

  /**
   * Get last successful authentication timestamp
   */
  async getLastAuthTime(): Promise<number | null> {
    try {
      const timestamp = await secureStorage.getSecureItem('last_biometric_auth');
      return timestamp ? parseInt(timestamp, 10) : null;
    } catch (error) {
      console.error('Failed to get last auth time:', error);
      return null;
    }
  }

  /**
   * Check if authentication is still valid (within timeout period)
   */
  async isAuthValid(timeoutMs: number = 300000): Promise<boolean> { // 5 minutes default
    try {
      const lastAuth = await this.getLastAuthTime();
      if (!lastAuth) return false;

      const now = Date.now();
      return (now - lastAuth) < timeoutMs;
    } catch (error) {
      console.error('Failed to check auth validity:', error);
      return false;
    }
  }

  /**
   * Get supported biometric types
   */
  getSupportedTypes(): BiometricType[] {
    return [...this.supportedTypes];
  }

  /**
   * Get availability status
   */
  getAvailability(): BiometricAvailability | null {
    return this.isAvailable;
  }

  /**
   * Enable/disable biometric authentication
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }
}

// Export singleton instance
export const biometricAuth = new BiometricAuthManager();

// Export types
export type { BiometricResult, BiometricConfig };
