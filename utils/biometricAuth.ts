import { Platform, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { ENV_CONFIG } from '../config/env';
import { secureStorage } from './secureStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        this.isAvailable = BiometricAvailability.NOT_SUPPORTED;
        return this.isAvailable;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        this.isAvailable = BiometricAvailability.NOT_ENROLLED;
        return this.isAvailable;
      }

      this.isAvailable = BiometricAvailability.AVAILABLE;

      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      this.supportedTypes = types.map(t => {
        if (t === LocalAuthentication.AuthenticationType.FINGERPRINT) return BiometricType.FINGERPRINT;
        if (t === LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) return BiometricType.FACIAL;
        if (t === LocalAuthentication.AuthenticationType.IRIS) return BiometricType.IRIS;
        return BiometricType.FINGERPRINT; // fallback
      });

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

    // Force an availability check if not already performed
    if (this.isAvailable === null) {
      await this.checkAvailability();
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
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: config.promptMessage || config.title || 'Authenticate to continue',
        fallbackLabel: config.fallbackLabel || 'Use Passcode',
        cancelLabel: config.cancelLabel,
        disableDeviceFallback: false,
      });

      if (result.success) {
        return {
          success: true,
          biometricType: this.supportedTypes[0] || BiometricType.FINGERPRINT,
        };
      } else {
        return {
          success: false,
          error: ('error' in result ? result.error : undefined) || 'Authentication failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
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
      await AsyncStorage.setItem('biometric_enabled', 'true');
      console.log('[BiometricAuth] Biometric enabled flag set to true');
      return true;
    } catch (error) {
      console.error('[BiometricAuth] Failed to enable biometric:', error);
      return false;
    }
  }

  /**
   * Disable biometric authentication
   */
  async disableBiometric(): Promise<void> {
    try {
      await AsyncStorage.removeItem('biometric_enabled');
      console.log('[BiometricAuth] Biometric enabled flag removed');
    } catch (error) {
      console.error('[BiometricAuth] Failed to disable biometric:', error);
    }
  }

  /**
   * Check if biometric authentication is enabled
   */
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem('biometric_enabled');
      console.log('[BiometricAuth] Biometric enabled check:', enabled);
      return enabled === 'true';
    } catch (error) {
      console.error('[BiometricAuth] Failed to check biometric status:', error);
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
   * Get preferred biometric type (FACIAL or FINGERPRINT)
   */
  async getPreferredBiometricType(): Promise<BiometricType> {
    if (this.isAvailable === null) {
      await this.checkAvailability();
    }
    if (this.supportedTypes.includes(BiometricType.FACIAL)) {
      return BiometricType.FACIAL;
    }
    return BiometricType.FINGERPRINT;
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

  /**
   * Save biometric credentials using AsyncStorage directly
   * (SecureStore can silently fail on dev builds without keychain entitlements)
   */
  async saveCredentials(credentials: any): Promise<void> {
    try {
      const json = JSON.stringify(credentials);
      await AsyncStorage.setItem('biometric_credentials', json);
      console.log('[BiometricAuth] Credentials saved successfully. Keys:', Object.keys(credentials));
    } catch (error) {
      console.error('[BiometricAuth] Failed to save credentials:', error);
    }
  }

  /**
   * Retrieve biometric credentials from AsyncStorage directly
   */
  async getCredentials(): Promise<any | null> {
    try {
      const creds = await AsyncStorage.getItem('biometric_credentials');
      console.log('[BiometricAuth] Raw credentials from storage:', creds ? 'found (' + creds.length + ' chars)' : 'null');
      return creds ? JSON.parse(creds) : null;
    } catch (error) {
      console.error('[BiometricAuth] Failed to get credentials:', error);
      return null;
    }
  }

  /**
   * Clear biometric credentials from AsyncStorage
   */
  async clearCredentials(): Promise<void> {
    try {
      await AsyncStorage.removeItem('biometric_credentials');
      console.log('[BiometricAuth] Credentials cleared');
    } catch (error) {
      console.error('[BiometricAuth] Failed to clear credentials:', error);
    }
  }
}

// Export singleton instance
export const biometricAuth = new BiometricAuthManager();

// Export types
export type { BiometricResult, BiometricConfig };
